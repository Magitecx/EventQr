import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email(),
  password: z.string().min(6),
});

export const switchOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(2),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});
