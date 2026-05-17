import { useMutation, useQuery } from "@tanstack/react-query";
import { Link2 } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  api,
  clearPendingInviteToken,
  getErrorMessage,
  setPendingInviteToken,
  unwrapResponse,
} from "../lib/api";
import { useAuth } from "../lib/auth";
import type { AuthResponse, InvitePublicInfo } from "../types/api";

export function InvitePage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { auth, setAuthState } = useAuth();

  const inviteQuery = useQuery({
    queryKey: ["invite-public-info", token],
    enabled: Boolean(token),
    queryFn: async () => unwrapResponse<InvitePublicInfo>(await api.get(`/organizations/invites/${token}`)),
  });

  const acceptMutation = useMutation({
    mutationFn: async () =>
      unwrapResponse<AuthResponse>(await api.post(`/organizations/invites/${token}/accept`)),
    onSuccess: (result) => {
      clearPendingInviteToken();
      setAuthState(result);
      navigate("/app");
    },
  });

  useEffect(() => {
    if (auth && token && !acceptMutation.isPending && !acceptMutation.isSuccess) {
      acceptMutation.mutate();
    } else if (!auth && token) {
      setPendingInviteToken(token);
    }
  }, [acceptMutation, auth, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_22%),linear-gradient(180deg,#020617,#0f172a_42%,#111827)] px-4 text-slate-100">
      <Card className="w-full max-w-2xl p-8">
        <div className="rounded-2xl bg-emerald-500/12 p-3 text-emerald-200 w-fit">
          <Link2 className="size-5" />
        </div>

        <p className="mt-5 text-sm uppercase tracking-[0.24em] text-slate-400">Organization invite</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-white">
          {inviteQuery.data?.organizationName ?? "Loading invite..."}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          {auth
            ? "Joining the organization automatically with your current account."
            : "Log in or create an account and the app will automatically join this organization."}
        </p>

        {acceptMutation.isError ? (
          <p className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {getErrorMessage(acceptMutation.error)}
          </p>
        ) : null}

        {!auth ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login">
              <Button>Log in</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">Create account</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 rounded-[22px] border border-white/10 bg-white/4 p-4 text-sm text-slate-300">
            {acceptMutation.isPending ? "Joining organization..." : "Finishing invite acceptance..."}
          </div>
        )}
      </Card>
    </div>
  );
}
