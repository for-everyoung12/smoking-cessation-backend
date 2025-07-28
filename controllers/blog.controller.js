const Blog = require("../models/blog.model");
const UserBadge = require("../models/userBadge.model");
const Comment = require("../models/comment.model");
const Category = require("../models/category.model");
const Tag = require("../models/tag.model");
const { cloudinary } = require("../utils/cloudinary");

// Tạo blog với hình ảnh, category, tags, isFeatured
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      description,
      shared_badges,
      status = "published",
      category,
      tags,
    } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    // Xử lý hình ảnh từ multer
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({
          url: file.path,
          public_id: file.filename,
          caption: req.body[`caption_${file.fieldname}`] || "",
        });
      });
    }

    // Xử lý shared badges
    let validBadges = [];
    if (shared_badges && shared_badges.length > 0) {
      validBadges = await UserBadge.find({
        _id: { $in: shared_badges },
        user_id: req.user.id,
      });
    }

    // Xử lý category
    let categoryId = null;
    if (category) {
      const foundCategory = await Category.findById(category);
      if (!foundCategory)
        return res.status(400).json({ message: "Invalid category" });
      categoryId = foundCategory._id;
    }

    // Xử lý tags
    let tagIds = [];
    if (tags && Array.isArray(tags)) {
      const foundTags = await Tag.find({ _id: { $in: tags } });
      tagIds = foundTags.map((t) => t._id);
    }

    const blog = new Blog({
      title,
      content,
      description: description || "",
      images,
      author_id: req.user.id,
      shared_badges: validBadges.map((b) => b._id),
      status,
      category: categoryId,
      tags: tagIds,
    });

    await blog.save();
    await blog.populate("author_id", "full_name profilePicture");
    await blog.populate("category", "name slug");
    await blog.populate("tags", "name slug");

    res.status(201).json({
      message: "Blog created successfully",
      blog,
    });
  } catch (err) {
    console.error("Create blog error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách blog với filter nâng cao
exports.getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { author, status, search, category, tag, sort } = req.query;

    // Build filter
    let filter = { status: "published" };
    if (author) filter.author_id = author;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sort: newest, featured, popular
    let sortOption = { published_at: -1 };
    if (sort === "featured") sortOption = { isFeatured: -1, published_at: -1 };
    if (sort === "popular") sortOption = { viewCount: -1, published_at: -1 };
    if (sort === "oldest") sortOption = { published_at: 1 };

    const blogs = await Blog.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("author_id", "full_name profilePicture")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .populate("shared_badges");

    const total = await Blog.countDocuments(filter);

    const blogsWithExtras = await Promise.all(
      blogs.map(async (blog) => {
        const blogObj = blog.toObject();
        const userRating = req.user
          ? blogObj.ratings.find(
              (rating) => rating.user_id.toString() === req.user.id
            )
          : null;
        return {
          ...blogObj,
          userRating: userRating ? userRating.rating : null,
          averageRating: blog.averageRating,
          ratingCount: blog.ratingCount,
        };
      })
    );

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      blogs: blogsWithExtras,
    });
  } catch (err) {
    console.error("🔥 getBlogs error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết blog, tăng viewCount
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author_id", "full_name profilePicture")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .populate("shared_badges");

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Tăng viewCount
    blog.viewCount = (blog.viewCount || 0) + 1;
    await blog.save();

    // Kiểm tra user đã rating chưa
    const userRating = req.user
      ? blog.ratings.find((rating) => rating.user_id.toString() === req.user.id)
      : null;

    const blogObj = blog.toObject();

    res.json({
      blog: {
        ...blogObj,
        userRating: userRating ? userRating.rating : null,
      },
      averageRating: blog.averageRating,
      ratingCount: blog.ratingCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Rate blog
exports.rateBlog = async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating phải từ 1-5 sao" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Kiểm tra user đã rating chưa
    const existingRatingIndex = blog.ratings.findIndex(
      (r) => r.user_id.toString() === req.user.id
    );

    if (existingRatingIndex !== -1) {
      // Cập nhật rating cũ
      blog.ratings[existingRatingIndex].rating = rating;
      blog.ratings[existingRatingIndex].created_at = new Date();
    } else {
      // Thêm rating mới
      blog.ratings.push({
        user_id: req.user.id,
        rating: rating,
        created_at: new Date(),
      });
    }

    await blog.save();

    res.json({
      message:
        existingRatingIndex !== -1
          ? "Cập nhật rating thành công"
          : "Rating thành công",
      averageRating: blog.averageRating,
      ratingCount: blog.ratingCount,
      userRating: rating,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user rating for blog
exports.getUserRating = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const userRating = blog.ratings.find(
      (r) => r.user_id.toString() === req.user.id
    );

    res.json({
      userRating: userRating ? userRating.rating : null,
      averageRating: blog.averageRating,
      ratingCount: blog.ratingCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update blog (category, tags, isFeatured)
exports.updateBlog = async (req, res) => {
  try {
    const { title, content, description, status, category, tags } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.author_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    // Xử lý hình ảnh mới nếu có
    const newImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        newImages.push({
          url: file.path,
          public_id: file.filename,
          caption: req.body[`caption_${file.fieldname}`] || "",
        });
      });
    }
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (description !== undefined) blog.description = description;
    if (status) blog.status = status;
    if (category) {
      const foundCategory = await Category.findById(category);
      if (!foundCategory)
        return res.status(400).json({ message: "Invalid category" });
      blog.category = foundCategory._id;
    }
    if (tags && Array.isArray(tags)) {
      const foundTags = await Tag.find({ _id: { $in: tags } });
      blog.tags = foundTags.map((t) => t._id);
    }
    if (newImages.length > 0) {
      blog.images = [...blog.images, ...newImages];
    }
    await blog.save();
    await blog.populate("author_id", "full_name profilePicture");
    await blog.populate("category", "name slug");
    await blog.populate("tags", "name slug");
    res.json({ message: "Blog updated successfully", blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Xóa hình ảnh từ Cloudinary
    if (blog.images && blog.images.length > 0) {
      for (const image of blog.images) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
      }
    }

    await blog.deleteOne();
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa hình ảnh từ blog
exports.deleteImage = async (req, res) => {
  try {
    const { blogId, imageIndex } = req.params;
    const blog = await Blog.findById(blogId);

    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.author_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const index = parseInt(imageIndex);
    if (index < 0 || index >= blog.images.length) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    const imageToDelete = blog.images[index];

    // Xóa từ Cloudinary
    try {
      await cloudinary.uploader.destroy(imageToDelete.public_id);
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
    }

    // Xóa khỏi array
    blog.images.splice(index, 1);
    await blog.save();

    res.json({ message: "Image deleted successfully", blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Share badge
exports.shareBadges = async (req, res) => {
  try {
    const { shared_badges } = req.body;
    if (!shared_badges || !Array.isArray(shared_badges)) {
      return res
        .status(400)
        .json({ message: "shared_badges must be an array" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const validBadges = await UserBadge.find({
      _id: { $in: shared_badges },
      user_id: req.user.id,
    });

    if (validBadges.length === 0) {
      return res.status(400).json({ message: "No valid badges to share" });
    }

    const currentBadges = blog.shared_badges.map((b) => b.toString());
    validBadges.forEach((b) => {
      if (!currentBadges.includes(b._id.toString())) {
        blog.shared_badges.push(b._id);
      }
    });

    await blog.save();
    res.json({
      message: "Badges shared successfully",
      shared_badges: blog.shared_badges,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy blog của user
exports.getMyBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    let filter = { author_id: req.user.id };
    if (status) {
      filter.status = status;
    }

    const blogs = await Blog.find(filter)
      .sort({ published_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author_id", "full_name profilePicture")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .populate("shared_badges");

    const total = await Blog.countDocuments(filter);

    const blogsWithExtras = await Promise.all(
      blogs.map(async (blog) => {
        const blogObj = blog.toObject();
        const commentCount = await Comment.countDocuments({
          blog_id: blog._id,
        });

        return {
          ...blogObj,
          likeCount: blogObj.likes?.length || 0,
          commentCount,
        };
      })
    );

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      blogs: blogsWithExtras,
    });
  } catch (err) {
    console.error("getMyBlogs error:", err);
    res.status(500).json({ message: err.message });
  }
};
