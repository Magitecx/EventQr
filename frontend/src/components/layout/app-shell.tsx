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
import { Button } from "../ui/button";
import { Select } from "../ui/select";

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_18%),linear-gradient(180deg,#020617,#0f172a_40%,#111827)] text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1500px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_40px_120px_rgba(2,6,23,0.4)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-300 text-slate-950">
              <QrCode className="size-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-amber-200/80">Attendance</p>
              <h1 className="font-display text-2xl font-semibold">EventQR Hub</h1>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-amber-300 text-slate-950 shadow-[0_18px_30px_rgba(245,158,11,0.2)]"
                      : "text-slate-300 hover:bg-white/6 hover:text-white",
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

          <div className="mt-8 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(251,191,36,0.12),rgba(15,23,42,0.3))] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Quick start</p>
            <div className="mt-3 grid gap-2">
              <Link className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10" to="/app/event-series">
                Create series
              </Link>
              <Link className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10" to="/app/attendees">
                Add attendees
              </Link>
              <Link className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10" to="/app/scanner">
                Start scanner
              </Link>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current organization</p>
            <p className="mt-2 text-lg font-semibold text-white">
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
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/app/onboarding">
                <Button variant="ghost">Create or join</Button>
              </Link>
              <Link to="/app/settings/organization">
                <Button variant="ghost">Org settings</Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Signed in as</p>
            <p className="mt-2 text-lg font-semibold">{auth?.user.name}</p>
            <p className="text-sm text-slate-400">{auth?.user.email}</p>
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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-slate-950/50 px-5 py-4 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Workspace</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <span>EventQR Hub</span>
                <ChevronRight className="size-4" />
                <span className="font-medium text-white">{pathLabel}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/app/event-series">
                <Button icon={<PlusCircle className="size-4" />} variant="secondary">
                  New series
                </Button>
              </Link>
              <Link to="/app/attendees">
                <Button icon={<Users className="size-4" />} variant="secondary">
                  Add attendee
                </Button>
              </Link>
              <Link to="/app/scanner">
                <Button icon={<Radio className="size-4" />}>Open scanner</Button>
              </Link>
              <Link to="/app/settings/account">
                <Button icon={<Sheet className="size-4" />} variant="ghost">
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
