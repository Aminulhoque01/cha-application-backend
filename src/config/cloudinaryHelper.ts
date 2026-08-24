import cloudinary from "../config/cloudinary";

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<{
  secure_url: string;
  public_id: string;
}> => {
  return new Promise(
    (resolve, reject) => {
      const stream =
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
                  "Cloudinary upload failed"
                )
              );
              return;
            }

            resolve({
              secure_url:
                result.secure_url,
              public_id:
                result.public_id,
            });
          }
        );

      stream.end(buffer);
    }
  );
};