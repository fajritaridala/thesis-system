import { Router } from "express";
import verifyController from "./verify.controller";

const router: Router = Router();

router.get("/", verifyController.certificate);

export default router;
