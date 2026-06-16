import { Request, Response, Router } from "express";
import getDiffBits from "./AE";

const router: Router = Router();
router.post("/", (req: Request, res: Response) => {
  const { h0, h1 } = req.body as { h0: string; h1: string };
  console.log(h0, h1);
  const result = getDiffBits(h0, h1);
  res.json(result);
});

export default router;
