import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api, getErrorMessage, unwrapResponse } from "../lib/api";
import { formatDate, resolveMediaUrl } from "../lib/utils";
import type { Attendee, AttendeeDetail } from "../types/api";

const updateAttendeeSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
});

type UpdateAttendeeValues = z.infer<typeof updateAttendeeSchema>;

export function AttendeeDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageInputKey, setImageInputKey] = useState(0);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const attendeeQuery = useQuery({
    queryKey: ["attendee", id],
    queryFn: async () => unwrapResponse<AttendeeDetail>(await api.get(`/attendees/${id}`)),
  });

  const attendee = attendeeQuery.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateAttendeeValues>({
    resolver: zodResolver(updateAttendeeSchema),
  });

  useEffect(() => {
    if (!attendee?.qrToken) {
      return;
    }

    QRCode.toDataURL(attendee.qrToken, {
      width: 360,
      margin: 2,
      color: {
        dark: "#020617",
        light: "#f8fafc",
      },
    }).then(setQrCodeDataUrl);
  }, [attendee?.qrToken]);

  useEffect(() => {
    if (!attendee) {
      return;
    }

    reset({
      name: attendee.name,
      email: attendee.email,
      phone: attendee.phone ?? "",
    });
    setProfileImageFile(null);
    setImagePreviewUrl("");
    setImageInputKey((value) => value + 1);
    setRemoveProfileImage(false);
  }, [attendee, reset]);

  useEffect(() => {
    if (!profileImageFile) {
      setImagePreviewUrl("");
      return;
    }

    const preview = URL.createObjectURL(profileImageFile);
    setImagePreviewUrl(preview);
    setRemoveProfileImage(false);

    return () => URL.revokeObjectURL(preview);
  }, [profileImageFile]);

  const updateMutation = useMutation({
    mutationFn: async (values: UpdateAttendeeValues) =>
      unwrapResponse<Attendee>(
        await api.patch(
          `/attendees/${id}`,
          (() => {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("email", values.email);
            if (values.phone) {
              formData.append("phone", values.phone);
            }
            if (profileImageFile) {
              formData.append("profileImage", profileImageFile);
            } else if (removeProfileImage) {
              formData.append("removeProfileImage", "true");
            }
            return formData;
          })(),
        ),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendee", id] });
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
      setProfileImageFile(null);
      setImageInputKey((value) => value + 1);
      setRemoveProfileImage(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => api.delete(`/attendees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
      navigate("/app/attendees");
    },
  });

  if (!attendee) {
    return <Card>Loading attendee profile...</Card>;
  }

  const currentImageSrc =
    imagePreviewUrl ||
    (removeProfileImage ? null : resolveMediaUrl(attendee.profileImageUrl)) ||
    "https://placehold.co/160x160/0f172a/f8fafc?text=QR";

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-start gap-4">
            <img
              alt={attendee.name}
              className="size-24 rounded-[28px] object-cover ring-1 ring-white/10"
              src={currentImageSrc}
            />
            <div className="flex-1">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Attendee profile</p>
              <h1 className="mt-3 font-display text-3xl font-semibold text-white">{attendee.name}</h1>
              <p className="mt-2 text-sm text-slate-400">{attendee.email}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Badge>{attendee.phone ?? "No phone"}</Badge>
                <Badge>Created {formatDate(attendee.createdAt)}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">QR code</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Check-in token</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                This QR encodes the secure `qrToken` used for attendance scans. Download it for
                printing or badge generation.
              </p>
            </div>

            {qrCodeDataUrl ? (
              <a
                className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                download={`${attendee.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`}
                href={qrCodeDataUrl}
              >
                Download QR
              </a>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col items-start gap-4 md:flex-row">
            <div className="rounded-[28px] bg-slate-50 p-4">
              {qrCodeDataUrl ? <img alt={`${attendee.name} QR`} className="size-64" src={qrCodeDataUrl} /> : null}
            </div>
            <div className="flex-1 rounded-[24px] border border-white/10 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Raw token</p>
              <p className="mt-3 break-all font-mono text-sm leading-7 text-slate-200">{attendee.qrToken}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Edit attendee</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Profile details</h2>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
          >
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Full name</span>
              <Input {...register("name")} />
              {errors.name ? <p className="mt-2 text-xs text-rose-300">{errors.name.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <Input {...register("email")} />
              {errors.email ? <p className="mt-2 text-xs text-rose-300">{errors.email.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Phone</span>
              <Input {...register("phone")} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Profile image file</span>
              <Input
                key={imageInputKey}
                accept="image/*"
                onChange={(event) => {
                  setProfileImageFile(event.target.files?.[0] ?? null);
                  setRemoveProfileImage(false);
                }}
                type="file"
              />
              <p className="mt-2 text-xs text-slate-500">
                PNG, JPG, WebP, or GIF up to 5 MB. Leave blank to keep the current image.
              </p>
              {profileImageFile ? (
                <p className="mt-2 text-xs text-slate-300">Selected: {profileImageFile.name}</p>
              ) : null}
            </label>

            {attendee.profileImageUrl && !profileImageFile ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">Current photo</p>
                  <p className="text-xs text-slate-400">
                    {removeProfileImage ? "Photo will be removed on save." : "Photo will stay unchanged."}
                  </p>
                </div>
                <Button
                  onClick={() => setRemoveProfileImage((value) => !value)}
                  type="button"
                  variant={removeProfileImage ? "secondary" : "ghost"}
                >
                  {removeProfileImage ? "Keep photo" : "Remove photo"}
                </Button>
              </div>
            ) : null}

            {updateMutation.isError ? (
              <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {getErrorMessage(updateMutation.error)}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit">{updateMutation.isPending ? "Saving..." : "Save changes"}</Button>
              <Button onClick={() => deleteMutation.mutate()} type="button" variant="danger">
                {deleteMutation.isPending ? "Deleting..." : "Delete attendee"}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Attendance history</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{attendee.attendance.length} recorded check-ins</h2>

          <div className="mt-6 space-y-3">
            {attendee.attendance.map((record) => (
              <div key={record.id} className="rounded-[24px] border border-white/10 bg-white/4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{record.eventSession.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{record.eventSession.eventSeries.name}</p>
                  </div>
                  <p className="text-sm text-slate-300">{formatDate(record.checkedInAt)}</p>
                </div>
              </div>
            ))}

            {attendee.attendance.length === 0 ? (
              <p className="rounded-[24px] border border-dashed border-white/10 p-4 text-sm text-slate-400">
                No attendance records yet.
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
