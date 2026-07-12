
import { useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Hexagon,
    Menu,
    LogOut,
    ClipboardCheck,
    Stethoscope,
    Sprout,
    Crown,
    Utensils,
    DollarSign,
    History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useApiaryContext } from '@/contexts/ApiaryContext';

// Apiary Context Navigation (Operational)
const getNavItems = (apiaryId: string, isOwner: boolean) => {
    const baseItems = [
        { label: 'لوحة التحكم', href: `/apiary/${apiaryId}`, icon: LayoutDashboard },
        { label: 'التقييم اليومي', href: `/apiary/${apiaryId}/overview`, icon: Calendar },
        { label: 'الخلايا', href: `/apiary/${apiaryId}/hives`, icon: Hexagon },
        { label: 'مهام اليوم', href: `/apiary/${apiaryId}/inspections`, icon: ClipboardCheck },
        { label: 'التغذية', href: `/apiary/${apiaryId}/feeding`, icon: Utensils },
        { label: 'الصحة والعلاج', href: `/apiary/${apiaryId}/health`, icon: Stethoscope },
        { label: 'الملكات', href: `/apiary/${apiaryId}/queens`, icon: Crown },
    ];

    // Owner-only tabs
    const ownerItems = [
        { label: 'الحصاد', href: `/apiary/${apiaryId}/production`, icon: Sprout },
        { label: 'الماليات', href: `/apiary/${apiaryId}/financials`, icon: DollarSign },
    ];

    const commonItems = [
        { label: 'سجل العمليات', href: `/apiary/${apiaryId}/operations`, icon: History },
    ];

    return isOwner ? [...baseItems, ...ownerItems, ...commonItems] : [...baseItems, ...commonItems];
};

export function ApiaryLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { apiaryId, apiary, isLoading, isError } = useApiaryContext();

    if (isError) {
        return (
            <div className="flex h-screen items-center justify-center bg-red-50 text-red-900" dir="rtl">
                <div className="text-center p-8 bg-white rounded-lg shadow-xl border border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 font-bold text-2xl">!</div>
                    <h2 className="text-2xl font-bold mb-2">نأسف، حدث خطأ أثناء تحميل المنحل</h2>
                    <p className="mb-6 text-slate-600">لم نتمكن من استرجاع بيانات هذا المنحل. قد يكون الرابط غير صحيح أو حدثت مشكلة في الاتصال.</p>
                    <Button onClick={() => navigate('/apiaries')}>العودة لقائمة المناحل</Button>
                </div>
            </div>
        );
    }

    const isOwner = user?.role === 'OWNER' || user?.role === 'ADMIN';
    const navItems = getNavItems(apiaryId || '', isOwner);

    return (
        <div className="min-h-screen bg-background relative flex overflow-hidden font-sans" dir="rtl">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 right-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
                "bg-secondary text-secondary-foreground border-l border-white/10 shadow-lg flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Apiary Identity Header */}
                <div className="h-24 flex flex-col justify-center px-8 border-b border-white/10 bg-black/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Hexagon className="w-5 h-5 text-accent fill-accent/20" />
                        <span className="text-xs font-medium text-accent uppercase tracking-wider">منطقة عمل</span>
                    </div>
                    {isLoading ? (
                        <div className="h-6 w-3/4 bg-white/10 animate-pulse rounded"></div>
                    ) : (
                        <h1 className="text-xl font-bold truncate">{apiary?.name || 'منحل غير معروف'}</h1>
                    )}
                    {/* In real app, fetch apiary name using ID */}
                </div>



                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href; // Strict match might need adjustment for sub-routes
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-white text-secondary font-bold shadow-md"
                                        : "text-secondary-foreground/80 hover:bg-white/10"
                                )}
                            >
                                <Icon className={cn(
                                    "w-5 h-5 ml-3",
                                    "rtl:scale-x-[-1]", // Mirror icon for RTL
                                    isActive ? "text-secondary" : "text-white/70"
                                )} />

                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                
                {/* Global Logout Button */}
                <div className="p-4 border-t border-white/10 mt-auto bg-black/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                                {user?.fullName?.charAt(0) || 'م'}
                            </div>
                            <div className="text-sm">
                                <p className="font-bold text-white truncate w-24">{user?.fullName || 'مستخدم'}</p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => logout()}
                            className="text-white/60 hover:text-red-400 hover:bg-white/10"
                            title="تسجيل الخروج"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/20">
                {/* Desktop Header with Exit Button - Only on Dashboard */}
                {location.pathname === `/apiary/${id}` && (
                    <header className="hidden lg:flex h-16 items-center justify-between px-8 bg-white border-b border-gray-200">
                        <Button
                            variant="outline"
                            className="gap-2 text-gray-700 hover:bg-gray-100 border-gray-300"
                            onClick={() => navigate('/apiaries')}
                        >
                            <LogOut className="w-4 h-4" />
                            مغادرة المنحل
                        </Button>
                        <div className="flex-1"></div>
                    </header>
                )}

                {/* Mobile Header */}
                <header className="h-16 flex items-center px-4 lg:hidden bg-secondary text-white">
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="text-white hover:bg-white/20">
                        <Menu className="w-6 h-6" />
                    </Button>
                    <span className="mr-4 font-bold text-lg">{apiary?.name || 'جاري التحميل...'}</span>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-6xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
