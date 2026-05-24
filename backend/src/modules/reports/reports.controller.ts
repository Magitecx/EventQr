import { stringify } from "csv-stringify/sync";
import XLSX from "xlsx";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { successResponse } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";

async function buildAttendanceReport(seriesId: string, organizationId: string) {
  const series = await prisma.eventSeries.findFirst({
    where: {
      id: seriesId,
      organizationId,
    },
    include: {
      sessions: {
        orderBy: {
          sessionDate: "asc",
        },
      },
    },
  });

  if (!series) {
    throw new ApiError(404, "Event series not found");
  }

  const attendees = await prisma.attendee.findMany({
    where: {
      organizationId,
    },
    include: {
      attendance: {
        where: {
          eventSession: {
            eventSeriesId: seriesId,
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const totalSessions = series.sessions.length;

  const items = attendees.map((attendee) => {
    const attendanceBySessionId = new Map(
      attendee.attendance.map((record) => [record.eventSessionId, record]),
    );
    const attendedSessions = attendee.attendance.length;
    const attendancePercentage = totalSessions === 0 ? 0 : (attendedSessions / totalSessions) * 100;

    return {
      attendeeId: attendee.id,
      profileImageUrl: attendee.profileImageUrl,
      name: attendee.name,
      email: attendee.email,
      attendedSessions,
      totalSessions,
      attendancePercentage: Number(attendancePercentage.toFixed(2)),
      sessionAttendance: series.sessions.map((session) => {
        const record = attendanceBySessionId.get(session.id);

        return {
          sessionId: session.id,
          title: session.title,
          sessionDate: session.sessionDate,
          attended: Boolean(record),
          checkedInAt: record?.checkedInAt ?? null,
        };
      }),
    };
  });

  return {
    series: {
      id: series.id,
      name: series.name,
      description: series.description,
    },
    sessions: series.sessions,
    items,
  };
}

function buildReportRowsForExport(report: Awaited<ReturnType<typeof buildAttendanceReport>>) {
  return report.items.map((item) => {
    const sessionColumns = Object.fromEntries(
      item.sessionAttendance.map((session) => [
        `${session.title} (${new Date(session.sessionDate).toLocaleDateString("en-US")})`,
        session.attended ? "Joined" : "Did not join",
      ]),
    );

    return {
      attendeeName: item.name,
      email: item.email,
      attendedCount: item.attendedSessions,
      totalSessions: item.totalSessions,
      attendancePercentage: item.attendancePercentage,
      ...sessionColumns,
    };
  });
}

export const getSeriesReport = asyncHandler(async (request, response) => {
  const seriesId = request.params.id as string;
  const organizationId = request.auth!.organizationId as string;
  const report = await buildAttendanceReport(seriesId, organizationId);
  response.json(successResponse(report));
});

export const exportSeriesReportCsv = asyncHandler(async (request, response) => {
  const seriesId = request.params.id as string;
  const organizationId = request.auth!.organizationId as string;
  const report = await buildAttendanceReport(seriesId, organizationId);

  const csv = stringify(buildReportRowsForExport(report), { header: true });

  response.setHeader("Content-Type", "text/csv");
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${report.series.name.toLowerCase().replace(/\s+/g, "-")}-attendance-report.csv"`,
  );
  response.send(csv);
});

export const exportSeriesReportExcel = asyncHandler(async (request, response) => {
  const seriesId = request.params.id as string;
  const organizationId = request.auth!.organizationId as string;
  const report = await buildAttendanceReport(seriesId, organizationId);

  const workbook = XLSX.utils.book_new();
  const attendanceSheet = XLSX.utils.json_to_sheet(buildReportRowsForExport(report));
  const sessionsSheet = XLSX.utils.json_to_sheet(
    report.sessions.map((session, index) => ({
      order: index + 1,
      title: session.title,
      sessionDate: session.sessionDate,
      description: session.description ?? "",
    })),
  );

  XLSX.utils.book_append_sheet(workbook, attendanceSheet, "Attendance Matrix");
  XLSX.utils.book_append_sheet(workbook, sessionsSheet, "Sessions");

  const workbookBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  response.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${report.series.name.toLowerCase().replace(/\s+/g, "-")}-attendance-report.xlsx"`,
  );
  response.send(workbookBuffer);
});
