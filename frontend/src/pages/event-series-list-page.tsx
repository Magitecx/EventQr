import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api, getErrorMessage, unwrapResponse } from "../lib/api";
import { formatDate } from "../lib/utils";
import type { EventSeries } from "../types/api";

const createSeriesSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type CreateSeriesValues = z.infer<typeof createSeriesSchema>;

export function EventSeriesListPage() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSeriesValues>({
    resolver: zodResolver(createSeriesSchema),
  });

  const seriesQuery = useQuery({
    queryKey: ["event-series"],
    queryFn: async () => unwrapResponse<EventSeries[]>(await api.get("/event-series")),
  });

  const mutation = useMutation({
    mutationFn: async (values: CreateSeriesValues) =>
      unwrapResponse<EventSeries>(
        await api.post("/event-series", {
          ...values,
          startDate: values.startDate ? new Date(values.startDate).toISOString() : "",
          endDate: values.endDate ? new Date(values.endDate).toISOString() : "",
        }),
      ),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["event-series"] });
    },
  });

  const series = seriesQuery.data ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
            <CalendarDays className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Series</p>
            <p className="text-sm text-slate-500">Create series</p>
          </div>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Series name</span>
            <Input placeholder="AI Workshop Series" {...register("name")} />
            {errors.name ? <p className="mt-2 text-xs text-rose-500">{errors.name.message}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Description</span>
            <Input placeholder="Internal recurring training program" {...register("description")} />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Start date</span>
              <Input type="datetime-local" {...register("startDate")} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">End date</span>
              <Input type="datetime-local" {...register("endDate")} />
            </label>
          </div>

          {mutation.isError ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {getErrorMessage(mutation.error)}
            </p>
          ) : null}

          <Button className="w-full" icon={<Plus className="size-4" />} type="submit">
            {mutation.isPending ? "Creating..." : "Create event series"}
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Directory</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">All series</h2>
          </div>
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-2 text-sm text-slate-600">
            {series.length} total
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {series.map((item) => (
            <div
              key={item.id}
              className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5 transition hover:bg-white"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{item.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description ?? "No description set."}
                  </p>
                </div>
                <div className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-slate-600">
                  {item.sessions.length} sessions
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
                <p>Starts: {item.startDate ? formatDate(item.startDate) : "Not set"}</p>
                <p>Ends: {item.endDate ? formatDate(item.endDate) : "Not set"}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-[var(--color-surface-soft)]"
                  to={`/app/event-series/${item.id}`}
                >
                  Open
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-[var(--color-surface-soft)]"
                  to={`/app/event-series/${item.id}/sessions`}
                >
                  Sessions
                </Link>
                <Link
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-[var(--color-surface-soft)]"
                  to={`/app/reports/event-series/${item.id}`}
                >
                  Report
                </Link>
              </div>
            </div>
          ))}

          {series.length === 0 ? (
            <p className="rounded-[24px] border border-dashed border-[var(--color-border)] p-4 text-sm text-slate-500">
              No event series yet.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
