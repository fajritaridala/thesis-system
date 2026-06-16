import { Router } from "express";
import auth from "../../common/middlewares/auth.middleware";
import authController from "./auth.controller";

const router: Router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/profile", [auth.user, authController.getProfile]);

export default router;
