import { useQuery } from "@tanstack/react-query";
import { CalendarClock, QrCode, TableProperties } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { api, unwrapResponse } from "../lib/api";
import { formatDate } from "../lib/utils";
import type { EventSeries } from "../types/api";

export function EventSeriesDetailPage() {
  const { id = "" } = useParams();

  const seriesQuery = useQuery({
    queryKey: ["event-series", id],
    queryFn: async () => unwrapResponse<EventSeries>(await api.get(`/event-series/${id}`)),
  });

  const series = seriesQuery.data;

  if (!series) {
    return <Card>Loading event series...</Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-slate-900">Series</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900">{series.name}</h1>
            <p className="mt-4 text-base leading-7 text-slate-500">
              {series.description ?? "No description set for this program."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge>{series.sessions.length} sessions</Badge>
              <Badge>{series.startDate ? formatDate(series.startDate) : "No start date"}</Badge>
              <Badge>{series.endDate ? formatDate(series.endDate) : "No end date"}</Badge>
            </div>
          </div>

          <div className="grid gap-3">
            <Link
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-white"
              to={`/app/event-series/${series.id}/sessions`}
            >
              Sessions
            </Link>
            <Link
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-white"
              to={`/app/reports/event-series/${series.id}`}
            >
              Report
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <div className="space-y-4">
            {[
              {
                title: "Scanner-ready",
                description: "Use any session in this series with the live browser QR scanner.",
                icon: QrCode,
              },
              {
                title: "Session-based attendance",
                description: "Every check-in is stored per attendee and per event session.",
                icon: CalendarClock,
              },
              {
                title: "Report export",
                description: "Export attendance percentage and counts as CSV any time.",
                icon: TableProperties,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                    <item.icon className="size-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Sessions</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Schedule</h2>
            </div>
            <Link className="text-sm font-medium text-amber-700 hover:text-amber-800" to="/app/scanner">
              Open scanner
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {series.sessions.map((session) => (
              <div key={session.id} className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{session.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {session.description ?? "No description set."}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    <p>{formatDate(session.sessionDate)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {session._count?.attendance ?? 0} check-ins
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {series.sessions.length === 0 ? (
              <p className="rounded-[24px] border border-dashed border-[var(--color-border)] p-4 text-sm text-slate-500">
                No sessions created yet.
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
