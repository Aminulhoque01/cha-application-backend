import { Readable } from "stream";

import { v2 as cloudinary } from "cloudinary";

import { AttachmentType, IAttachment } from "./message.interface";

const getAttachmentType = (mimeType: string): AttachmentType => {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  return "file";
};

const getCloudinaryResourceType = (type: AttachmentType) => {
  if (type === "image") {
    return "image";
  }

  if (type === "video") {
    return "video";
  }

  return "raw";
};

const getFolder = (type: AttachmentType) => {
  return `chat-app/messages/${type}s`;
};

export const uploadMessageFileToCloudinary = async (
  file: Express.Multer.File,
): Promise<IAttachment> => {
  const type = getAttachmentType(file.mimetype);

  const resourceType = getCloudinaryResourceType(type);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: getFolder(type),

        resource_type: resourceType,

        use_filename: true,

        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error("Cloudinary upload failed"));
        }

        resolve({
          type,

          url: result.secure_url,

          publicId: result.public_id,

          fileName: file.originalname,

          mimeType: file.mimetype,

          size: file.size,
        });
      },
    );

    Readable.from(file.buffer).pipe(uploadStream).on("error", reject);
  });
};

export const uploadMultipleMessageFiles = async (
  files: Express.Multer.File[],
): Promise<IAttachment[]> => {
  return Promise.all(files.map(uploadMessageFileToCloudinary));
};

export const deleteMessageAttachmentFromCloudinary = async (
  attachment: IAttachment,
) => {
  let resourceType: "image" | "video" | "raw";

  if (attachment.type === "image") {
    resourceType = "image";
  } else if (attachment.type === "video" || attachment.type === "audio") {
    resourceType = "video";
  } else {
    resourceType = "raw";
  }

  try {
    const result = await cloudinary.uploader.destroy(attachment.publicId, {
      resource_type: resourceType,
    });

    console.log("Cloudinary delete result:", result);

    return result;
  } catch (error) {
    console.error(
      `Failed to delete Cloudinary file: ${attachment.publicId}`,
      error,
    );

    throw error;
  }
};

export const deleteMultipleMessageAttachments = async (
  attachments: IAttachment[],
) => {
  if (!attachments.length) {
    return;
  }

  const results = await Promise.allSettled(
    attachments.map(deleteMessageAttachmentFromCloudinary),
  );

  const failed = results.filter((result) => result.status === "rejected");

  if (failed.length > 0) {
    console.error(
      `${failed.length} attachment(s) could not be deleted from Cloudinary`,
    );
  }

  return results;
};
