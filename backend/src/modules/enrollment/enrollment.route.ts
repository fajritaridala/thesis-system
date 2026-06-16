import { Router } from "express";
import auth from "../../common/middlewares/auth.middleware";
import roleGuard from "../../common/middlewares/role.middleware";
import uploadMiddleware from "../../common/middlewares/upload.middleware";
import { ROLES } from "../../common/utils/constants";
import enrollmentController from "./enrollment.controller";

const router: Router = Router();

router.get("/", [
  auth.user,
  roleGuard(ROLES.ADMIN),
  enrollmentController.findAll,
]);

router.get("/:scheduleId", [
  auth.user,
  roleGuard(ROLES.ADMIN),
  enrollmentController.getScheduleParticipants,
]);

router.post("/:scheduleId", [
  auth.user,
  uploadMiddleware.single("file"),
  roleGuard(ROLES.PESERTA),
  enrollmentController.register,
]);

router.patch("/:enrollId/approval", [
  auth.user,
  roleGuard(ROLES.ADMIN),
  enrollmentController.approval,
]);

router.patch("/:enrollId/:participantId/submit-score", [
  auth.user,
  roleGuard(ROLES.ADMIN),
  enrollmentController.submitScore,
]);

router.patch("/:enrollId/:participantId/blockchain-success", [
  auth.user,
  roleGuard(ROLES.ADMIN),
  enrollmentController.blockchainSuccess,
]);

export default router;
