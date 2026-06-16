import { Router, Request, Response } from "express";
import authRoutes from "../../modules/auth/auth.route";
import enrollmentRoutes from "../../modules/enrollment/enrollment.route";
import scheduleRoutes from "../../modules/schedule/schedule.route";
import serviceRoutes from "../../modules/service/service.route";
import aeRoutes from "../../modules/testing/AE.route";
import userRoutes from "../../modules/user/user.route";
import verificationRoutes from "../../modules/verification/verify.route";
import checkHealth from "./healthCheck";

const router: Router = Router();

router.get("/check-health", async (req: Request, res: Response) => {
  const [isCloudinaryHealthy, isPinataHealthy, isDbHealthy] = await Promise.all([
    checkHealth.claudinary(),
    checkHealth.pinata(),
    checkHealth.database(),
  ]);

  const isAllHealthy = isDbHealthy && isCloudinaryHealthy && isPinataHealthy;

  res.status(isAllHealthy ? 200 : 503).json({
    status: isAllHealthy ? "UP" : "DEGRADED",
    timestamp: new Date().toISOString(),
    checks: {
      database: isDbHealthy ? "Connected" : "Disconnected",
      pinata: isPinataHealthy ? "Connected" : "Disconnected",
      cloudinary: isCloudinaryHealthy ? "Connected" : "Disconnected",
    },
  });
});

router.use("/auth", authRoutes);
router.use("/services", serviceRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/verifications", verificationRoutes);
router.use("/users", userRoutes);
router.use("/ae-testing", aeRoutes);

export default router;
