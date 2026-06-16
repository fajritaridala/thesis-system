import { NextFunction, Request, Response } from "express";
import { ReqUser } from "../../modules/auth/auth.dto";
import jwt from "../utils/jwt";
import response from "../utils/response";

const auth = {
  user: async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers?.authorization;
    if (!authorization) return response.unauthorized(res);

    const [prefix, accessToken] = authorization.split(" ");
    if (!(prefix === "Bearer")) return response.unauthorized(res);

    const user = jwt.getUser(accessToken);
    if (!user) return response.unauthorized(res);
    
    (req as ReqUser).user = user;
    next();
  },
  optional: (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers?.authorization;
    if (authorization) {
      const [prefix, accessToken] = authorization.split(" ");
      if (!(prefix === "Bearer" && accessToken))
        return response.unauthorized(res);

      const user = jwt.getUser(accessToken);
      if (!user) return response.unauthorized(res);

      (req as ReqUser).user = user;
      next();
    } else {
      next();
    }
  },
};

export default auth;
