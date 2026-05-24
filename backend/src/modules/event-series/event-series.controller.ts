import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { successResponse } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { touchOrganizationActivity } from "../organizations/organizations.activity";
import {
  createEventSeriesSchema,
  createEventSessionSchema,
  updateEventSeriesSchema,
  updateEventSessionSchema,
} from "./event-series.schemas";

async function requireScopedSeries(eventSeriesId: string, organizationId: string) {
  const eventSeries = await prisma.eventSeries.findFirst({
    where: {
      id: eventSeriesId,
      organizationId,
    },
  });

  if (!eventSeries) {
    throw new ApiError(404, "Event series not found");
  }

  return eventSeries;
}

async function requireScopedSession(eventSeriesId: string, sessionId: string, organizationId: string) {
  const session = await prisma.eventSession.findFirst({
    where: {
      id: sessionId,
      eventSeriesId,
      eventSeries: {
        organizationId,
      },
    },
  });

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  return session;
}

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

  const eventSeries = await requireScopedSeries(eventSeriesId, organizationId);

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

export const updateEventSeries = asyncHandler(async (request, response) => {
  const eventSeriesId = request.params.id as string;
  const organizationId = request.auth!.organizationId as string;
  const body = updateEventSeriesSchema.parse(request.body);

  await requireScopedSeries(eventSeriesId, organizationId);

  const eventSeries = await prisma.eventSeries.update({
    where: {
      id: eventSeriesId,
    },
    data: {
      name: body.name,
      description: body.description,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  });

  await touchOrganizationActivity(organizationId);

  response.json(successResponse(eventSeries, "Event series updated"));
});

export const deleteEventSeries = asyncHandler(async (request, response) => {
  const eventSeriesId = request.params.id as string;
  const organizationId = request.auth!.organizationId as string;

  await requireScopedSeries(eventSeriesId, organizationId);

  await prisma.$transaction([
    prisma.attendanceRecord.deleteMany({
      where: {
        eventSession: {
          eventSeriesId,
        },
      },
    }),
    prisma.eventSession.deleteMany({
      where: {
        eventSeriesId,
      },
    }),
    prisma.eventSeries.delete({
      where: {
        id: eventSeriesId,
      },
    }),
  ]);

  await touchOrganizationActivity(organizationId);

  response.json(successResponse(null, "Event series deleted"));
});

export const updateEventSession = asyncHandler(async (request, response) => {
  const eventSeriesId = request.params.id as string;
  const sessionId = request.params.sessionId as string;
  const organizationId = request.auth!.organizationId as string;
  const body = updateEventSessionSchema.parse(request.body);

  await requireScopedSession(eventSeriesId, sessionId, organizationId);

  const session = await prisma.eventSession.update({
    where: {
      id: sessionId,
    },
    data: {
      title: body.title,
      description: body.description,
      sessionDate: new Date(body.sessionDate),
    },
  });

  await touchOrganizationActivity(organizationId);

  response.json(successResponse(session, "Session updated"));
});

export const deleteEventSession = asyncHandler(async (request, response) => {
  const eventSeriesId = request.params.id as string;
  const sessionId = request.params.sessionId as string;
  const organizationId = request.auth!.organizationId as string;

  await requireScopedSession(eventSeriesId, sessionId, organizationId);

  await prisma.$transaction([
    prisma.attendanceRecord.deleteMany({
      where: {
        eventSessionId: sessionId,
      },
    }),
    prisma.eventSession.delete({
      where: {
        id: sessionId,
      },
    }),
  ]);

  await touchOrganizationActivity(organizationId);

  response.json(successResponse(null, "Session deleted"));
});
