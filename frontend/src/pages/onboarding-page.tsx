import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRightLeft, Building2, Link2, Users } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  api,
  clearPendingInviteToken,
  getErrorMessage,
  getPendingInviteToken,
  unwrapResponse,
} from "../lib/api";
import { useAuth } from "../lib/auth";
import type { AuthResponse } from "../types/api";

const createOrganizationSchema = z.object({
  name: z.string().trim().min(2),
});

const joinOrganizationSchema = z.object({
  joinCode: z.string().trim().min(4),
});

type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;
type JoinOrganizationValues = z.infer<typeof joinOrganizationSchema>;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { auth, setAuthState } = useAuth();
  const pendingInviteToken = getPendingInviteToken();

  const createForm = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
  });

  const joinForm = useForm<JoinOrganizationValues>({
    resolver: zodResolver(joinOrganizationSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (values: CreateOrganizationValues) =>
      unwrapResponse<AuthResponse>(await api.post("/organizations", values)),
    onSuccess: (result) => {
      clearPendingInviteToken();
      setAuthState(result);
      navigate("/app");
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (values: JoinOrganizationValues) =>
      unwrapResponse<AuthResponse>(await api.post("/organizations/join", values)),
    onSuccess: (result) => {
      clearPendingInviteToken();
      setAuthState(result);
      navigate("/app");
    },
  });

  const switchMutation = useMutation({
    mutationFn: async (organizationId: string) =>
      unwrapResponse<AuthResponse>(await api.post("/auth/switch-organization", { organizationId })),
    onSuccess: (result) => {
      clearPendingInviteToken();
      setAuthState(result);
      navigate("/app");
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async (token: string) =>
      unwrapResponse<AuthResponse>(await api.post(`/organizations/invites/${token}/accept`)),
    onSuccess: (result) => {
      clearPendingInviteToken();
      setAuthState(result);
      navigate("/app");
    },
  });

  useEffect(() => {
    if (auth?.activeOrganizationId) {
      navigate("/app", { replace: true });
      return;
    }

    if (auth && pendingInviteToken && !acceptInviteMutation.isPending && !acceptInviteMutation.isSuccess) {
      acceptInviteMutation.mutate(pendingInviteToken);
    }
  }, [acceptInviteMutation, auth, navigate, pendingInviteToken]);

  if (!auth) {
    return <Navigate replace to="/login" />;
  }

  if (auth.activeOrganizationId) {
    return <Navigate replace to="/app" />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Workspace onboarding</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-white">Set up your first organization</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Your account exists independently from organizations now. Create your own workspace, join
          one with a code, or accept an invite link and continue from there.
        </p>

        {pendingInviteToken ? (
          <div className="mt-6 rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            A pending invite is attached to this account. The app is attempting to join the
            organization automatically.
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Create workspace",
              copy: "Become the owner of a new organization and start adding series and attendees.",
              icon: Building2,
            },
            {
              title: "Join with code",
              copy: "Enter a join code from an existing organization and start collaborating.",
              icon: Users,
            },
            {
              title: "Accept invite",
              copy: "Invite links can take you directly into the right workspace after login.",
              icon: Link2,
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/4 p-5">
              <div className="rounded-2xl bg-white/8 p-3 text-amber-200 w-fit">
                <item.icon className="size-5" />
              </div>
              <p className="mt-4 font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.copy}</p>
            </div>
          ))}
        </div>

        {auth.memberships.length > 0 ? (
          <div className="mt-8">
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="size-4 text-amber-200" />
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Existing memberships</p>
            </div>
            <div className="mt-4 grid gap-3">
              {auth.memberships.map((membership) => (
                <button
                  key={membership.membershipId}
                  className="rounded-[24px] border border-white/10 bg-white/4 p-4 text-left transition hover:bg-white/8"
                  onClick={() => switchMutation.mutate(membership.organizationId)}
                  type="button"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{membership.organizationName}</p>
                      <p className="mt-2 text-sm text-slate-400">
                        Existing membership - {membership.role.toLowerCase()}
                      </p>
                    </div>
                    <Button disabled={switchMutation.isPending} type="button" variant="ghost">
                      Open workspace
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      <div className="grid gap-6">
        <Card className="p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-300/14 p-3 text-amber-200">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Create organization</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Start your own workspace</h2>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Organization name</span>
              <Input placeholder="Acme Learning Lab" {...createForm.register("name")} />
              {createForm.formState.errors.name ? (
                <p className="mt-2 text-xs text-rose-300">{createForm.formState.errors.name.message}</p>
              ) : null}
            </label>

            {createMutation.isError ? (
              <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {getErrorMessage(createMutation.error)}
              </p>
            ) : null}

            <Button className="w-full" disabled={createMutation.isPending} type="submit">
              {createMutation.isPending ? "Creating organization..." : "Create organization"}
            </Button>
          </form>
        </Card>

        <Card className="p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/14 p-3 text-emerald-200">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Join organization</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Use a join code</h2>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={joinForm.handleSubmit((values) => joinMutation.mutate(values))}>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Organization code</span>
              <Input placeholder="AB12CD34" {...joinForm.register("joinCode")} />
              {joinForm.formState.errors.joinCode ? (
                <p className="mt-2 text-xs text-rose-300">{joinForm.formState.errors.joinCode.message}</p>
              ) : null}
            </label>

            {joinMutation.isError ? (
              <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {getErrorMessage(joinMutation.error)}
              </p>
            ) : null}

            <Button className="w-full" disabled={joinMutation.isPending} type="submit" variant="secondary">
              {joinMutation.isPending ? "Joining..." : "Join organization"}
            </Button>
          </form>

          <div className="mt-5 flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/4 p-4">
            <div className="rounded-xl bg-white/10 p-2 text-slate-300">
              <Link2 className="size-4" />
            </div>
            <p className="text-sm leading-6 text-slate-400">
              Invite links work too. When a user opens the invite while signed in, the organization
              is joined automatically and becomes their active workspace.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
