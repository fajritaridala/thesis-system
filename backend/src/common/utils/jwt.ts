import { sign, verify } from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env";
import { UserToken } from "../../modules/auth/auth.interface";

const jwt = {
  generateToken: (payload: UserToken) => {
    // JWT_SECRET is validated at startup in config/env.ts
    const token = sign(payload, JWT_SECRET!, {
      expiresIn: "1d",
    });
    return token;
  },
  getUser: (token: string): UserToken | null => {
    try {
      // JWT_SECRET is validated at startup in config/env.ts
      const user = verify(token, JWT_SECRET!) as UserToken;
      return user;
    } catch (error) {
      // Token invalid atau expired - return null, auth middleware akan handle unauthorized
      return null;
    }
  },
};

export default jwt;

