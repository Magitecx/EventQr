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
import { formatDate, resolveMediaUrl } from "../lib/utils";
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
            <p className="text-sm font-semibold text-slate-900">Scanner</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900">Live check-in</h1>
          </div>
          <Badge>{sessionOptions.length} available sessions</Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Target session</span>
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
            <span className="mb-2 block text-sm font-medium text-slate-600">Manual token</span>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input onChange={(event) => setManualToken(event.target.value)} value={manualToken} />
              <Button className="shrink-0 sm:w-auto" onClick={() => submitToken(manualToken)} type="button" variant="secondary">
                Submit
              </Button>
            </div>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current target</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
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

        <div className="mt-6 overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3">
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
                  <p className="mt-4 text-sm">Choose a session first.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {scannerError ? (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {scannerError}
          </p>
        ) : null}
      </Card>

      <div className="space-y-6">
        <Card>
          <p className="text-sm font-semibold text-slate-900">Latest scan</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Result</h2>

          {lastResult ? (
            <div className="mt-6 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5">
              <div className="flex items-start gap-4">
                <div
                  className={
                    lastResult.status === "success"
                      ? "rounded-2xl bg-emerald-50 p-3 text-emerald-700"
                      : "rounded-2xl bg-amber-50 p-3 text-amber-700"
                  }
                >
                  {lastResult.status === "success" ? (
                    <CircleCheckBig className="size-6" />
                  ) : (
                    <OctagonAlert className="size-6" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold capitalize text-slate-900">
                    {lastResult.status.replaceAll("_", " ")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {lastResult.checkedInAt ? formatDate(lastResult.checkedInAt) : "No timestamp available"}
                  </p>
                </div>
              </div>

              {lastResult.attendee ? (
                <div className="mt-6 flex flex-col items-start gap-4 rounded-[24px] border border-[var(--color-border)] bg-white p-4 sm:flex-row sm:items-center">
                  <img
                    alt={lastResult.attendee.name}
                    className="size-16 rounded-[22px] object-cover ring-1 ring-[var(--color-border)]"
                    src={
                      resolveMediaUrl(lastResult.attendee.profileImageUrl) ??
                      "https://placehold.co/160x160/f7f5f0/334155?text=QR"
                    }
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{lastResult.attendee.name}</p>
                    <p className="text-sm text-slate-500">{lastResult.attendee.email ?? "No email"}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-[28px] border border-dashed border-[var(--color-border)] p-5 text-sm text-slate-500">
              Scan a QR code.
            </div>
          )}

          {checkInMutation.isError ? (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {getErrorMessage(checkInMutation.error)}
            </p>
          ) : null}
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-900">Flow</p>
          <div className="mt-5 space-y-3">
            {[
              {
                title: "Pick session",
              },
              {
                title: "Scan or paste",
              },
              {
                title: "Confirm result",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                  <ScanLine className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
