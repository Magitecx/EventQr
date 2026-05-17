import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalString = z
  .string()
  .trim()
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createAttendeeSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  phone: optionalString,
  profileImageUrl: optionalUrl,
});

export const updateAttendeeSchema = createAttendeeSchema.partial();
