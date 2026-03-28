import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../../shared/config/CloudinaryConfig'; // Use the new config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'version-vault/profiles',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    // This ensures avatars are resized on upload to save storage!
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  } as any,
});
export const upload = multer({ storage: storage });
