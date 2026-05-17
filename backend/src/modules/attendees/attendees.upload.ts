import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { ApiError } from "../../utils/api-error";

const uploadDir = path.join(process.cwd(), "uploads");

const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export const attendeeImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export async function saveAttendeeImage(file?: Express.Multer.File | null) {
  if (!file) {
    return null;
  }

  const extension = allowedMimeTypes.get(file.mimetype);

  if (!extension) {
    throw new ApiError(400, "Unsupported image format");
  }

  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID()}.${extension}`;
  const absolutePath = path.join(uploadDir, filename);

  await writeFile(absolutePath, file.buffer);

  return {
    filename,
    publicUrl: `/uploads/${filename}`,
    absolutePath,
  };
}

export async function removeStoredAttendeeImage(imageUrl?: string | null) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) {
    return;
  }

  const filename = path.basename(imageUrl);
  const absolutePath = path.join(uploadDir, filename);

  try {
    await unlink(absolutePath);
  } catch {
    // Ignore cleanup errors for deleted files.
  }
}
