import * as crypto from 'crypto';
import * as fs from 'fs';
import * as multer from 'multer';

export function md5(str: string) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}

export const storage = multer.diskStorage({
  destination(req, file, callback) {
    try {
      fs.mkdirSync('uploads');
    } catch (error) {}
    callback(null, 'uploads');
  },
  filename(req, file, callback) {
    const uniqueSuffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname;
    callback(null, uniqueSuffix);
  },
});
