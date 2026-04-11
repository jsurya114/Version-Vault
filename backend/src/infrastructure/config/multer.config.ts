import multer from 'multer';
import fs from 'fs';
import path from 'path';

const tempUploadDir = path.resolve('./temp_uploads');

// Setup temporary storage for uploaded files before they are written to Git objects
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    // Preserve the original name to avoid file loss, prepend with random string
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '_' + file.originalname);
  },
});

export const uploadRepoFiles = multer({ storage });
