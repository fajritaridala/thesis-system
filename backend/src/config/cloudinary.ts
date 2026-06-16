import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "./env";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const cloudinaryConfig = {
  toDataUrl: (file: Express.Multer.File) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataUrl = `data:${file.mimetype};base64,${b64}`;
    return dataUrl;
  },
  getPublicIdFromFileUrl: (fileUrl: string) => {
    const fileNameUsingSubstring = fileUrl.substring(
      fileUrl.lastIndexOf("/") + 1,
    );
    const publicID = fileNameUsingSubstring.substring(
      0,
      fileNameUsingSubstring.lastIndexOf("."),
    );
    return publicID;
  },
};

export default cloudinaryConfig;
