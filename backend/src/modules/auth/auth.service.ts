import { ROLES } from "../../common/utils/constants";
import jwt from "../../common/utils/jwt";
import { ADMIN_TOKEN } from "../../config/env";
import type { UserLoginDto, UserRegisterDto } from "./auth.dto";
import type { User } from "./auth.interface";
import UserModel from "./auth.model";

const authService = {
  loginUser: async (body: UserLoginDto) => {
    const address = body.address;
    const user = await UserModel.findOne({ address }).lean();
    if (!user) {
      return null;
    } else {
      const token = jwt.generateToken({
        _id: user._id,
        address: user.address,
        role: user.role,
      });

      return token;
    }
  },
  registerUser: async (body: UserRegisterDto) => {
    let role = ROLES.PESERTA;
    if (body.roleToken === ADMIN_TOKEN) role = ROLES.ADMIN;

    const data: User = {
      address: body.address,
      username: body.username,
      email: body.email,
      role,
    };

    const user = await UserModel.create(data);

    const result = {
      address: user.address,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    return result;
  },
  getProfile: async (body: UserLoginDto) => {
    const user = await UserModel.findOne({ address: body.address })
      .select("address username email role")
      .sort({ createdAt: -1 })
      .lean();
    if (!user) throw new Error("user tidak ditemukan");
    return user;
  },
};

export default authService;
