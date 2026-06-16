import { Response } from "express";
import response from "../../common/utils/response";
import { ReqUser } from "../auth/auth.dto";
import { UserDto, userSchema } from "./dtos/user.req";
import userService from "./user.service";

const userController = {
  findActivity: async (req: ReqUser, res: Response) => {
    const user: UserDto = await userSchema.validate(req.user);
    const participantId = user._id;
    const result = await userService.findActivity(participantId);
    return response.success(res, result, "berhasil mendapatkan aktivitas");
  },
};

export default userController;
