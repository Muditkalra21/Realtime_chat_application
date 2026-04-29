import cloudinary from "../config/cloudinary.js";

/**
 * Upload a buffer to Cloudinary and return the result.
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Cloudinary destination folder
 * @returns {Promise<object>} Cloudinary upload result
 */
export const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};
