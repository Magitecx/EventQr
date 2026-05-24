import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  changePassword,
  forgotPassword,
  getMe,
  login,
  logout,
  refreshAuth,
  register,
  resetPassword,
  switchOrganization,
  updateAccount,
} from "./auth.controller";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/refresh", refreshAuth);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/me", requireAuth, getMe);
authRouter.post("/switch-organization", requireAuth, switchOrganization);
authRouter.patch("/account", requireAuth, updateAccount);
authRouter.post("/change-password", requireAuth, changePassword);

export { authRouter };
