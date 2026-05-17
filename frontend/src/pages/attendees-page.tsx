import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api, getErrorMessage, unwrapResponse } from "../lib/api";
import type { Attendee } from "../types/api";

const attendeeSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  profileImageUrl: z.string().url().optional().or(z.literal("")),
});

type AttendeeFormValues = z.infer<typeof attendeeSchema>;

export function AttendeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttendeeFormValues>({
    resolver: zodResolver(attendeeSchema),
  });

  const attendeesQuery = useQuery({
    queryKey: ["attendees"],
    queryFn: async () => unwrapResponse<Attendee[]>(await api.get("/attendees")),
  });

  const mutation = useMutation({
    mutationFn: async (values: AttendeeFormValues) =>
      unwrapResponse<Attendee>(await api.post("/attendees", values)),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
    },
  });

  const attendees = attendeesQuery.data ?? [];
  const filteredAttendees = attendees.filter((attendee) => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [attendee.name, attendee.email, attendee.phone ?? ""].some((value) =>
      value.toLowerCase().includes(query),
    );
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <Card>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Create attendee</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-white">Attendee profiles</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Every attendee receives a secure QR token that can be rendered, downloaded, and scanned
          for session attendance.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Full name</span>
            <Input placeholder="Alex Morgan" {...register("name")} />
            {errors.name ? <p className="mt-2 text-xs text-rose-300">{errors.name.message}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <Input placeholder="alex@example.com" {...register("email")} />
            {errors.email ? <p className="mt-2 text-xs text-rose-300">{errors.email.message}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Phone</span>
            <Input placeholder="555-0101" {...register("phone")} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Profile image URL</span>
            <Input placeholder="https://..." {...register("profileImageUrl")} />
            {errors.profileImageUrl ? (
              <p className="mt-2 text-xs text-rose-300">{errors.profileImageUrl.message}</p>
            ) : null}
          </label>

          {mutation.isError ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {getErrorMessage(mutation.error)}
            </p>
          ) : null}

          <Button className="w-full" icon={<Plus className="size-4" />} type="submit">
            {mutation.isPending ? "Creating..." : "Create attendee"}
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Attendee directory</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{filteredAttendees.length} visible</h2>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-3.5 size-4 text-slate-500" />
            <Input
              className="pl-11"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone"
              value={search}
            />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10">
          <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_140px] bg-white/6 px-5 py-3 text-xs uppercase tracking-[0.22em] text-slate-400">
            <span>Attendee</span>
            <span>Contact</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-white/10 [content-visibility:auto]">
            {filteredAttendees.map((attendee) => (
              <div
                key={attendee.id}
                className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_140px] items-center gap-4 bg-slate-950/25 px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    alt={attendee.name}
                    className="size-12 rounded-2xl object-cover ring-1 ring-white/10"
                    src={attendee.profileImageUrl ?? "https://placehold.co/120x120/0f172a/f8fafc?text=QR"}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{attendee.name}</p>
                    <p className="truncate text-sm text-slate-400">{attendee.email}</p>
                  </div>
                </div>

                <div className="min-w-0 text-sm text-slate-400">
                  <p className="truncate">{attendee.phone ?? "No phone"}</p>
                  <p className="truncate text-xs uppercase tracking-[0.16em] text-slate-500">
                    QR token ready
                  </p>
                </div>

                <div className="text-right">
                  <Link
                    className="inline-flex rounded-2xl border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                    to={`/app/attendees/${attendee.id}`}
                  >
                    View profile
                  </Link>
                </div>
              </div>
            ))}

            {filteredAttendees.length === 0 ? (
              <p className="p-5 text-sm text-slate-400">No attendees match the current search.</p>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
