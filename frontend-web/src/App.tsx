import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ApiaryLayout } from "./layouts/ApiaryLayout";
import { ProtectedRoute } from "./components/guards/ProtectedRoute";
import { ErrorBoundary } from "./components/errors/ErrorBoundary";
import { ApiaryProvider } from "./contexts/ApiaryContext";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

// Owner Pages
import { DashboardPage } from "./pages/DashboardPage";
import { ApiariesPage } from "./pages/ApiariesPage";
import CreateApiaryPage from "./pages/CreateApiaryPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { TeamPage } from "./pages/TeamPage";
import { HiveTemplatesPage } from "./pages/HiveTemplatesPage";
import HarvestPage from "./pages/HarvestPage";
import StoresPage from "./pages/StoresPage";
import HealthPage from "./pages/HealthPage";
import SettingsPage from "./pages/SettingsPage";

// Apiary Context Pages
import ApiaryOverviewPage from "./pages/context/ApiaryOverviewPage";
import ApiaryDashboardPage from "./pages/context/ApiaryDashboardPage";
import HivesPage from "./pages/context/HivesPage";
import { InspectionsPage } from "./pages/context/InspectionsPage";
import ProductionPage from "./pages/context/ProductionPage";
import FeedingPage from "./pages/context/FeedingPage";
import QueensPage from "./pages/context/QueensPage";
import FinancialsPage from "./pages/context/FinancialsPage";
import OperationsLogPage from "./pages/context/OperationsLogPage";
import GlobalFeedingPage from "./pages/GlobalFeedingPage";
import { InspectionSchedulesPage } from "./pages/InspectionSchedulesPage";

// Queen & Inspection Pages
import QueenDetailPage from "./pages/QueenDetailPage";
import InspectionDetailPage from "./pages/InspectionDetailPage";
import { HarvestDetailPage } from "./pages/HarvestDetailPage";

// Hive Pages
import HiveDetailPage from "./pages/HiveDetailPage";
import HiveAnalysisPage from "./pages/HiveAnalysisPage";
import { MergeHivePage } from "./pages/MergeHivePage";
import { SplitHivePage } from "./pages/SplitHivePage";
import FramesManagementPage from "./pages/FramesManagementPage";
import FrameDetailPage from "./pages/FrameDetailPage";

// Additional Pages
import AlertsPage from "./pages/AlertsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { BatchesPage } from "./pages/BatchesPage";
import DailyOperationsPage from "./pages/DailyOperationsPage";
import DiseasesLibraryPage from "./pages/DiseasesLibraryPage";
import { FloraPage } from "./pages/FloraPage";
import { WeatherPage } from "./pages/WeatherPage";
import { NewHarvestPage } from "./pages/NewHarvestPage";
import ReportDiseasePage from "./pages/ReportDiseasePage";
import DiseaseDetailPage from "./pages/DiseaseDetailPage";
import { BatchDetailPage } from "./pages/BatchDetailPage";

// Error Pages
import AccessDeniedPage from "./pages/AccessDeniedPage";
import NotFoundPage from "./pages/NotFoundPage";
import ServerErrorPage from "./pages/ServerErrorPage";
import JoinApiaryPage from "./pages/JoinApiaryPage";

// Placeholder for missing pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl m-4">
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p>هذه الصفحة قيد التطوير</p>
  </div>
);

// Create QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* Error Pages */}
              <Route path="/access-denied" element={<AccessDeniedPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="/500" element={<ServerErrorPage />} />

              {/* Join Apiary (Public) */}
              <Route path="/join" element={<JoinApiaryPage />} />

              {/* 1. Global Owner Routes (Headquarters) */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Outlet />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="apiaries" element={<ApiariesPage />} />
                <Route path="apiaries/new" element={<CreateApiaryPage />} />
                <Route path="harvest" element={<HarvestPage />} />
                <Route path="stores" element={<StoresPage />} />
                <Route path="health" element={<HealthPage />} />
                <Route
                  path="feeding"
                  element={<GlobalFeedingPage />}
                />
                <Route path="marketplace" element={<MarketplacePage />} />
                <Route
                  path="team"
                  element={
                    <ProtectedRoute allowedRoles={["OWNER"]}>
                      <TeamPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="templates" element={<HiveTemplatesPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Admin panel is hosted separately at port 3002 */}

              {/* 2. Apiary Context Routes (Scoped to Single Apiary) */}
              <Route
                path="/apiary/:id"
                element={
                  <ProtectedRoute>
                    <ApiaryProvider>
                      <ApiaryLayout>
                        <Outlet />
                      </ApiaryLayout>
                    </ApiaryProvider>
                  </ProtectedRoute>
                }
              >
                <Route index element={<ApiaryDashboardPage />} />
                <Route path="overview" element={<ApiaryOverviewPage />} />
                <Route path="hives" element={<HivesPage />} />
                <Route path="hives/:hiveId" element={<HiveDetailPage />} />
                <Route
                  path="hives/:hiveId/analysis"
                  element={<HiveAnalysisPage />}
                />
                <Route path="hives/:hiveId/merge" element={<MergeHivePage />} />
                <Route path="hives/:hiveId/split" element={<SplitHivePage />} />
                <Route path="frames" element={<FramesManagementPage />} />
                <Route path="frames/:frameId" element={<FrameDetailPage />} />
                <Route path="inspections" element={<InspectionsPage />} />
                <Route
                  path="inspections/:inspectionId"
                  element={<InspectionDetailPage />}
                />
                <Route path="schedules" element={<InspectionSchedulesPage />} />
                <Route path="feeding" element={<FeedingPage />} />
                <Route path="health" element={<HealthPage />} />
                <Route path="queens" element={<QueensPage />} />
                <Route path="queens/:id" element={<QueenDetailPage />} />
                <Route path="harvests/:id" element={<HarvestDetailPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="batches" element={<BatchesPage />} />
                <Route path="batches/:id" element={<BatchDetailPage />} />
                <Route path="daily" element={<DailyOperationsPage />} />
                <Route path="diseases" element={<DiseasesLibraryPage />} />
                <Route path="diseases/:id" element={<DiseaseDetailPage />} />
                <Route path="flora" element={<FloraPage />} />
                <Route path="weather" element={<WeatherPage />} />
                <Route path="new-harvest" element={<NewHarvestPage />} />
                <Route path="report-disease" element={<ReportDiseasePage />} />
                <Route
                  path="production"
                  element={
                    <ProtectedRoute allowedRoles={["OWNER"]}>
                      <ProductionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="financials"
                  element={
                    <ProtectedRoute allowedRoles={["OWNER"]}>
                      <FinancialsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="operations" element={<OperationsLogPage />} />
              </Route>

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
