import { Router } from "express";

import {
  login,
  me,
} from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

 
const authRouter = Router();

authRouter.post("/login", login);

authRouter.get("/me", authMiddleware, me);

export default authRouter;