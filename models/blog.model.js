const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        caption: { type: String, default: "" },
      },
    ],
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
    },
    published_at: {
      type: Date,
      default: Date.now,
    },
    shared_badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserBadge",
      },
    ],
    ratings: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual để tính average rating
blogSchema.virtual("averageRating").get(function () {
  if (this.ratings.length === 0) return 0;
  const total = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
  return (total / this.ratings.length).toFixed(1);
});

// Virtual để tính số lượng rating
blogSchema.virtual("ratingCount").get(function () {
  return this.ratings.length;
});

// Đảm bảo virtual fields được include trong JSON
blogSchema.set("toJSON", { virtuals: true });
blogSchema.set("toObject", { virtuals: true });

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
