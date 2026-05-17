import { useMutation, useQuery } from "@tanstack/react-query";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Camera, CircleCheckBig, OctagonAlert, ScanLine, Sheet } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { api, getErrorMessage, unwrapResponse } from "../lib/api";
import { formatDate } from "../lib/utils";
import type { EventSeries, ScanResult } from "../types/api";

type CheckInPayload = {
  qrToken: string;
  eventSessionId: string;
};

export function ScannerPage() {
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scannerError, setScannerError] = useState("");
  const [manualToken, setManualToken] = useState("");
  const recentTokenRef = useRef("");
  const resumeTimeoutRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);

  const seriesQuery = useQuery({
    queryKey: ["event-series"],
    queryFn: async () => unwrapResponse<EventSeries[]>(await api.get("/event-series")),
  });

  const sessionOptions = useMemo(
    () =>
      (seriesQuery.data ?? []).flatMap((series) =>
        series.sessions.map((session) => ({
          id: session.id,
          label: `${series.name} - ${session.title}`,
          seriesId: series.id,
          seriesName: series.name,
          title: session.title,
        })),
      ),
    [seriesQuery.data],
  );

  const selectedSession = sessionOptions.find((session) => session.id === selectedSessionId);

  useEffect(() => {
    if (!selectedSessionId && sessionOptions[0]) {
      setSelectedSessionId(sessionOptions[0].id);
    }
  }, [selectedSessionId, sessionOptions]);

  const checkInMutation = useMutation({
    mutationFn: async (payload: CheckInPayload) =>
      unwrapResponse<ScanResult>(await api.post("/scan/check-in", payload)),
    onSuccess: (result) => {
      setLastResult(result);
      setPaused(true);
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
      resumeTimeoutRef.current = window.setTimeout(() => setPaused(false), 2200);
    },
  });

  function submitToken(qrToken: string) {
    if (!selectedSessionId || checkInMutation.isPending || !qrToken) {
      return;
    }

    if (recentTokenRef.current === qrToken) {
      return;
    }

    recentTokenRef.current = qrToken;
    setScannerError("");
    checkInMutation.mutate(
      {
        qrToken,
        eventSessionId: selectedSessionId,
      },
      {
        onSettled: () => {
          window.setTimeout(() => {
            recentTokenRef.current = "";
          }, 1800);
        },
      },
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Attendance scanner</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-white">Live QR check-in</h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Select a session, point the camera at an attendee QR code, and the backend will
              validate the token before recording attendance.
            </p>
          </div>
          <Badge>{sessionOptions.length} available sessions</Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Target session</span>
            <Select onChange={(event) => setSelectedSessionId(event.target.value)} value={selectedSessionId}>
              <option value="">Select a session</option>
              {sessionOptions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Manual token entry</span>
            <div className="flex gap-3">
              <Input onChange={(event) => setManualToken(event.target.value)} value={manualToken} />
              <Button className="shrink-0" onClick={() => submitToken(manualToken)} type="button" variant="secondary">
                Submit
              </Button>
            </div>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/4 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current scan target</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {selectedSession ? `${selectedSession.seriesName} - ${selectedSession.title}` : "No session selected"}
            </p>
          </div>
          {selectedSession ? (
            <Link to={`/app/reports/event-series/${selectedSession.seriesId}`}>
              <Button icon={<Sheet className="size-4" />} variant="ghost">
                Open report
              </Button>
            </Link>
          ) : null}
        </div>

        <div className="mt-6 overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 p-3">
          <div className="aspect-video overflow-hidden rounded-[28px] bg-slate-900">
            {selectedSessionId ? (
              <Scanner
                allowMultiple={false}
                classNames={{
                  container: "h-full w-full",
                  video: "h-full w-full object-cover",
                }}
                constraints={{ facingMode: "environment" }}
                onError={(error) => setScannerError(error.message)}
                onScan={(detectedCodes) => {
                  const code = detectedCodes[0]?.rawValue;
                  if (code) {
                    submitToken(code);
                  }
                }}
                paused={paused}
                sound={false}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-slate-400">
                  <Camera className="mx-auto size-10" />
                  <p className="mt-4 text-sm">Choose a session before starting the camera scanner.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {scannerError ? (
          <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {scannerError}
          </p>
        ) : null}
      </Card>

      <div className="space-y-6">
        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Latest scan</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Check-in result</h2>

          {lastResult ? (
            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/4 p-5">
              <div className="flex items-start gap-4">
                <div
                  className={
                    lastResult.status === "success"
                      ? "rounded-2xl bg-emerald-500/16 p-3 text-emerald-200"
                      : "rounded-2xl bg-amber-400/16 p-3 text-amber-200"
                  }
                >
                  {lastResult.status === "success" ? (
                    <CircleCheckBig className="size-6" />
                  ) : (
                    <OctagonAlert className="size-6" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold capitalize text-white">
                    {lastResult.status.replaceAll("_", " ")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {lastResult.checkedInAt ? formatDate(lastResult.checkedInAt) : "No timestamp available"}
                  </p>
                </div>
              </div>

              {lastResult.attendee ? (
                <div className="mt-6 flex items-center gap-4 rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
                  <img
                    alt={lastResult.attendee.name}
                    className="size-16 rounded-[22px] object-cover ring-1 ring-white/10"
                    src={
                      lastResult.attendee.profileImageUrl ??
                      "https://placehold.co/160x160/0f172a/f8fafc?text=QR"
                    }
                  />
                  <div>
                    <p className="font-semibold text-white">{lastResult.attendee.name}</p>
                    <p className="text-sm text-slate-400">{lastResult.attendee.email ?? "No email"}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-[28px] border border-dashed border-white/10 p-5 text-sm text-slate-400">
              Scan an attendee QR code to see the validation result here.
            </div>
          )}

          {checkInMutation.isError ? (
            <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {getErrorMessage(checkInMutation.error)}
            </p>
          ) : null}
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Fast operator flow</p>
          <div className="mt-5 space-y-3">
            {[
              {
                title: "1. Pick the session once",
                copy: "Set the target session before you start scanning so the line keeps moving.",
              },
              {
                title: "2. Scan or paste token",
                copy: "Use the camera for live check-ins or paste the token manually if needed.",
              },
              {
                title: "3. Confirm the result",
                copy: "See success, duplicate, or invalid QR status immediately with attendee details.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 rounded-[22px] border border-white/10 bg-white/4 p-4">
                <div className="rounded-xl bg-amber-300/12 p-2 text-amber-200">
                  <ScanLine className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
