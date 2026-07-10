import 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      uploadedFile?: {
        url: string;
        publicId: string;
        mimetype: string;
        size: number;
        originalName: string;
      };
    }
  }
}