import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().min(1),
  ORGANIZATION_INACTIVE_WARNING_DAYS: z.coerce.number().int().positive().default(75),
  ORGANIZATION_HARD_DELETE_DAYS: z.coerce.number().int().positive().default(90),
  ORGANIZATION_CLEANUP_INTERVAL_MINUTES: z.coerce.number().int().positive().default(60),
});

export const env = envSchema.parse(process.env);
export const corsOrigins = env.CORS_ORIGIN.split(",").map((value) => value.trim());
