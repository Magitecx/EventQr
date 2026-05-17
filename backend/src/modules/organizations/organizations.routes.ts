import { Router } from "express";
import { requireActiveOrganization, requireAuth } from "../../middleware/auth";
import {
  acceptInvite,
  createInvite,
  createOrganization,
  getCurrentOrganization,
  getInvitePublicInfo,
  getOrganizations,
  joinOrganization,
  regenerateJoinCode,
  updateCurrentOrganization,
} from "./organizations.controller";

const organizationsRouter = Router();
const publicOrganizationsRouter = Router();

publicOrganizationsRouter.get("/invites/:token", getInvitePublicInfo);

organizationsRouter.use(requireAuth);
organizationsRouter.get("/", getOrganizations);
organizationsRouter.post("/", createOrganization);
organizationsRouter.post("/join", joinOrganization);
organizationsRouter.post("/invites/:token/accept", acceptInvite);
organizationsRouter.get("/current", requireActiveOrganization, getCurrentOrganization);
organizationsRouter.patch("/current", requireActiveOrganization, updateCurrentOrganization);
organizationsRouter.post(
  "/current/regenerate-join-code",
  requireActiveOrganization,
  regenerateJoinCode,
);
organizationsRouter.post("/current/invites", requireActiveOrganization, createInvite);

export { organizationsRouter, publicOrganizationsRouter };
