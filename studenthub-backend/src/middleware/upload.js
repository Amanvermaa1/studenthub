const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "studenthub",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const rawStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "studenthub/attachments",
    resource_type: "raw",
    allowed_formats: ["pdf", "doc", "docx", "zip"],
  },
});

const upload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG/PNG/WEBP images allowed for posts"), false);
  },
});

const uploadRaw = multer({
  storage: rawStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
      "application/x-zip-compressed",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, DOC, DOCX, ZIP files allowed for attachments"), false);
  },
});

module.exports = { upload, uploadRaw };