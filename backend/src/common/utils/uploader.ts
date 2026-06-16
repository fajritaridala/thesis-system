import { v2 as cloudinary } from "cloudinary";
import { UploadResponse } from "pinata";
import cloudinaryConfig from "../../config/cloudinary";
import pinata from "../../config/pinata";
import { EnrollPinataJson } from "../../modules/enrollment/enrollment.interface";

const uploader = {
  cloudinary: {
    uploadFile: async (file: Express.Multer.File, fullName: string) => {
      const fileDataUrl = cloudinaryConfig.toDataUrl(file);
      const filename_override = `bukti-pembayaran-${fullName}`;
      const image = await cloudinary.uploader.upload(fileDataUrl, {
        folder: "TOEFL/bukti-pembayaran",
        filename_override,
        use_filename: true,
        resource_type: "auto",
      });
      return image;
    },
    remove: async (imageId: string) => {
      const result = await cloudinary.uploader.destroy(imageId);
      if (result.result !== "ok")
        throw new Error(
          `[Cloudinary Warning] gagal menghapus ${imageId}: ${result.result}`,
        );
      console.log("[Cloudinary Deleted] :", result.result);
      return result;
    },
  },
  pinata: {
    json: async (
      data: EnrollPinataJson,
      fileName: string,
    ): Promise<UploadResponse> => {
      const result = await pinata.upload.public.json({
        content: data,
        name: fileName,
      });
      return result;
    },
    verify: async (cid: string) => {
      const result = await pinata.gateways.private.get(cid);
      return result;
    },
  },
};

export default uploader;
