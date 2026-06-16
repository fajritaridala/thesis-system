import { Request } from "express";
import * as yup from "yup";
import { UserToken } from "./auth.interface";

const userLoginSchema = yup.object().shape({
  address: yup.string().required("address wajib terisi"),
});

const userRegisterSchema = userLoginSchema.shape({
  username: yup
    .string()
    .required("username wajib diisi")
    .min(3, "username minimal 3 karakter"),
  email: yup.string().email("email tidak valid").required("email wajib diisi"),
  roleToken: yup.string().optional(),
});

// types
type UserLoginDto = yup.InferType<typeof userLoginSchema>;
type UserRegisterDto = yup.InferType<typeof userRegisterSchema>;

interface ReqUser extends Request {
  user?: UserToken | undefined;
}

export { userLoginSchema, userRegisterSchema };
export type { ReqUser, UserLoginDto, UserRegisterDto };
