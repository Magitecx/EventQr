import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole, Mail, UserRound, Users } from "lucide-react";
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
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link className="font-display text-2xl font-semibold text-slate-900" to="/">
            EventQR Hub
          </Link>
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Register</p>
                <p className="text-sm text-slate-500">Create account first</p>
              </div>
            </div>

            <h1 className="mt-6 font-display text-4xl font-semibold text-slate-900">Create account</h1>

            <form className="mt-8 grid gap-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Name</span>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-3.5 size-4 text-slate-400" />
                  <Input className="pl-11" placeholder="Jordan Lee" {...register("name")} />
                </div>
                {errors.name ? <p className="mt-2 text-xs text-rose-500">{errors.name.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-3.5 size-4 text-slate-400" />
                  <Input autoComplete="email" className="pl-11" placeholder="jordan@example.com" {...register("email")} />
                </div>
                {errors.email ? <p className="mt-2 text-xs text-rose-500">{errors.email.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Password</span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 size-4 text-slate-400" />
                  <Input
                    autoComplete="new-password"
                    className="pl-11"
                    placeholder="At least 6 characters"
                    type="password"
                    {...register("password")}
                  />
                </div>
                {errors.password ? <p className="mt-2 text-xs text-rose-500">{errors.password.message}</p> : null}
              </label>

              {mutation.isError ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {getErrorMessage(mutation.error)}
                </p>
              ) : null}

              <Button className="mt-2 w-full py-3 text-base" disabled={mutation.isPending} type="submit">
                {mutation.isPending ? "Creating..." : "Create account"}
              </Button>
            </form>
          </Card>

          <div className="grid gap-6">
            <Card className="p-8">
              <h2 className="font-display text-4xl font-semibold text-slate-900">After sign up</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {["Create workspace", "Join by code", "Open invite link", "Start scanning"].map((item) => (
                  <div
                    key={item}
                    className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5"
                  >
                    <p className="text-lg font-semibold text-slate-900">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="flex items-center justify-between gap-4 p-6">
              <div>
                <p className="text-sm font-semibold text-slate-900">Already have an account?</p>
                <p className="text-sm text-slate-500">Go straight to login.</p>
              </div>
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
