import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api, getErrorMessage, unwrapResponse } from "../lib/api";
import { formatDate } from "../lib/utils";
import type { EventSeries, EventSession } from "../types/api";

const sessionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  sessionDate: z.string().min(1),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

export function SessionsManagementPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
  });

  const seriesQuery = useQuery({
    queryKey: ["event-series", id],
    queryFn: async () => unwrapResponse<EventSeries>(await api.get(`/event-series/${id}`)),
  });

  const mutation = useMutation({
    mutationFn: async (values: SessionFormValues) =>
      unwrapResponse<EventSession>(
        await api.post(`/event-series/${id}/sessions`, {
          ...values,
          sessionDate: new Date(values.sessionDate).toISOString(),
        }),
      ),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["event-series", id] });
      queryClient.invalidateQueries({ queryKey: ["event-series"] });
    },
  });

  const series = seriesQuery.data;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <Card>
        <p className="text-sm font-semibold text-slate-900">Sessions</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">
          {series ? series.name : "Loading series..."}
        </h1>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Session title</span>
            <Input placeholder="Session 1" {...register("title")} />
            {errors.title ? <p className="mt-2 text-xs text-rose-500">{errors.title.message}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Description</span>
            <Input placeholder="Intro to AI workflows" {...register("description")} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Session date and time</span>
            <Input type="datetime-local" {...register("sessionDate")} />
            {errors.sessionDate ? (
              <p className="mt-2 text-xs text-rose-500">{errors.sessionDate.message}</p>
            ) : null}
          </label>

          {mutation.isError ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {getErrorMessage(mutation.error)}
            </p>
          ) : null}

          <Button className="w-full" type="submit">
            {mutation.isPending ? "Adding session..." : "Add session"}
          </Button>
        </form>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-slate-900">Session list</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">
          {series?.sessions.length ?? 0} scheduled sessions
        </h2>

        <div className="mt-6 space-y-3">
          {series?.sessions.map((session) => (
            <div key={session.id} className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{session.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {session.description ?? "No description set."}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-700">{formatDate(session.sessionDate)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    {session._count?.attendance ?? 0} check-ins
                  </p>
                </div>
              </div>
            </div>
          ))}

          {!series?.sessions.length ? (
            <p className="rounded-[24px] border border-dashed border-[var(--color-border)] p-4 text-sm text-slate-500">
              This series has no sessions yet.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
