import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { startTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api, getErrorMessage, getPendingInviteToken, unwrapResponse } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { AuthResponse } from "../types/api";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { auth, login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (auth) {
      navigate("/app", { replace: true });
    }
  }, [auth, navigate]);

  const mutation = useMutation({
    mutationFn: async (values: LoginFormValues) =>
      unwrapResponse<AuthResponse>(await api.post("/auth/login", values)),
    onSuccess: (result) => {
      login(result);
      const pendingInviteToken = getPendingInviteToken();
      startTransition(() => navigate(pendingInviteToken ? `/invite/${pendingInviteToken}` : "/app"));
    },
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_28%),linear-gradient(160deg,#020617,#111827_48%,#1e293b)] px-4 py-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white" to="/">
            <ArrowLeft className="size-4" />
            Back to landing
          </Link>
          <Link to="/register">
            <Button variant="secondary">Create account</Button>
          </Link>
        </div>

        <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(245,158,11,0.14),rgba(15,23,42,0.9)_45%,rgba(2,6,23,0.96))] p-10 shadow-[0_45px_140px_rgba(2,6,23,0.45)]">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-200/90">Recurring event ops</p>
            <h1 className="mt-6 max-w-2xl font-display text-5xl font-semibold leading-tight text-white">
              Reusable QR attendance tracking for workshop series and live sessions.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Manage attendees, generate secure QR codes, scan check-ins from the browser camera,
              and track attendance percentages across every session in a series.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                ["Secure QR tokens", "Randomized attendee tokens instead of numeric IDs."],
                ["Live scanner", "Browser-based camera check-ins with duplicate protection."],
                ["Series reporting", "Attendance percentages and CSV export per series."],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[24px] border border-white/10 bg-slate-950/40 p-5">
                  <h2 className="font-semibold text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          <Card className="self-center p-8">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Account access</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-white">Sign in</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Sign in to your account and continue into your active organization workspace.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-3.5 size-4 text-slate-500" />
                  <Input autoComplete="email" className="pl-11" {...register("email")} />
                </div>
                {errors.email ? <p className="mt-2 text-xs text-rose-300">{errors.email.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Password</span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 size-4 text-slate-500" />
                  <Input
                    autoComplete="current-password"
                    className="pl-11"
                    type="password"
                    {...register("password")}
                  />
                </div>
                {errors.password ? (
                  <p className="mt-2 text-xs text-rose-300">{errors.password.message}</p>
                ) : null}
              </label>

              {mutation.isError ? (
                <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {getErrorMessage(mutation.error)}
                </p>
              ) : null}

              <Button className="w-full" disabled={mutation.isPending} type="submit">
                {mutation.isPending ? "Signing in..." : "Log in"}
              </Button>
            </form>

            <div className="mt-8 flex items-center justify-between rounded-[24px] border border-white/10 bg-white/4 p-4 text-sm">
              <div>
                <p className="font-semibold text-white">Need a fresh workspace?</p>
                <p className="mt-1 text-slate-400">Create an account, then create or join an organization.</p>
              </div>
              <Link to="/register">
                <Button variant="secondary">Register</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
