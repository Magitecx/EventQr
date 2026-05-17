import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { startTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api, getErrorMessage, getPendingInviteToken, unwrapResponse } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { AuthResponse, RegisterPayload } from "../types/api";

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email(),
  password: z.string().min(6),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { auth, login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (auth) {
      navigate("/app", { replace: true });
    }
  }, [auth, navigate]);

  const mutation = useMutation({
    mutationFn: async (values: RegisterPayload) =>
      unwrapResponse<AuthResponse>(await api.post("/auth/register", values)),
    onSuccess: (result) => {
      login(result);
      const pendingInviteToken = getPendingInviteToken();
      startTransition(() => navigate(pendingInviteToken ? `/invite/${pendingInviteToken}` : "/app/onboarding"));
    },
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_18%),radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_24%),linear-gradient(180deg,#020617,#0f172a_42%,#111827)] px-4 py-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link className="font-display text-2xl font-semibold text-white" to="/">
            EventQR Hub
          </Link>
          <Link to="/login">
            <Button variant="ghost">Already have an account?</Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="overflow-hidden p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Create account</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-white">Create your operator account</h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Start with your account first. After sign-up, you can create your own organization,
              join one with a code, or accept an invite link.
            </p>

            <form className="mt-8 grid gap-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Your name</span>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-3.5 size-4 text-slate-500" />
                  <Input className="pl-11" placeholder="Jordan Lee" {...register("name")} />
                </div>
                {errors.name ? <p className="mt-2 text-xs text-rose-300">{errors.name.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-3.5 size-4 text-slate-500" />
                  <Input autoComplete="email" className="pl-11" placeholder="jordan@example.com" {...register("email")} />
                </div>
                {errors.email ? <p className="mt-2 text-xs text-rose-300">{errors.email.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Password</span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 size-4 text-slate-500" />
                  <Input
                    autoComplete="new-password"
                    className="pl-11"
                    placeholder="At least 6 characters"
                    type="password"
                    {...register("password")}
                  />
                </div>
                {errors.password ? <p className="mt-2 text-xs text-rose-300">{errors.password.message}</p> : null}
              </label>

              {mutation.isError ? (
                <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {getErrorMessage(mutation.error)}
                </p>
              ) : null}

              <Button className="mt-2 w-full py-3 text-base" disabled={mutation.isPending} type="submit">
                {mutation.isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Card>

          <div className="grid gap-6">
            <Card className="p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-amber-200/80">What happens next</p>
              <div className="mt-6 grid gap-4">
                {[
                  ["1. Create or join an organization", "Pick the workspace you want to operate in first."],
                  ["2. Create your first series", "Set the program name and session cadence."],
                  ["3. Add attendees", "Create profiles and generate QR codes instantly."],
                  ["4. Start scanning", "Open the camera flow with the target session selected."],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-[24px] border border-white/10 bg-white/4 p-4">
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Already have access?</p>
              <p className="mt-3 text-base leading-7 text-slate-300">
                Sign in with your existing account, then switch organizations or accept an invite link
                when needed.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/login">
                  <Button variant="secondary">Go to login</Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost">Back to landing page</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
