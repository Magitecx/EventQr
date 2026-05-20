import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { successResponse } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { generateQrToken } from "../../utils/qr-token";
import { createAttendeeSchema, updateAttendeeSchema } from "./attendees.schemas";
import { removeStoredAttendeeImage, saveAttendeeImage } from "./attendees.upload";

function getRequestBody(request: { body?: Record<string, unknown> }) {
  const body = request.body ?? {};

  return {
    name: typeof body.name === "string" ? body.name : undefined,
    email: typeof body.email === "string" ? body.email : undefined,
    phone: typeof body.phone === "string" ? body.phone : undefined,
    removeProfileImage:
      typeof body.removeProfileImage === "string"
        ? body.removeProfileImage === "true"
        : Boolean(body.removeProfileImage),
  };
}

export const listAttendees = asyncHandler(async (request, response) => {
  const organizationId = request.auth!.organizationId as string;

  const attendees = await prisma.attendee.findMany({
    where: {
      organizationId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  response.json(successResponse(attendees));
});

export const createAttendee = asyncHandler(async (request, response) => {
  const body = createAttendeeSchema.parse(getRequestBody(request));
  const organizationId = request.auth!.organizationId as string;
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      name: true,
    },
  });

  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  const image = await saveAttendeeImage({
    attendeeName: body.name,
    organizationName: organization.name,
    file: request.file,
  });

  const attendee = await prisma.attendee.create({
    data: {
      ...body,
      organizationId,
      qrToken: generateQrToken(),
      profileImageUrl: image?.publicUrl,
    },
  });

  response.status(201).json(successResponse(attendee, "Attendee created"));
});

export const getAttendee = asyncHandler(async (request, response) => {
  const attendeeId = request.params.id as string;
  const organizationId = request.auth!.organizationId as string;

  const attendee = await prisma.attendee.findFirst({
    where: {
      id: attendeeId,
      organizationId,
    },
    include: {
      attendance: {
        include: {
          eventSession: {
            include: {
              eventSeries: true,
            },
          },
        },
        orderBy: {
          checkedInAt: "desc",
        },
      },
    },
  });

  if (!attendee) {
    throw new ApiError(404, "Attendee not found");
  }

  response.json(successResponse(attendee));
});

export const updateAttendee = asyncHandler(async (request, response) => {
  const attendeeId = request.params.id as string;
  const { removeProfileImage, ...body } = updateAttendeeSchema.parse(getRequestBody(request));
  const organizationId = request.auth!.organizationId as string;

  const existing = await prisma.attendee.findFirst({
    where: {
      id: attendeeId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Attendee not found");
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      name: true,
    },
  });

  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  const image = await saveAttendeeImage({
    attendeeName: body.name ?? existing.name,
    organizationName: organization.name,
    file: request.file,
  });
  const shouldRemoveProfileImage = removeProfileImage && !image?.publicUrl;

  if (image?.publicUrl) {
    await removeStoredAttendeeImage(existing.profileImageUrl);
  }

  if (shouldRemoveProfileImage) {
    await removeStoredAttendeeImage(existing.profileImageUrl);
  }

  const attendee = await prisma.attendee.update({
    where: {
      id: existing.id,
    },
    data: {
      ...body,
      profileImageUrl: image?.publicUrl ? image.publicUrl : shouldRemoveProfileImage ? null : existing.profileImageUrl,
    },
  });

  response.json(successResponse(attendee, "Attendee updated"));
});

export const deleteAttendee = asyncHandler(async (request, response) => {
  const attendeeId = request.params.id as string;
  const organizationId = request.auth!.organizationId as string;

  const existing = await prisma.attendee.findFirst({
    where: {
      id: attendeeId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Attendee not found");
  }

  await prisma.attendee.update({
    where: {
      id: existing.id,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  await removeStoredAttendeeImage(existing.profileImageUrl);

  response.json(successResponse(null, "Attendee deleted"));
});
