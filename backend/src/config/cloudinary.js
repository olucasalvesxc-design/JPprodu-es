const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: 'video', // Cloudinary usa 'video' para áudio
    folder: 'spottunner/audios',
    allowed_formats: ['mp3', 'wav', 'ogg', 'm4a'],
  },
});

const demoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: 'video',
    folder: 'spottunner/demos',
    allowed_formats: ['mp3', 'wav', 'ogg', 'm4a'],
  },
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const uploadDemo = multer({
  storage: demoStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = { cloudinary, uploadAudio, uploadDemo };
