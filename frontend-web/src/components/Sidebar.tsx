import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
    Hexagon,
    LayoutGrid,
    ClipboardCheck,
    Warehouse,
    Droplet,
    Milk,
    Activity,
    Settings,
    LogOut,
    User
} from "lucide-react";

const menuItems = [
    { name: "إدارة المناحل", href: "/dashboard/apiaries", icon: Hexagon },
    { name: "إدارة الخلايا", href: "/dashboard/hives", icon: LayoutGrid },
    { name: "إدارة الفحوصات", href: "/dashboard/inspections", icon: ClipboardCheck },
    { name: "المخازن", href: "/dashboard/stores", icon: Warehouse },
    { name: "إدارة الحصاد", href: "/dashboard/harvest", icon: Droplet },
    { name: "إدارة التغذية", href: "/dashboard/feeding", icon: Milk },
    { name: "إدارة الصحة", href: "/dashboard/health", icon: Activity },
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 border-r bg-white h-screen sticky top-0 flex flex-col p-4 shadow-sm z-50">
            <div className="flex items-center gap-3 px-2 mb-8 border-b pb-6 border-brand-100/50">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-600/20">
                    🐝
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-lg leading-tight text-gray-900">مملكة النحل</span>
                    <span className="text-xs font-medium text-brand-600">لوحة النحال</span>
                </div>
            </div>

            {/* User Info */}
            {user && (
                <div className="mb-6 px-3 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white">
                            <User size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 truncate">{user.fullName || user.email}</p>
                            <p className="text-xs text-amber-600">{user.role === 'ADMIN' ? 'مشرف' : 'نحال'}</p>
                        </div>
                    </div>
                </div>
            )}

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
                                active
                                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                                    : "text-gray-500 hover:bg-brand-50 hover:text-brand-600"
                            )}
                        >
                            <item.icon size={20} className={active ? "text-white" : "text-brand-400"} />
                            <span className="font-bold text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-4 border-t mt-auto space-y-2">
                <Link
                    to="/settings"

                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
                >
                    <Settings size={20} />
                    <span className="font-medium text-sm">الاعدادات</span>
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">تسجيل خروج</span>
                </button>
            </div>
        </aside>
    );
}
