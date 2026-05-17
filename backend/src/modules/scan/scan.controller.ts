import { prisma } from "../../lib/prisma";
import { successResponse } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { checkInSchema } from "./scan.schemas";

export const checkIn = asyncHandler(async (request, response) => {
  const body = checkInSchema.parse(request.body);

  const [session, attendee] = await Promise.all([
    prisma.eventSession.findFirst({
      where: {
        id: body.eventSessionId,
        eventSeries: {
          organizationId: request.auth!.organizationId,
        },
      },
    }),
    prisma.attendee.findFirst({
      where: {
        qrToken: body.qrToken,
      },
    }),
  ]);

  if (!session) {
    return response.json(
      successResponse(
        {
          status: "wrong_event_session",
        },
        "Event session not found",
      ),
    );
  }

  if (!attendee || attendee.deletedAt) {
    return response.json(
      successResponse(
        {
          status: "invalid_qr",
        },
        "Invalid QR",
      ),
    );
  }

  if (attendee.organizationId !== request.auth!.organizationId) {
    return response.json(
      successResponse(
        {
          status: "wrong_event_session",
          attendee: {
            id: attendee.id,
            name: attendee.name,
            profileImageUrl: attendee.profileImageUrl,
          },
        },
        "Attendee does not belong to this event organization",
      ),
    );
  }

  const existingRecord = await prisma.attendanceRecord.findUnique({
    where: {
      attendeeId_eventSessionId: {
        attendeeId: attendee.id,
        eventSessionId: session.id,
      },
    },
  });

  if (existingRecord) {
    return response.json(
      successResponse(
        {
          status: "already_checked_in",
          attendee: {
            id: attendee.id,
            name: attendee.name,
            email: attendee.email,
            profileImageUrl: attendee.profileImageUrl,
          },
          checkedInAt: existingRecord.checkedInAt,
        },
        "Attendee already checked in",
      ),
    );
  }

  const record = await prisma.attendanceRecord.create({
    data: {
      attendeeId: attendee.id,
      eventSessionId: session.id,
    },
  });

  response.status(201).json(
    successResponse(
      {
        status: "success",
        attendee: {
          id: attendee.id,
          name: attendee.name,
          email: attendee.email,
          profileImageUrl: attendee.profileImageUrl,
        },
        checkedInAt: record.checkedInAt,
      },
      "Check-in successful",
    ),
  );
});
