import { Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export interface ILogin {
  address: string;
}

export interface IRegister extends ILogin {
  username: string;
  email: string;
  roleToken?: string;
}

export interface UserExt extends User {
  address?: string;
  accessToken?: string;
  needsRegistration?: boolean;
}

export interface SessionExt extends Session {
  user?: {
    address: string;
    username: string;
    email: string;
    role: string;
    accessToken?: string;
    needsRegistration?: boolean;
  };
}

export interface JwtExt extends JWT {
  user?: UserExt;
  role?: string;
}
