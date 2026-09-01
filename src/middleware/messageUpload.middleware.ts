import multer from "multer";

const storage =
  multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] =
  (
    _req,
    file,
    cb,
  ) => {
    const allowedMimeTypes = [
      // Images
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",

      // Videos
      "video/mp4",
      "video/webm",
      "video/quicktime",

      // Audio
      "audio/mpeg",
      "audio/wav",
      "audio/webm",
      "audio/ogg",

      // Documents
      "application/pdf",
      "application/msword",

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

      "application/vnd.ms-excel",

      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

      "text/plain",
    ];

    if (
      allowedMimeTypes.includes(
        file.mimetype,
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Unsupported file type",
        ),
      );
    }
  };

export const uploadMessageFiles =
  multer({
    storage,

    fileFilter,

    limits: {
      fileSize:
        100 * 1024 * 1024,

      files: 10,
    },
  });