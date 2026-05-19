export const SITE_NAME = "EventQR Hub";
export const DEFAULT_TITLE = "QR Attendance Platform for Recurring Events";
export const DEFAULT_DESCRIPTION =
  "EventQR Hub helps organizations run recurring workshops and event series with secure QR attendee check-ins, live scanning, and attendance reports.";

export function getSiteUrl() {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL;

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:5173";
}

export function getCanonicalUrl(pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteUrl()}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function buildTitle(title?: string) {
  return title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | ${DEFAULT_TITLE}`;
}
