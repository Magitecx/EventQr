import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  LogOut,
  Settings2,
  PlusCircle,
  QrCode,
  Radio,
  Sheet,
  Users,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth";
import { api, unwrapResponse } from "../../lib/api";
import { cn } from "../../lib/utils";
import type { AuthResponse } from "../../types/api";
import { Seo } from "../seo/seo";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { ThemeToggle } from "../ui/theme-toggle";

const navigation = [
  { to: "/app", label: "Dashboard", icon: BarChart3 },
  { to: "/app/event-series", label: "Event Series", icon: CalendarDays },
  { to: "/app/attendees", label: "Attendees", icon: Users },
  { to: "/app/scanner", label: "Scanner", icon: Radio },
  { to: "/app/settings/account", label: "Settings", icon: Settings2 },
];

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeMembership, auth, logout, setAuthState } = useAuth();

  const pathLabel =
    navigation.find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))
      ?.label ?? "Workspace";

  const switchMutation = useMutation({
    mutationFn: async (organizationId: string) =>
      unwrapResponse<AuthResponse>(await api.post("/auth/switch-organization", { organizationId })),
    onSuccess: (result) => {
      setAuthState(result);
      if (location.pathname === "/app/onboarding") {
        navigate("/app");
      }
    },
  });

  return (
    <div className="min-h-screen text-slate-900">
      <Seo noindex pathname={location.pathname} title={pathLabel} />
      <div className="mx-auto grid min-h-screen max-w-[1480px] gap-6 px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-panel)] p-6 shadow-[0_18px_60px_rgba(148,163,184,0.12)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <QrCode className="size-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-amber-700">Attendance</p>
              <h1 className="font-display text-2xl font-semibold text-slate-900">EventQR Hub</h1>
            </div>
          </div>

          <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-amber-100 text-amber-800 shadow-[0_12px_24px_rgba(217,119,6,0.12)]"
                      : "text-slate-600 hover:bg-[var(--color-surface-soft)] hover:text-slate-900",
                  )
                }
                end={item.to === "/app"}
                to={item.to}
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Quick start</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <Link className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-amber-100" to="/app/event-series">
                Create series
              </Link>
              <Link className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-amber-100" to="/app/attendees">
                Add attendees
              </Link>
              <Link className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-amber-100" to="/app/scanner">
                Start scanner
              </Link>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Workspace</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {activeMembership?.organizationName ?? "No active organization"}
            </p>
            <div className="mt-3">
              <Select
                disabled={switchMutation.isPending || (auth?.memberships.length ?? 0) === 0}
                onChange={(event) => {
                  if (event.target.value) {
                    switchMutation.mutate(event.target.value);
                  }
                }}
                value={auth?.activeOrganizationId ?? ""}
              >
                <option value="">Select organization</option>
                {auth?.memberships.map((membership) => (
                  <option key={membership.membershipId} value={membership.organizationId}>
                    {membership.organizationName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link to="/app/onboarding">
                <Button className="w-full" variant="ghost">Create or join</Button>
              </Link>
              <Link to="/app/settings/organization">
                <Button className="w-full" variant="ghost">Org settings</Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Account</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{auth?.user.name}</p>
            <p className="text-sm text-slate-500">{auth?.user.email}</p>
          </div>

          <Button
            className="mt-6 w-full"
            icon={<LogOut className="size-4" />}
            onClick={() => {
              logout();
              navigate("/");
            }}
            variant="ghost"
          >
            Log out
          </Button>
        </aside>

        <main className="min-w-0 py-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-4 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Workspace</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <span>EventQR Hub</span>
                <ChevronRight className="size-4" />
                <span className="font-medium text-slate-900">{pathLabel}</span>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2 xl:flex">
              <ThemeToggle />
              <Link to="/app/event-series">
                <Button className="w-full" icon={<PlusCircle className="size-4" />} variant="secondary">
                  New series
                </Button>
              </Link>
              <Link to="/app/attendees">
                <Button className="w-full" icon={<Users className="size-4" />} variant="secondary">
                  Add attendee
                </Button>
              </Link>
              <Link to="/app/scanner">
                <Button className="w-full" icon={<Radio className="size-4" />}>Open scanner</Button>
              </Link>
              <Link to="/app/settings/account">
                <Button className="w-full" icon={<Sheet className="size-4" />} variant="ghost">
                  Account
                </Button>
              </Link>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
