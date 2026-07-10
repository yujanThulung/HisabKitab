import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { imageStorage, fileStorage } from "../config/cloudinary";

const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const FILE_MAX_SIZE = 50 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_FILE_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    "video/mp4", "video/webm",
    "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
];

// Normalized shape what controllers always read       
export interface UploadedFile {
    url: string;
    publicId: string;
    mimetype: string;
    size: number;
    originalName: string;
}

// Normalizer - runs after multer, before the controller
const normalizeUpload = (req: Request, _res: Response, next: NextFunction): void => {
    if (req.file) {
        req.uploadedFile = {
            url: (req.file as any).path,       // Cloudinary secure URL
            publicId: (req.file as any).filename,   // Cloudinary public_id
            mimetype: req.file.mimetype,
            size: req.file.size,
            originalName: req.file.originalname,
        };
    }
    next();
};

// image upload 
const imageMulter = multer({
    storage: imageStorage,
    limits: { fileSize: IMAGE_MAX_SIZE },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            return cb(new Error("Only image files are allowed for images"));
        }
        cb(null, true);
    },
});

// File/media upload 
const fileMulter = multer({
    storage: fileStorage,
    limits: { fileSize: FILE_MAX_SIZE },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
            return cb(new Error("File type not supported"));
        }
        cb(null, true);
    },
});

// Exported as arrays so normalizeUpload always runs after multer
export const uploadimage = [imageMulter.single("image"), normalizeUpload];
export const uploadFile = [fileMulter.single("file"), normalizeUpload];

//Shared error handler 
export const handleUploadError = (
    err: any,
    _req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({ message: "File too large" });
            return;
        }
        res.status(400).json({ message: `Upload error: ${err.message}` });
        return;
    }
    if (err) {
        res.status(400).json({ message: err.message || "File upload failed" });
        return;
    }
    next();
};