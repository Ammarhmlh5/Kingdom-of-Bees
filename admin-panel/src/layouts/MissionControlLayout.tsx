import { Layout, Bell, Search, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Activity, ShieldAlert, Cpu, Database, CreditCard, Terminal, Flower2 } from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { label: 'حالة النظام', href: '/', icon: Activity },
    { label: 'البنية التحتية', href: '/infra', icon: Cpu },
    { label: 'إدارة الأمراض والعلاجات', href: '/diseases', icon: Database },
    { label: 'مكتبة النباتات', href: '/plants', icon: Flower2 },
    { label: 'إدارة التنبيهات', href: '/alerts', icon: Bell },
    { label: 'حوكمة الذكاء الاصطناعي', href: '/ai-gov', icon: ShieldAlert },
    { label: 'الاشتراكات', href: '/billing', icon: CreditCard },
    { label: 'سجلات النظام', href: '/logs', icon: Terminal },
];

export function MissionControlLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col font-sans text-sm" dir="rtl">
            {/* Glass Header */}
            <header className="h-16 px-6 flex items-center justify-between glass-panel mx-4 mt-4 rounded-xl z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <Layout className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">لوحة الإدارة</h1>
                        <p className="text-[10px] text-muted-foreground">Kingdom of Bees v2.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors cursor-pointer" />
                    </div>
                    <div className="relative">
                        <Bell className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full border border-background"></span>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
                    <div className="flex items-center gap-3 glass-card px-3 py-1.5 rounded-full cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-muted flex items-center justify-center border border-white/10">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="hidden md:block text-left">
                            <div className="text-xs font-bold">Admin User</div>
                            <div className="text-[10px] text-muted-foreground">Super Admin</div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden pt-4 px-4 pb-4 gap-4">
                {/* Modern Sidebar */}
                <aside className="w-64 glass-panel rounded-xl flex flex-col py-6">
                    <div className="px-6 mb-6">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">القائمة الرئيسية</p>
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    className={({ isActive }) => cn(
                                        "flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                        isActive
                                            ? "bg-primary/10 text-primary font-semibold shadow-inner"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    )}
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                                            <item.icon className={cn("w-5 h-5 ml-3 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                            {item.label}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto px-6 pt-6 border-t border-white/5">
                        <div className="glass-card p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">حالة السيرفر</span>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full">ممتاز</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[92%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                                <span>CPU: 12%</span>
                                <span>RAM: 3.4GB</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Viewport */}
                <main className="flex-1 overflow-auto rounded-xl scrollbar-hide relative">
                    <div className="min-h-full pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
