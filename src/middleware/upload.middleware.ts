import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".jfif",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".tif",
  ".tiff",
  ".avif",
  ".heic",
  ".heif",
];

export const uploadAvatar = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    callback,
  ) => {
    console.log("Uploaded file:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const isImageMime =
      file.mimetype.startsWith("image/");

    const isImageExtension =
      allowedExtensions.includes(extension);

    if (
      isImageMime ||
      isImageExtension
    ) {
      callback(null, true);
      return;
    }

    callback(
      new Error(
        "Only image files are allowed",
      ),
    );
  },
});