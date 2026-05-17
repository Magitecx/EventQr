import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/app-shell";
import { ProtectedRoute } from "./components/layout/protected-route";
import { AttendanceReportPage } from "./pages/attendance-report-page";
import { AttendeeDetailPage } from "./pages/attendee-detail-page";
import { AttendeesPage } from "./pages/attendees-page";
import { DashboardPage } from "./pages/dashboard-page";
import { EventSeriesDetailPage } from "./pages/event-series-detail-page";
import { EventSeriesListPage } from "./pages/event-series-list-page";
import { LandingPage } from "./pages/landing-page";
import { LoginPage } from "./pages/login-page";
import { RegisterPage } from "./pages/register-page";
import { ScannerPage } from "./pages/scanner-page";
import { SessionsManagementPage } from "./pages/sessions-management-page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="event-series" element={<EventSeriesListPage />} />
          <Route path="event-series/:id" element={<EventSeriesDetailPage />} />
          <Route path="event-series/:id/sessions" element={<SessionsManagementPage />} />
          <Route path="attendees" element={<AttendeesPage />} />
          <Route path="attendees/:id" element={<AttendeeDetailPage />} />
          <Route path="scanner" element={<ScannerPage />} />
          <Route path="reports/event-series/:id" element={<AttendanceReportPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default App;
