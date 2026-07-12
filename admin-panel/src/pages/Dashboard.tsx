import { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { fetchWithAuth } from '@/config';
import { Users, AlertTriangle, Activity, Database, type LucideIcon } from "lucide-react";

interface Stats {
    totalUsers: number;
    totalApiaries: number;
    activeAlerts: number;
    todayOperations: number;
}

interface RecentActivity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <p className="text-2xl font-black text-gray-900">{value}</p>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                setLoading(true);

                // Fetch stats
                const statsResponse = await fetchWithAuth('/admin/stats');
                const statsData = await statsResponse.json();

                if (statsData.success) {
                    setStats(statsData.data);
                }

                // Fetch recent activities
                const activitiesResponse = await fetchWithAuth('/admin/activities?limit=5');
                const activitiesData = await activitiesResponse.json();

                if (activitiesData.success) {
                    setActivities(activitiesData.data);
                }
            } catch (err) {
                console.error('Failed to load dashboard data', err);
                setError(err instanceof Error ? err.message : 'فشل تحميل البيانات');
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            loadDashboardData();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 font-bold">خطأ: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">مرحباً، {user?.fullName} 👋</h1>
                    <p className="text-gray-500 mt-2">نظرة عامة على حالة النظام اليوم.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        النظام يعمل بكفاءة
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="إجمالي المستخدمين"
                    value={stats?.totalUsers || 0}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={Database}
                    label="إجمالي المناحل"
                    value={stats?.totalApiaries || 0}
                    color="bg-amber-500"
                />
                <StatCard
                    icon={AlertTriangle}
                    label="تنبيهات نشطة"
                    value={stats?.activeAlerts || 0}
                    color="bg-red-500"
                />
                <StatCard
                    icon={Activity}
                    label="عمليات اليوم"
                    value={stats?.todayOperations || 0}
                    color="bg-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
                    <h3 className="font-bold text-lg mb-4">آخر النشاطات</h3>
                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">لا توجد نشاطات حديثة</p>
                        ) : (
                            activities.map((activity, i) => (
                                <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-800">{activity.description}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(activity.timestamp).toLocaleString('ar-SA')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
                    <h3 className="font-bold text-lg mb-4">حالة الخوادم</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 border rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="font-bold">Backend API</span>
                            </div>
                            <span className="text-sm text-green-600 font-bold">4000 (Operational)</span>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="font-bold">Database</span>
                            </div>
                            <span className="text-sm text-green-600 font-bold">Connected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
