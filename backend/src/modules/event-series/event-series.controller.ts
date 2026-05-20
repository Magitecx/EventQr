import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { successResponse } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { touchOrganizationActivity } from "../organizations/organizations.activity";
import { createEventSeriesSchema, createEventSessionSchema } from "./event-series.schemas";

export const listEventSeries = asyncHandler(async (request, response) => {
  const organizationId = request.auth!.organizationId as string;

  const eventSeries = await prisma.eventSeries.findMany({
    where: {
      organizationId,
    },
    include: {
      sessions: {
        orderBy: {
          sessionDate: "asc",
        },
      },
      _count: {
        select: {
          sessions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  response.json(successResponse(eventSeries));
});

export const createEventSeries = asyncHandler(async (request, response) => {
  const body = createEventSeriesSchema.parse(request.body);
  const organizationId = request.auth!.organizationId as string;

  const eventSeries = await prisma.eventSeries.create({
    data: {
      name: body.name,
      description: body.description,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      organizationId,
    },
  });

  await touchOrganizationActivity(organizationId);

  response.status(201).json(successResponse(eventSeries, "Event series created"));
});

export const getEventSeries = asyncHandler(async (request, response) => {
  const eventSeriesId = request.params.id as string;
  const organizationId = request.auth!.organizationId as string;

  const eventSeries = await prisma.eventSeries.findFirst({
    where: {
      id: eventSeriesId,
      organizationId,
    },
    include: {
      sessions: {
        orderBy: {
          sessionDate: "asc",
        },
        include: {
          _count: {
            select: {
              attendance: true,
            },
          },
        },
      },
    },
  });

  if (!eventSeries) {
    throw new ApiError(404, "Event series not found");
  }

  response.json(successResponse(eventSeries));
});

export const createEventSession = asyncHandler(async (request, response) => {
  const eventSeriesId = request.params.id as string;
  const body = createEventSessionSchema.parse(request.body);
  const organizationId = request.auth!.organizationId as string;

  const eventSeries = await prisma.eventSeries.findFirst({
    where: {
      id: eventSeriesId,
      organizationId,
    },
  });

  if (!eventSeries) {
    throw new ApiError(404, "Event series not found");
  }

  const session = await prisma.eventSession.create({
    data: {
      eventSeriesId: eventSeries.id,
      title: body.title,
      description: body.description,
      sessionDate: new Date(body.sessionDate),
    },
  });

  await touchOrganizationActivity(organizationId);

  response.status(201).json(successResponse(session, "Session created"));
});
