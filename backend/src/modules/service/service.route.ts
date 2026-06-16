import { Router } from "express";
import auth from "../../common/middlewares/auth.middleware";
import roleGuard from "../../common/middlewares/role.middleware";
import { ROLES } from "../../common/utils/constants";
import serviceController from "./service.controller";

const router: Router = Router();

router.get("/", serviceController.findAll);
router.post("/", [auth.user, roleGuard(ROLES.ADMIN), serviceController.create]);
router.patch("/:serviceId", [
  auth.user,
  roleGuard(ROLES.ADMIN),
  serviceController.update,
]);
router.delete("/:serviceId", serviceController.remove);

export default router;
