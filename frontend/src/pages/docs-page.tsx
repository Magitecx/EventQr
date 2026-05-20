import {
  BellRing,
  BookOpen,
  Building2,
  Database,
  Download,
  ScanLine,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BrandBadge } from "../components/brand/brand-badge";
import { BrandLogo } from "../components/brand/brand-logo";
import { Seo } from "../components/seo/seo";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ThemeToggle } from "../components/ui/theme-toggle";

const toc = [
  { id: "overview", label: "Overview" },
  { id: "accounts", label: "Accounts + Workspaces" },
  { id: "attendance", label: "Attendance Flow" },
  { id: "scanner", label: "Scanner + Share Links" },
  { id: "reports", label: "Reports + Export" },
  { id: "security", label: "Security + Data Rules" },
  { id: "automation", label: "Automation + Emails" },
  { id: "api", label: "API surface" },
];

export function DocsPage() {
  return (
    <div className="min-h-screen px-4 py-5 text-[var(--color-text)] lg:px-6">
      <Seo
        description="Detailed EventQR product documentation: setup, workspace model, scanning flow, reports, security, and operations."
        pathname="/docs"
        title="Product Documentation"
      />
      <div className="mx-auto max-w-[1320px]">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-4 shadow-[0_18px_40px_rgba(148,163,184,0.1)] backdrop-blur">
          <div className="flex items-center gap-3">
            <BrandLogo imageClassName="h-11" />
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-amber-700">EventQR</p>
              <p className="font-display text-xl font-semibold text-slate-900">Documentation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="h-fit p-5 lg:sticky lg:top-5">
            <p className="text-sm font-semibold text-slate-900">Contents</p>
            <div className="mt-4 space-y-2">
              {toc.map((item) => (
                <a
                  key={item.id}
                  className="block rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-[var(--color-surface-soft)] hover:text-slate-900"
                  href={`#${item.id}`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-7" id="overview">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                  <BookOpen className="size-5" />
                </div>
                <h1 className="font-display text-4xl font-semibold text-slate-900">EventQR product docs</h1>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                EventQR is a multi-organization QR attendance platform for recurring workshops and event series.
                Organizations manage attendees, run session check-ins, and export attendance outcomes.
              </p>
            </Card>

            <Card className="p-7" id="accounts">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                  <Building2 className="size-5" />
                </div>
                <h2 className="text-3xl font-semibold text-slate-900">Accounts and workspaces</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>Users create accounts first, then create or join one or more organizations (workspaces).</p>
                <p>A user can switch active workspace from the sidebar selector at any time.</p>
                <p>All event series, sessions, attendees, and attendance actions are scoped to the active organization.</p>
              </div>
            </Card>

            <Card className="p-7" id="attendance">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <Users className="size-5" />
                </div>
                <h2 className="text-3xl font-semibold text-slate-900">Attendance model</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>Attendees belong to an organization, not to a single event.</p>
                <p>Event series contain sessions. Check-ins create attendance records at attendee+session level.</p>
                <p>
                  Series report percentages are calculated as:
                  <span className="ml-2 font-mono text-slate-900">attendedSessions / totalSessions * 100</span>
                </p>
              </div>
            </Card>

            <Card className="p-7" id="scanner">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                  <ScanLine className="size-5" />
                </div>
                <h2 className="text-3xl font-semibold text-slate-900">Scanner and share links</h2>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                  <p className="text-sm font-semibold text-slate-900">Internal scanner</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Staff choose a session, scan QR codes, and get immediate success/duplicate/invalid feedback.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                  <p className="text-sm font-semibold text-slate-900">Public scan page</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Session-specific share links open a scan-only page (`/scan/:token`) for phone-based operations.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-7" id="reports">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-50 p-3 text-violet-700">
                  <Download className="size-5" />
                </div>
                <h2 className="text-3xl font-semibold text-slate-900">Reports and export</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>Series reports show a full session matrix with joined/missed state per attendee.</p>
                <p>Export formats: CSV and Excel (`.xlsx`) with summary counts and per-session participation columns.</p>
              </div>
            </Card>

            <Card className="p-7" id="security">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
                  <ShieldCheck className="size-5" />
                </div>
                <h2 className="text-3xl font-semibold text-slate-900">Security and data controls</h2>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                  <p className="text-sm font-semibold text-slate-900">Auth and access</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    JWT-based auth, protected app routes, and organization role checks (`OWNER`, `ADMIN`, `MEMBER`).
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                  <p className="text-sm font-semibold text-slate-900">Profile images</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Local storage with server-side validation/re-encoding; only JPEG, PNG, and WebP are accepted.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                  <p className="text-sm font-semibold text-slate-900">Password reset</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Backend-generated single-use token flow with expiry and email delivery through Resend.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                  <p className="text-sm font-semibold text-slate-900">Organization lifecycle</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Inactivity tracking with warning state, scheduled deletion metadata, and automatic purge window.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-7" id="automation">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
                  <BellRing className="size-5" />
                </div>
                <h2 className="text-3xl font-semibold text-slate-900">Automation and email notifications</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>Password reset request emails and password changed success emails are sent from backend only.</p>
                <p>Inactive organization warning emails are sent to owner/admin members when status changes to inactive.</p>
                <p>Support contact in outbound messaging: <a className="font-medium text-amber-700 hover:text-amber-800" href="mailto:support@magitecx.com">support@magitecx.com</a>.</p>
              </div>
            </Card>

            <Card className="p-7" id="api">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <Database className="size-5" />
                </div>
                <h2 className="text-3xl font-semibold text-slate-900">API surface (high level)</h2>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p><span className="font-mono text-slate-900">POST /api/auth/login</span> - sign in</p>
                <p><span className="font-mono text-slate-900">POST /api/auth/forgot-password</span> - request reset email</p>
                <p><span className="font-mono text-slate-900">POST /api/auth/reset-password</span> - apply reset token</p>
                <p><span className="font-mono text-slate-900">GET /api/event-series</span> - list series (active organization)</p>
                <p><span className="font-mono text-slate-900">POST /api/scan/check-in</span> - authenticated check-in</p>
                <p><span className="font-mono text-slate-900">POST /api/public/scan/:token/check-in</span> - share-link check-in</p>
                <p><span className="font-mono text-slate-900">GET /api/reports/event-series/:id/export.xlsx</span> - export report</p>
              </div>
            </Card>
          </div>
        </section>

        <footer className="py-6">
          <Card className="flex flex-col gap-4 rounded-[28px] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Need support?</p>
              <p className="text-sm text-slate-500">
                Email{" "}
                <a className="font-medium text-amber-700 hover:text-amber-800" href="mailto:support@magitecx.com">
                  support@magitecx.com
                </a>
              </p>
            </div>
            <BrandBadge compact />
          </Card>
        </footer>
      </div>
    </div>
  );
}
