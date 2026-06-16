import mongoose from "mongoose";
import { ROLES } from "../../common/utils/constants";
import type { User } from "./auth.interface";

const Schema = mongoose.Schema;

const UserSchema = new Schema<User>(
  {
    address: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    username: {
      type: Schema.Types.String,
      required: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    role: {
      type: Schema.Types.String,
      enum: [ROLES.PESERTA, ROLES.ADMIN],
      default: ROLES.PESERTA,
    },
  },
  {
    discriminatorKey: "role",
    collection: "users",
    timestamps: true,
  },
);

// const PesertaSchema = new Schema<Peserta>({
//   hash: Schema.Types.String,
//   cidCertificate: Schema.Types.String,
//   registrationData: {
//     _id: false,
//     type: {
//       fullName: Schema.Types.String,
//       gender: Schema.Types.String,
//       birthDate: Schema.Types.Date,
//       phoneNumber: Schema.Types.String,
//       NIM: Schema.Types.String,
//       faculty: Schema.Types.String,
//       major: Schema.Types.String,
//     },
//   },
// });

const UserModel = mongoose.model<User>("users", UserSchema);
// const PesertaModel = UserModel.discriminator<Peserta>(
//   ROLES.PESERTA,
//   PesertaSchema,
// );
// const AdminModel = UserModel.discriminator<User>(ROLES.ADMIN, UserSchema);

export default UserModel;
