
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Map as MapIcon,
    Store,
    Users,
    Settings,
    Hexagon,
    Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Owner Context Navigation
const navItems = [
    { label: 'الرئيسية', href: '/', icon: LayoutDashboard },
    { label: 'المناحل', href: '/apiaries', icon: MapIcon },
    { label: 'المتجر', href: '/marketplace', icon: Store },
    { label: 'فريق العمل', href: '/team', icon: Users },
    { label: 'الإعدادات', href: '/settings', icon: Settings },
];

export function OwnerLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background relative flex overflow-hidden font-sans" dir="rtl">
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar (Right Side for RTL) */}
            <aside className={cn(
                "fixed inset-y-0 right-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
                "bg-card border-l border-border shadow-sm flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Logo */}
                <div className="h-20 flex items-center px-8 border-b border-border/50">
                    <Hexagon className="w-8 h-8 text-primary fill-primary/20 ml-3" />
                    <div>
                        <h1 className="text-xl font-bold text-foreground">مملكة النحل</h1>
                        <p className="text-xs text-muted-foreground">لوحة المالك</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className={cn(
                                    "w-5 h-5 ml-3",
                                    isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                                )} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-6 border-t border-border/50">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                            {user?.fullName?.charAt(0) || 'م'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{user?.fullName || 'مستخدم'}</p>
                            <p className="text-xs text-muted-foreground">{user?.role === 'ADMIN' ? 'مدير النظام' : 'المالك'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/20">
                {/* Mobile Header */}
                <header className="h-16 flex items-center px-4 lg:hidden border-b border-border bg-card">
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </Button>
                    <span className="mr-4 font-bold text-lg">مملكة النحل</span>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
