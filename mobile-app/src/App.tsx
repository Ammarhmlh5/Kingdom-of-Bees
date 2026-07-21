import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BottomNav } from '@/components/BottomNav';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ShopPage from '@/pages/ShopPage';
import ExplorePage from '@/pages/ExplorePage';
import WeatherPage from '@/pages/WeatherPage';
import FloraPage from '@/pages/FloraPage';
import AdvisorPage from '@/pages/AdvisorPage';
import GuidePage from '@/pages/GuidePage';
import AddApiaryPage from '@/pages/AddApiaryPage';
import HiveListPage from '@/pages/HiveListPage';
import AddHivePage from '@/pages/AddHivePage';
import HiveDetailPage from '@/pages/HiveDetailPage';
import InspectionPage from '@/pages/InspectionPage';
import DiseasePage from '@/pages/DiseasePage';
import FeedingPage from '@/pages/FeedingPage';
import QueenPage from '@/pages/QueenPage';
import MergePage from '@/pages/MergePage';
import FramesPage from '@/pages/FramesPage';
import SettingsPage from '@/pages/SettingsPage';
import HarvestPage from '@/pages/HarvestPage';
import AlertsPage from '@/pages/AlertsPage';
import TeamPage from '@/pages/TeamPage';
import HealthPage from '@/pages/HealthPage';
import BeeCounterPage from '@/pages/BeeCounterPage';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-bee-bg">
      {children}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
        <Route path="/shop" element={<ProtectedRoute><AppLayout><ShopPage /></AppLayout></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><AppLayout><ExplorePage /></AppLayout></ProtectedRoute>} />
        <Route path="/weather" element={<ProtectedRoute><AppLayout><WeatherPage /></AppLayout></ProtectedRoute>} />
        <Route path="/flora" element={<ProtectedRoute><AppLayout><FloraPage /></AppLayout></ProtectedRoute>} />
        <Route path="/advisor" element={<ProtectedRoute><AppLayout><AdvisorPage /></AppLayout></ProtectedRoute>} />
        <Route path="/guide" element={<ProtectedRoute><AppLayout><GuidePage /></AppLayout></ProtectedRoute>} />

        <Route path="/apiary/add" element={<ProtectedRoute><AddApiaryPage /></ProtectedRoute>} />
        <Route path="/apiary/:id/hives" element={<ProtectedRoute><HiveListPage /></ProtectedRoute>} />
        <Route path="/apiary/:id/hives/add" element={<ProtectedRoute><AddHivePage /></ProtectedRoute>} />

        <Route path="/hive/:id" element={<ProtectedRoute><HiveDetailPage /></ProtectedRoute>} />
        <Route path="/hive/:id/inspect" element={<ProtectedRoute><InspectionPage /></ProtectedRoute>} />
        <Route path="/hive/:id/disease" element={<ProtectedRoute><DiseasePage /></ProtectedRoute>} />
        <Route path="/hive/:id/queen" element={<ProtectedRoute><QueenPage /></ProtectedRoute>} />
        <Route path="/hive/:id/merge" element={<ProtectedRoute><MergePage /></ProtectedRoute>} />
        <Route path="/hive/:id/feed" element={<ProtectedRoute><FeedingPage /></ProtectedRoute>} />
        <Route path="/hive/:id/frames" element={<ProtectedRoute><FramesPage /></ProtectedRoute>} />

        <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/harvest" element={<ProtectedRoute><AppLayout><HarvestPage /></AppLayout></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AppLayout><AlertsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/apiary/:id/team" element={<ProtectedRoute><AppLayout><TeamPage /></AppLayout></ProtectedRoute>} />
        <Route path="/apiary/:id/health" element={<ProtectedRoute><AppLayout><HealthPage /></AppLayout></ProtectedRoute>} />
        <Route path="/bee-counter" element={<ProtectedRoute><BeeCounterPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
