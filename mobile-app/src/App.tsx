import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
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
import { BeeCounterPage } from '@/pages/BeeCounterPage';

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

        <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
        <Route path="/shop" element={<AppLayout><ShopPage /></AppLayout>} />
        <Route path="/explore" element={<AppLayout><ExplorePage /></AppLayout>} />
        <Route path="/weather" element={<AppLayout><WeatherPage /></AppLayout>} />
        <Route path="/flora" element={<AppLayout><FloraPage /></AppLayout>} />
        <Route path="/advisor" element={<AppLayout><AdvisorPage /></AppLayout>} />
        <Route path="/guide" element={<AppLayout><GuidePage /></AppLayout>} />

        <Route path="/apiary/add" element={<AddApiaryPage />} />
        <Route path="/apiary/:id/hives" element={<HiveListPage />} />
        <Route path="/apiary/:id/hives/add" element={<AddHivePage />} />

        <Route path="/hive/:id" element={<HiveDetailPage />} />
        <Route path="/hive/:id/inspect" element={<InspectionPage />} />
        <Route path="/hive/:id/disease" element={<DiseasePage />} />
        <Route path="/hive/:id/queen" element={<QueenPage />} />
        <Route path="/hive/:id/merge" element={<MergePage />} />
        <Route path="/hive/:id/feed" element={<FeedingPage />} />
        <Route path="/hive/:id/frames" element={<FramesPage />} />

        <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
        <Route path="/harvest" element={<AppLayout><HarvestPage /></AppLayout>} />
        <Route path="/alerts" element={<AppLayout><AlertsPage /></AppLayout>} />
        <Route path="/apiary/:id/team" element={<AppLayout><TeamPage /></AppLayout>} />
        <Route path="/apiary/:id/health" element={<AppLayout><HealthPage /></AppLayout>} />
        <Route path="/bee-counter" element={<BeeCounterPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
