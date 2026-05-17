import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { successResponse } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { generateQrToken } from "../../utils/qr-token";
import { createAttendeeSchema, updateAttendeeSchema } from "./attendees.schemas";

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
  const body = createAttendeeSchema.parse(request.body);
  const organizationId = request.auth!.organizationId as string;

  const attendee = await prisma.attendee.create({
    data: {
      ...body,
      organizationId,
      qrToken: generateQrToken(),
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
  const body = updateAttendeeSchema.parse(request.body);
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

  const attendee = await prisma.attendee.update({
    where: {
      id: existing.id,
    },
    data: body,
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

  response.json(successResponse(null, "Attendee deleted"));
});
