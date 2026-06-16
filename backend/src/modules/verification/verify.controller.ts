import { Response } from "express";
import response from "../../common/utils/response";
import { ReqUser } from "../auth/auth.dto";
import { VerifyDto, verifySchema } from "./verify.dto";
import verifyService from "./verify.service";

const verifyController = {
  certificate: async (req: ReqUser, res: Response) => {
    const cid: VerifyDto = await verifySchema.validate(req.body);
    const result = await verifyService.certificate(cid);
    return response.success(res, result, "berhasil mendapatkan data");
  },
};

export default verifyController;
