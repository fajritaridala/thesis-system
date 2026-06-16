import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadMiddleware = {
  single: (fieldName: string) => upload.single(fieldName),
};

export default uploadMiddleware;
