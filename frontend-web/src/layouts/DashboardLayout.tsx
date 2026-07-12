
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Map as MapIcon,
    Store,
    Users,
    Settings,
    Menu,
    X,
    Hexagon,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { label: 'لوحة التحكم', href: '/', icon: LayoutDashboard },
    { label: 'المناحل', href: '/apiaries', icon: MapIcon },
    { label: 'السوق', href: '/marketplace', icon: Store },
    { label: 'فريق العمل', href: '/team', icon: Users },
    { label: 'الإعدادات', href: '/settings', icon: Settings },
];



export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false); // Mobile Menu
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop Sidebar Collapse
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50/50 relative flex overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-100/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 right-0 z-50 transform transition-all duration-300 ease-in-out lg:static lg:inset-auto",
                "bg-white/40 backdrop-blur-xl border-l border-white/20 shadow-xl", // Tech Luxury Glassmorphism
                isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
                isCollapsed ? "w-20" : "w-64"
            )}>
                <div className="h-full flex flex-col overflow-hidden">
                    {/* Logo */}
                    <div className={cn("h-20 flex items-center border-b border-white/10 transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-6")}>
                        <Hexagon className="w-8 h-8 text-amber-500 fill-amber-500/20 shrink-0" />
                        <span className={cn("text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent mr-2 transition-opacity duration-300 whitespace-nowrap", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                            مملكة النحل
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    title={isCollapsed ? item.label : ''}
                                    className={cn(
                                        "flex items-center py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                                        isCollapsed ? "justify-center px-0" : "px-4",
                                        isActive
                                            ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 shadow-sm"
                                            : "text-slate-600 hover:bg-white/50 hover:text-amber-600 hover:shadow-sm"
                                    )}
                                >
                                    <Icon className={cn(
                                        "w-5 h-5 transition-colors duration-300 shrink-0",
                                        isActive ? "text-amber-600" : "text-slate-400 group-hover:text-amber-500",
                                        "rtl:scale-x-[-1]",
                                        !isCollapsed && "ml-3"
                                    )} />
                                    <span className={cn("transition-all duration-300 whitespace-nowrap", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <div className={cn("absolute rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]", isCollapsed ? "right-1 top-4 w-1 h-1" : "left-4 w-1.5 h-1.5")} />
                                    )}
                                </Link>
                            );
                        })}


                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t border-white/10">
                        <div className={cn("flex flex-col rounded-xl bg-white/40 border border-white/20 backdrop-blur-md shadow-sm transition-all duration-300", isCollapsed ? "p-2 items-center" : "p-3")}>
                            <div className="flex items-center w-full mb-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 font-bold border-2 border-white shadow-inner shrink-0">
                                    {user?.fullName?.charAt(0) || 'م'}
                                </div>
                                <div className={cn("mr-3 transition-all duration-300 overflow-hidden", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 flex-1")}>
                                    <p className="text-sm font-bold text-slate-800 whitespace-nowrap truncate">{user?.fullName || 'مستخدم'}</p>
                                    <p className="text-xs text-slate-500 whitespace-nowrap">{user?.role === 'ADMIN' ? 'مدير النظام' : 'نحال'}</p>
                                </div>
                            </div>
                            {!isCollapsed && (
                                <Button
                                    variant="ghost"
                                    onClick={() => logout()}
                                    className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="تسجيل الخروج"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-bold text-sm">تسجيل الخروج</span>
                                </Button>
                            )}
                            {isCollapsed && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => logout()}
                                    className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="تسجيل الخروج"
                                >
                                    <LogOut className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Info */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-6 border-b border-white/10 bg-white/20 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsOpen(true)}>
                            <Menu className="w-6 h-6 text-slate-700" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={() => setIsCollapsed(!isCollapsed)}>
                            <Menu className="w-6 h-6 text-slate-700" />
                        </Button>
                        <h2 className="text-lg font-bold text-slate-800 hidden md:block">
                            {navItems.find(item => item.href === location.pathname)?.label || 'لوحة التحكم'}
                        </h2>
                    </div>


                    <div className="flex items-center gap-4">
                        {/* Right side of header (Notifications, etc) can go here */}
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
