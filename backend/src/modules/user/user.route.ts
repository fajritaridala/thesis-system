import { Router } from "express";
import auth from "../../common/middlewares/auth.middleware";
import roleGuard from "../../common/middlewares/role.middleware";
import { ROLES } from "../../common/utils/constants";
import userController from "./user.controller";

const router: Router = Router();

router.get("/activity", [
  auth.user,
  roleGuard(ROLES.PESERTA),
  userController.findActivity
])

export default router;