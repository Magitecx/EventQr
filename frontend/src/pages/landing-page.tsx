import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  QrCode,
  ScanLine,
  Sheet,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const featureCards = [
  {
    title: "Reusable event series",
    copy: "Create one workshop program, add sessions over time, and keep attendance history in one place.",
    icon: CalendarDays,
  },
  {
    title: "Secure QR identity",
    copy: "Every attendee gets a random token-backed QR code ready for badges, email, or print handouts.",
    icon: QrCode,
  },
  {
    title: "Fast check-in flow",
    copy: "Pick the session, scan, confirm the attendee, and block duplicates automatically.",
    icon: ScanLine,
  },
  {
    title: "Session-by-session reporting",
    copy: "See exactly who joined or missed each session and export the full matrix to CSV or Excel.",
    icon: Sheet,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_18%),linear-gradient(180deg,#020617,#0f172a_38%,#111827)] text-slate-100">
      <div className="mx-auto max-w-[1320px] px-4 py-5 lg:px-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-slate-950/55 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-300 text-slate-950">
              <QrCode className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">Event operations</p>
              <p className="font-display text-xl font-semibold text-white">EventQR Hub</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#reports">Reports</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/register">
              <Button>Create account</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-8 px-1 py-10 lg:grid-cols-[1fr_540px] lg:py-16">
          <div className="max-w-2xl pt-8">
            <p className="text-sm uppercase tracking-[0.32em] text-amber-200/85">Recurring workshop attendance</p>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] text-white md:text-7xl">
              QR check-ins that are actually built for event series.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Run repeated programs without spreadsheet chaos. Register organizers, manage
              attendees, scan live check-ins, and track every session from one operator-friendly
              workspace.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register">
                <Button className="px-6 py-3 text-base" icon={<ArrowRight className="size-4" />}>
                  Start free setup
                </Button>
              </Link>
              <Link to="/login">
                <Button className="px-6 py-3 text-base" variant="secondary">
                  Open demo admin
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["10-sec check-ins", "Session selected once, scans handled from camera or manual token."],
                ["Per-session matrix", "Know exactly who joined or missed each session."],
                ["CSV + Excel export", "Send the full attendance matrix to operations teams quickly."],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.28),transparent_36%)] blur-3xl" />
            <Card className="rounded-[36px] p-5">
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Current program</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">AI Workshop Series</h2>
                      </div>
                      <span className="rounded-full bg-emerald-400/12 px-3 py-1 text-xs font-medium text-emerald-200">
                        Live
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        ["Session 1", "Completed", "96%"],
                        ["Session 2", "Completed", "88%"],
                        ["Session 3", "Today", "Pending"],
                      ].map(([title, status, metric]) => (
                        <div key={title} className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/5 px-4 py-3">
                          <div>
                            <p className="font-medium text-white">{title}</p>
                            <p className="text-sm text-slate-400">{status}</p>
                          </div>
                          <p className="text-sm font-semibold text-amber-200">{metric}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(15,23,42,0.72))] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Scanner result</p>
                    <div className="mt-5 rounded-[24px] border border-emerald-400/20 bg-emerald-500/12 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-200">
                          <CheckCircle2 className="size-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Check-in successful</p>
                          <p className="text-sm text-slate-300">Sophia Rivera joined Session 3</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Quick actions</p>
                      <div className="mt-3 grid gap-3">
                        {["Add attendee", "Create session", "Export report"].map((item) => (
                          <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-slate-950/45 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Attendance matrix</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">See who joined each session</h3>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-slate-300">
                      Exportable
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-[1.3fr_repeat(3,0.8fr)] gap-3 text-sm">
                    <div className="text-slate-400">Attendee</div>
                    <div className="text-slate-400">S1</div>
                    <div className="text-slate-400">S2</div>
                    <div className="text-slate-400">S3</div>
                    {[
                      { name: "Ava Johnson", states: [true, true, false] },
                      { name: "Liam Carter", states: [true, false, true] },
                      { name: "Mia Thompson", states: [true, true, true] },
                    ].map((row) => (
                      <div key={row.name} className="contents">
                        <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white">
                          {row.name}
                        </div>
                        {row.states.map((joined, index) => (
                          <div
                            key={`${row.name}-${index}`}
                            className={
                              joined
                                ? "rounded-2xl border border-emerald-400/20 bg-emerald-500/12 px-4 py-3 text-center text-emerald-200"
                                : "rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-center text-slate-400"
                            }
                          >
                            {joined ? "Joined" : "Missed"}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-5 py-8 lg:grid-cols-4" id="features">
          {featureCards.map((item) => (
            <Card key={item.title} className="p-5">
              <div className="rounded-2xl bg-amber-300/12 p-3 text-amber-200 w-fit">
                <item.icon className="size-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.copy}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 py-10 lg:grid-cols-[0.85fr_1.15fr]" id="workflow">
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Operator workflow</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-white">
              Make the happy path obvious for admins.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              The product is organized around the sequence admins actually follow: create the
              series, add attendees, choose the target session, scan, and export the final record.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                "Create an organization account and land in a guided operator workspace.",
                "Set up an event series with sessions and upload or add attendees.",
                "Open the scanner with the session already selected.",
                "Review the matrix report and export CSV or Excel in one click.",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-[22px] border border-white/10 bg-white/4 p-4">
                  <div className="rounded-xl bg-emerald-500/16 p-2 text-emerald-200">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card id="reports">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Designed for reporting</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                <Users className="size-5 text-amber-200" />
                <h3 className="mt-4 text-xl font-semibold text-white">Attendee-level clarity</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Percentage, total sessions, and per-session attendance states in one matrix.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                <Sheet className="size-5 text-amber-200" />
                <h3 className="mt-4 text-xl font-semibold text-white">Export-ready records</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Share Excel or CSV exports with operations, instructors, or compliance teams.
                </p>
              </div>
            </div>
          </Card>
        </section>

        <footer className="pb-10 pt-4">
          <Card className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Ready to simplify attendance?</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                Launch your first event series in minutes.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button className="px-5 py-3" icon={<ArrowRight className="size-4" />}>
                  Create account
                </Button>
              </Link>
              <Link to="/login">
                <Button className="px-5 py-3" variant="secondary">
                  Log in
                </Button>
              </Link>
            </div>
          </Card>
        </footer>
      </div>
    </div>
  );
}
