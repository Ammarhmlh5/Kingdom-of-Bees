
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MissionControlLayout } from './layouts/MissionControlLayout';
import { AdminGuard } from './guards/AdminGuard';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { AIGovernancePage } from './pages/AIGovernancePage';
import { BillingPage } from './pages/BillingPage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { AlertsPage } from './pages/AlertsPage';
import Diseases from './pages/Diseases';
import Login from './pages/Login';
import { PlantsListPage } from './pages/PlantsListPage';
import { PlantFormPage } from './pages/PlantFormPage';
import { PlantDetailPage } from './pages/PlantDetailPage';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full text-muted-foreground" dir="rtl">
        // {title} (قيد التطوير) ...
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <AdminGuard>
                <MissionControlLayout>
                  <Routes>
                    <Route path="/" element={<SystemStatusPage />} />
                    <Route path="/infra" element={<InfrastructurePage />} />
                    <Route path="/diseases" element={<Diseases />} />
                    <Route path="/alerts" element={<AlertsPage />} />
                    <Route path="/ai-gov" element={<AIGovernancePage />} />
                    <Route path="/billing" element={<BillingPage />} />
                    <Route path="/plants" element={<PlantsListPage />} />
                    <Route path="/plants/new" element={<PlantFormPage />} />
                    <Route path="/plants/:id" element={<PlantDetailPage />} />
                    <Route path="/plants/:id/edit" element={<PlantFormPage />} />
                    <Route path="/logs" element={<PlaceholderPage title="سجلات النظام" />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </MissionControlLayout>
              </AdminGuard>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

