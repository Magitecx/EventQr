import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/app-shell";
import { OrganizationRoute } from "./components/layout/organization-route";
import { ProtectedRoute } from "./components/layout/protected-route";
import { AccountSettingsPage } from "./pages/account-settings-page";
import { AttendanceReportPage } from "./pages/attendance-report-page";
import { AttendeeDetailPage } from "./pages/attendee-detail-page";
import { AttendeesPage } from "./pages/attendees-page";
import { DashboardPage } from "./pages/dashboard-page";
import { EventSeriesDetailPage } from "./pages/event-series-detail-page";
import { EventSeriesListPage } from "./pages/event-series-list-page";
import { InvitePage } from "./pages/invite-page";
import { LandingPage } from "./pages/landing-page";
import { LoginPage } from "./pages/login-page";
import { OnboardingPage } from "./pages/onboarding-page";
import { OrganizationSettingsPage } from "./pages/organization-settings-page";
import { RegisterPage } from "./pages/register-page";
import { ScannerPage } from "./pages/scanner-page";
import { SessionsManagementPage } from "./pages/sessions-management-page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="settings/account" element={<AccountSettingsPage />} />
          <Route element={<OrganizationRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path="settings/organization" element={<OrganizationSettingsPage />} />
            <Route path="event-series" element={<EventSeriesListPage />} />
            <Route path="event-series/:id" element={<EventSeriesDetailPage />} />
            <Route path="event-series/:id/sessions" element={<SessionsManagementPage />} />
            <Route path="attendees" element={<AttendeesPage />} />
            <Route path="attendees/:id" element={<AttendeeDetailPage />} />
            <Route path="scanner" element={<ScannerPage />} />
            <Route path="reports/event-series/:id" element={<AttendanceReportPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default App;
