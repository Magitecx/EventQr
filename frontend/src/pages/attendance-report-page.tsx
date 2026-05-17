import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useParams } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { api, unwrapResponse } from "../lib/api";
import { formatDate, formatPercentage, resolveMediaUrl } from "../lib/utils";
import type { SeriesReport } from "../types/api";

export function AttendanceReportPage() {
  const { id = "" } = useParams();

  const reportQuery = useQuery({
    queryKey: ["series-report", id],
    queryFn: async () => unwrapResponse<SeriesReport>(await api.get(`/reports/event-series/${id}`)),
  });

  async function downloadReport(downloadUrl: string, fileName: string, contentType: string) {
    const response = await api.get(downloadUrl, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: contentType });
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(objectUrl);
  }

  if (!reportQuery.data) {
    return <Card>Loading report...</Card>;
  }

  const report = reportQuery.data;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Attendance report</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-white">{report.series.name}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            {report.series.description ?? "Attendance percentage across every session in this series."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Badge>{report.sessions.length} sessions</Badge>
            <Badge>{report.items.length} attendees</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            icon={<Download className="size-4" />}
            onClick={() =>
              downloadReport(
                `/reports/event-series/${id}/export.csv`,
                `${report.series.name}.csv`,
                "text/csv",
              )
            }
            variant="secondary"
          >
            Export CSV
          </Button>
          <Button
            icon={<Download className="size-4" />}
            onClick={() =>
              downloadReport(
                `/reports/event-series/${id}/export.xlsx`,
                `${report.series.name}.xlsx`,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              )
            }
          >
            Export Excel
          </Button>
        </div>
      </div>

      <div className="mt-8 rounded-[28px] border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-white/6 text-xs uppercase tracking-[0.22em] text-slate-400">
              <tr>
                <th className="sticky left-0 z-20 min-w-[280px] bg-slate-900/95 px-5 py-4">Attendee</th>
                <th className="min-w-[110px] px-4 py-4">Attended</th>
                <th className="min-w-[110px] px-4 py-4">Total</th>
                <th className="min-w-[140px] px-4 py-4">Attendance %</th>
                {report.sessions.map((session) => (
                  <th key={session.id} className="min-w-[180px] px-4 py-4">
                    <div className="space-y-1">
                      <p className="whitespace-normal text-slate-200">{session.title}</p>
                      <p className="normal-case tracking-normal text-slate-500">
                        {formatDate(session.sessionDate)}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {report.items.map((item) => (
                <tr key={item.attendeeId} className="bg-slate-950/25 align-top">
                  <td className="sticky left-0 z-10 bg-slate-950 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        alt={item.name}
                        className="size-12 rounded-2xl object-cover ring-1 ring-white/10"
                        src={
                          resolveMediaUrl(item.profileImageUrl) ??
                          "https://placehold.co/120x120/0f172a/f8fafc?text=QR"
                        }
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{item.name}</p>
                        <p className="truncate text-sm text-slate-400">{item.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{item.attendedSessions}</td>
                  <td className="px-4 py-4 text-slate-300">{item.totalSessions}</td>
                  <td className="px-4 py-4 font-semibold text-amber-200">
                    {formatPercentage(item.attendancePercentage)}
                  </td>
                  {item.sessionAttendance.map((session) => (
                    <td key={session.sessionId} className="px-4 py-4">
                      <div
                        className={
                          session.attended
                            ? "rounded-2xl border border-emerald-400/20 bg-emerald-500/12 px-3 py-2"
                            : "rounded-2xl border border-white/10 bg-white/4 px-3 py-2"
                        }
                      >
                        <p
                          className={
                            session.attended
                              ? "text-sm font-semibold text-emerald-200"
                              : "text-sm font-semibold text-slate-300"
                          }
                        >
                          {session.attended ? "Joined" : "Did not join"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {session.checkedInAt ? formatDate(session.checkedInAt) : "No check-in"}
                        </p>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
