const multer = require("multer");
const { cloudinary, blogImageStorage } = require("../utils/cloudinary");

// Tạo multer upload middleware cho blog images
const uploadBlogImages = multer({
  storage: blogImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Kiểm tra file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file hình ảnh!"), false);
    }
  },
});

// Middleware xử lý upload nhiều hình ảnh cho blog
const uploadImages = uploadBlogImages.array("images", 10); // Tối đa 10 hình

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File quá lớn. Kích thước tối đa là 5MB.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Quá nhiều file. Tối đa 10 hình ảnh.",
      });
    }
  }

  if (err.message === "Chỉ chấp nhận file hình ảnh!") {
    return res.status(400).json({ error: err.message });
  }

  next(err);
};

module.exports = {
  uploadImages,
  handleUploadError,
  cloudinary,
};
