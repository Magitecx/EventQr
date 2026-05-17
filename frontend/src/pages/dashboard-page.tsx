import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarRange, Percent, QrCode, ScanLine, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { api, unwrapResponse } from "../lib/api";
import { formatDate, formatPercentage } from "../lib/utils";
import type { Attendee, EventSeries, SeriesReport } from "../types/api";

export function DashboardPage() {
  const attendeesQuery = useQuery({
    queryKey: ["attendees"],
    queryFn: async () => unwrapResponse<Attendee[]>(await api.get("/attendees")),
  });

  const seriesQuery = useQuery({
    queryKey: ["event-series"],
    queryFn: async () => unwrapResponse<EventSeries[]>(await api.get("/event-series")),
  });

  const primarySeriesId = seriesQuery.data?.[0]?.id;

  const reportQuery = useQuery({
    queryKey: ["series-report", primarySeriesId],
    enabled: Boolean(primarySeriesId),
    queryFn: async () =>
      unwrapResponse<SeriesReport>(await api.get(`/reports/event-series/${primarySeriesId}`)),
  });

  const seriesList = seriesQuery.data ?? [];
  const attendees = attendeesQuery.data ?? [];
  const reportItems = reportQuery.data?.items ?? [];
  const averageAttendance =
    reportItems.length === 0
      ? 0
      : reportItems.reduce((total, item) => total + item.attendancePercentage, 0) / reportItems.length;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.24em] text-amber-200/80">Operations dashboard</p>
              <h1 className="mt-4 font-display text-4xl font-semibold text-white">
                Attendance across every recurring event, session, and attendee profile.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Use this workspace to manage attendees, spin up new series, scan check-ins, and
                monitor attendance completion for each program.
              </p>
            </div>

            <div className="grid gap-3">
              <Link to="/app/scanner">
                <Button className="w-full" icon={<ScanLine className="size-4" />}>
                  Start check-in
                </Button>
              </Link>
              <Link to="/app/attendees">
                <Button className="w-full" icon={<Users className="size-4" />} variant="secondary">
                  Add attendees
                </Button>
              </Link>
              <Link to="/app/event-series">
                <Button className="w-full" icon={<CalendarRange className="size-4" />} variant="ghost">
                  Create series
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Current lead series</p>
          {seriesList[0] ? (
            <>
              <h2 className="mt-4 text-2xl font-semibold text-white">{seriesList[0].name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {seriesList[0].description ?? "No description set."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Badge>{seriesList[0].sessions.length} sessions</Badge>
                <Badge>{attendees.length} attendees</Badge>
              </div>
              <Link
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-amber-100"
                to={`/app/event-series/${seriesList[0].id}`}
              >
                View series detail
                <ArrowRight className="size-4" />
              </Link>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Create your first event series to get started.</p>
          )}
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total attendees", value: attendees.length, icon: Users },
          { label: "Active series", value: seriesList.length, icon: CalendarRange },
          {
            label: "Total sessions",
            value: seriesList.reduce((total, item) => total + item.sessions.length, 0),
            icon: CalendarRange,
          },
          { label: "Avg. attendance", value: formatPercentage(averageAttendance || 0), icon: Percent },
        ].map((item) => (
          <Card key={item.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-4 font-display text-4xl font-semibold text-white">{item.value}</p>
              </div>
              <div className="rounded-2xl bg-amber-300/14 p-3 text-amber-200">
                <item.icon className="size-5" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Recommended flow</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Next steps for operators</h2>
            </div>
            <Badge>{seriesList.length > 0 ? "Live workspace" : "Setup needed"}</Badge>
          </div>

          <div className="mt-6 grid gap-3">
            {[
              {
                title: "Create or pick an event series",
                copy: "Start with the recurring program so sessions and reports stay grouped.",
                to: "/app/event-series",
                icon: CalendarRange,
              },
              {
                title: "Add attendees and distribute QR codes",
                copy: "Profiles and QR downloads are handled from the attendee directory.",
                to: "/app/attendees",
                icon: QrCode,
              },
              {
                title: "Open the scanner on event day",
                copy: "Select the session once, then keep scanning without duplicate check-ins.",
                to: "/app/scanner",
                icon: ScanLine,
              },
            ].map((item) => (
              <Link
                key={item.title}
                className="block rounded-[24px] border border-white/10 bg-white/4 p-4 transition hover:bg-white/8"
                to={item.to}
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-amber-300/14 p-3 text-amber-200">
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.copy}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Event series</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Upcoming schedule</h2>
            </div>
            <Link className="text-sm font-medium text-amber-200 hover:text-amber-100" to="/app/event-series">
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {seriesList.map((series) => (
              <Link
                key={series.id}
                className="block rounded-[24px] border border-white/10 bg-white/4 p-4 transition hover:bg-white/8"
                to={`/app/event-series/${series.id}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{series.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {series.description ?? "No description set."}
                    </p>
                  </div>
                  <Badge>{series.sessions.length} sessions</Badge>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {series.startDate ? formatDate(series.startDate) : "Start date not set"}
                </p>
              </Link>
            ))}

            {seriesList.length === 0 ? (
              <p className="rounded-[24px] border border-dashed border-white/10 p-4 text-sm text-slate-400">
                No event series yet.
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Top attendance</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Best completion rates</h2>
            </div>
            {primarySeriesId ? (
              <Link
                className="text-sm font-medium text-amber-200 hover:text-amber-100"
                to={`/app/reports/event-series/${primarySeriesId}`}
              >
                Open report
              </Link>
            ) : null}
          </div>

          <div className="mt-6 space-y-3">
            {reportItems
              .slice()
              .sort((left, right) => right.attendancePercentage - left.attendancePercentage)
              .slice(0, 6)
              .map((item) => (
                <div
                  key={item.attendeeId}
                  className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/4 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      alt={item.name}
                      className="size-11 rounded-2xl object-cover ring-1 ring-white/10"
                      src={item.profileImageUrl ?? "https://placehold.co/120x120/0f172a/f8fafc?text=QR"}
                    />
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-sm text-slate-400">{item.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-amber-200">
                      {formatPercentage(item.attendancePercentage)}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {item.attendedSessions}/{item.totalSessions} sessions
                    </p>
                  </div>
                </div>
              ))}
            {reportItems.length === 0 ? (
              <p className="rounded-[24px] border border-dashed border-white/10 p-4 text-sm text-slate-400">
                Reports populate after you create at least one series.
              </p>
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
