import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  changePassword,
  getMe,
  login,
  register,
  switchOrganization,
  updateAccount,
} from "./auth.controller";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get("/me", requireAuth, getMe);
authRouter.post("/switch-organization", requireAuth, switchOrganization);
authRouter.patch("/account", requireAuth, updateAccount);
authRouter.post("/change-password", requireAuth, changePassword);

export { authRouter };
