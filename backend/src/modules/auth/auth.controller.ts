import { Request, Response } from "express";
import response from "../../common/utils/response";
import {
  type ReqUser,
  type UserLoginDto,
  type UserRegisterDto,
  userLoginSchema,
  userRegisterSchema,
} from "./auth.dto";
import authService from "./auth.service";

const authController = {
  loginUser: async (req: Request, res: Response) => {
    const body: UserLoginDto = await userLoginSchema.validate(req.body);
    const result = await authService.loginUser(body);
    if (!result) {
      return response.success(
        res,
        body.address,
        "address tidak ditemukan",
        true,
      );
    }
    return response.success(res, result, "login berhasil");
  },
  registerUser: async (req: Request, res: Response) => {
    const body: UserRegisterDto = await userRegisterSchema.validate(req.body);
    const result = await authService.registerUser(body);
    return response.success(res, result, "registrasi berhasil");
  },
  getProfile: async (req: ReqUser, res: Response) => {
    const address: UserLoginDto = await userLoginSchema.validate({
      address: req.user?.address,
    });
    const user = await authService.getProfile(address);
    return response.success(res, user, "profile berhasil ditemukan");
  },
};

export default authController;
