import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    Users,
    Activity,
    LogOut,
    ShieldCheck,
    LayoutDashboard,
    Bug
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const menuItems = [
        { icon: LayoutDashboard, label: "لوحة التحكم", href: "/" },
        { icon: Users, label: "المستخدمين", href: "/users" },
        { icon: Bug, label: "إدارة الأمراض", href: "/diseases" },
        { icon: Activity, label: "سجل النظام", href: "/logs" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-l shadow-sm flex flex-col fixed h-full z-10">
                <div className="p-6 border-b flex items-center gap-3">
                    <div className="w-10 h-10 bg-admin-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-admin-600/20">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-tight">الإدارة</h1>
                        <p className="text-xs text-gray-500">مملكة النحل</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                                    isActive
                                        ? "bg-admin-50 text-admin-700 font-bold"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon size={20} className={isActive ? "text-admin-600" : "text-gray-400"} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t bg-gray-50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-admin-200 flex items-center justify-center text-admin-700 font-bold text-sm">
                            {user?.fullName?.charAt(0) || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} />
                        تسجيل خروج
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 mr-64 p-8">
                <Outlet />
            </main>
        </div>
    );
}
