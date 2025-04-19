"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = __importDefault(require("../config"));
cloudinary_1.v2.config({
    cloud_name: config_1.default.cloudinary.cloudName,
    api_key: config_1.default.cloudinary.apiKey,
    api_secret: config_1.default.cloudinary.apiSecret,
});
exports.default = cloudinary_1.v2;
const uploadImage = (file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file)
        throw new Error("Missing required parameter - file");
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload_stream({ folder: "Assignment06_(PH_Course)" }, (error, result) => {
            if (error)
                return reject(error);
            resolve({
                publicId: result === null || result === void 0 ? void 0 : result.public_id,
                url: result === null || result === void 0 ? void 0 : result.secure_url
            });
        }).end(file.buffer);
    });
});
exports.uploadImage = uploadImage;
const deleteImage = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.destroy(publicId);
        console.log("Cloudinary Image Delete Status: ", result.result);
        if (result.result === "ok") {
            return "Image deleted successfully";
        }
        else {
            throw new Error("Failed to delete image");
        }
    }
    catch (error) {
        console.error(error);
        throw new Error("Image deletion failed");
    }
});
exports.deleteImage = deleteImage;
