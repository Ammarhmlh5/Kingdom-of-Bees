import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings } from 'lucide-react';

export function SettingsLayout() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">الإعدادات</h1>
                <p className="text-muted-foreground">إدارة إعدادات الحساب والمناحل</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 space-y-2">
                    <NavLink
                        to="/settings/apiaries"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <LayoutDashboard size={20} />
                        إعدادات المناحل
                    </NavLink>
                    <NavLink
                        to="/settings/templates"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <Settings size={20} />
                        قوالب الخلايا
                    </NavLink>
                    <NavLink
                        to="/settings/team"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <Users size={20} />
                        إدارة الفريق
                    </NavLink>
                </aside>

                {/* Content */}
                <main className="flex-1 min-h-[500px] bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
