import { Router } from "express";
import auth from "../../common/middlewares/auth.middleware";
import roleGuard from "../../common/middlewares/role.middleware";
import { ROLES } from "../../common/utils/constants";
import scheduleController from "./schedule.controller";

const router: Router = Router();

// Admin routes
router.get("/admin", [
  auth.user,
  roleGuard(ROLES.ADMIN),
  scheduleController.findAllAdmin,
]);

router.post("/", [
  auth.user,
  roleGuard(ROLES.ADMIN),
  scheduleController.create,
]);

router.patch("/:scheduleId/update", [
  auth.user,
  roleGuard(ROLES.ADMIN),
  scheduleController.update,
]);

router.patch("/:scheduleId/delete", [
  auth.user,
  roleGuard(ROLES.ADMIN),
  scheduleController.remove,
]);

// Public routes
router.get("/", scheduleController.findAllPublic);

export default router;
