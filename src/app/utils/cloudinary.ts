import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import { Express } from "express";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export default cloudinary;

export const uploadImage = async (file: Express.Multer.File) => {
    if (!file) throw new Error("Missing required parameter - file");
  
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "Assignment06_(PH_Course)" }, 
        (error, result) => {
          if (error) return reject(error);
          resolve({
            publicId: result?.public_id,
            url: result?.secure_url
          });
        }
      ).end(file.buffer); 
    });
  };


export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary Image Delete Status: ",result.result);
    if (result.result === "ok") {
      return "Image deleted successfully";
    } else {
      throw new Error("Failed to delete image");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Image deletion failed");
  }
};
