const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage cho user avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_avatars",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// Storage cho blog images
const blogImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog-images",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 1000, height: 1000, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  },
});

module.exports = {
  cloudinary,
  avatarStorage,
  blogImageStorage,
};
