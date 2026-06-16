import * as yup from "yup";

const userSchema = yup.object().shape({
  _id: yup.string().required("id user tidak ditemukan"),
});
type UserDto = yup.InferType<typeof userSchema>;

export { userSchema };
export type { UserDto };
