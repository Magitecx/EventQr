import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { successResponse } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  switchOrganizationSchema,
  updateAccountSchema,
} from "./auth.schemas";
import { buildAuthPayload, requireMembership } from "./auth.utils";
import { touchOrganizationActivity } from "../organizations/organizations.activity";

export const login = asyncHandler(async (request, response) => {
  const credentials = loginSchema.parse(request.body);

  const user = await prisma.user.findUnique({
    where: {
      email: credentials.email,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordValid = await bcrypt.compare(credentials.password, user.passwordHash);

  if (!passwordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const payload = await buildAuthPayload(user.id);

  if (payload.activeOrganizationId) {
    await touchOrganizationActivity(payload.activeOrganizationId);
  }

  response.json(successResponse(payload));
});

export const register = asyncHandler(async (request, response) => {
  const body = registerSchema.parse(request.body);

  const existingUser = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already in use");
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const createdUser = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
    },
  });

  response
    .status(201)
    .json(successResponse(await buildAuthPayload(createdUser.id, null), "Account created"));
});

export const getMe = asyncHandler(async (request, response) => {
  if (request.auth!.organizationId) {
    await touchOrganizationActivity(request.auth!.organizationId);
  }

  response.json(successResponse(await buildAuthPayload(request.auth!.userId, request.auth!.organizationId)));
});

export const switchOrganization = asyncHandler(async (request, response) => {
  const body = switchOrganizationSchema.parse(request.body);
  await requireMembership(request.auth!.userId, body.organizationId);
  await touchOrganizationActivity(body.organizationId);

  response.json(
    successResponse(
      await buildAuthPayload(request.auth!.userId, body.organizationId),
      "Active organization updated",
    ),
  );
});

export const updateAccount = asyncHandler(async (request, response) => {
  const body = updateAccountSchema.parse(request.body);

  await prisma.user.update({
    where: {
      id: request.auth!.userId,
    },
    data: {
      name: body.name,
    },
  });

  response.json(
    successResponse(
      await buildAuthPayload(request.auth!.userId, request.auth!.organizationId),
      "Account updated",
    ),
  );
});

export const changePassword = asyncHandler(async (request, response) => {
  const body = changePasswordSchema.parse(request.body);

  const user = await prisma.user.findUnique({
    where: {
      id: request.auth!.userId,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const passwordValid = await bcrypt.compare(body.currentPassword, user.passwordHash);

  if (!passwordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  const newPasswordHash = await bcrypt.hash(body.newPassword, 10);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  response.json(successResponse(null, "Password updated"));
});
