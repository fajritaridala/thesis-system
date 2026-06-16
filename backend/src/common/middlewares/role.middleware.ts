import { NextFunction, Response } from "express";
import { ReqUser } from "../../modules/auth/auth.dto";

const roleGuard = (roles: string) => {
  return (req: ReqUser, res: Response, next: NextFunction) => {
    console.log(req.user);
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      console.log("Error di roleGuard middleware");
      return res.status(403).json({
        message: "akses ditolak",
        data: null,
      });
    }

    next();
  };
};

export default roleGuard;
