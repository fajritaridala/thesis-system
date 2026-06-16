import { Types } from "mongoose";

interface User {
  address: string;
  username: string;
  email: string;
  role: string;
}

interface UserToken {
  _id: Types.ObjectId | string;
  address: string;
  role: string;
}

export type { User, UserToken };
