import { UploadApiResponse } from "cloudinary";

import cloudinary from "../config/cloudinary";

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },

        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(
              new Error(
                "Cloudinary upload failed",
              ),
            );
            return;
          }

          resolve(result);
        },
      );

    uploadStream.end(buffer);
  });
};