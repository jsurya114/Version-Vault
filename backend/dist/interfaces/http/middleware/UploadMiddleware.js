"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const CloudinaryConfig_1 = __importDefault(require("../../../shared/config/CloudinaryConfig")); // Use the new config
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: CloudinaryConfig_1.default,
    params: {
        folder: 'version-vault/profiles',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        // This ensures avatars are resized on upload to save storage!
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    },
});
exports.upload = (0, multer_1.default)({ storage: storage });
