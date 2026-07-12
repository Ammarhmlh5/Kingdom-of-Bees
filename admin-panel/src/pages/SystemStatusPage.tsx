import { Activity, Database, Server, AlertTriangle, Cpu, Globe, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SystemStatusPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        نظرة عامة على النظام
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">مراقبة حية لأداء الخوادم والخدمات</p>
                </div>
                <div className="flex gap-2">
                    <span className="glass-card px-3 py-1 rounded-full text-xs flex items-center gap-2 text-emerald-400 border-emerald-400/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        جميع الأنظمة تعمل بكفاءة
                    </span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="وقت تشغيل الخادم"
                    value="14d 02h 12m"
                    icon={Server}
                    trend="up"
                    trendValue="100%"
                    gradient="from-blue-500/20 to-blue-600/5"
                    iconColor="text-blue-400"
                />
                <MetricCard
                    title="اتصال قاعدة البيانات"
                    value="مستقر"
                    icon={Database}
                    subValue="45/100 نشط"
                    gradient="from-emerald-500/20 to-emerald-600/5"
                    iconColor="text-emerald-400"
                />
                <MetricCard
                    title="معدل نقل البيانات"
                    value="842 req/s"
                    icon={Activity}
                    subValue="الذروة: 1.2k"
                    gradient="from-primary/20 to-primary/5"
                    iconColor="text-primary"
                />
                <MetricCard
                    title="معدل الأخطاء"
                    value="0.02%"
                    icon={AlertTriangle}
                    subValue="3 أخطاء حرجة"
                    gradient="from-destructive/20 to-destructive/5"
                    iconColor="text-destructive"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Log Stream */}
                <div className="lg:col-span-2 glass-panel rounded-xl p-6 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-accent/10">
                                <Activity className="w-5 h-5 text-accent" />
                            </div>
                            <h3 className="font-bold text-lg">سجل الأحداث المباشر</h3>
                        </div>
                        <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded-md border border-red-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            تسجيل حي
                        </span>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {/* Fading overlay */}
                        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-card to-transparent pointer-events-none z-10"></div>

                        <div className="h-full overflow-y-auto font-mono text-xs space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pt-4" dir="ltr">
                            <LogEntry time="14:20:01" level="INFO" message="Health check passed for worker-01" />
                            <LogEntry time="14:20:05" level="INFO" message="Incoming request GET /api/iot/readings" duration="20ms" />
                            <LogEntry time="14:20:12" level="SYSTEM" message="Scaling up worker pool..." color="text-primary" />
                            <LogEntry time="14:20:15" level="ERROR" message="Failed to sync with legacy sensor #X-99 (Timeout)" color="text-destructive" />
                            <LogEntry time="14:20:18" level="INFO" message="User login: auth_id=55 (IP: 192.168.1.10)" />
                            <LogEntry time="14:20:22" level="AI_EVENT" message="Model training batch #404 completed. Loss: 0.12" color="text-accent" />
                            <div className="border-t border-dashed border-white/10 my-2"></div>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex gap-3 opacity-30">
                                    <span className="text-muted-foreground w-16">14:19:{50 - i}</span>
                                    <span className="text-muted-foreground">DEBUG</span>
                                    <span className="text-muted-foreground">Background job processing...</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions (DevOps Only) */}
                <div className="glass-panel rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Cpu className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="font-bold text-lg">مركز القيادة</h2>
                    </div>

                    <div className="space-y-3">
                        <ActionButton label="مسح الذاكرة المؤقتة" command="CLEAR_CACHE --ALL" />
                        <ActionButton label="إعادة تشغيل العقد" command="RESTART_WORKER_NODES" />
                        <ActionButton label="تحديث DNS" command="FLUSH_DNS" />
                        <div className="pt-4 mt-4 border-t border-white/10">
                            <button className="w-full group relative overflow-hidden rounded-lg bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 transition-all duration-300 p-4 text-right">
                                <div className="relative z-10 flex items-center justify-between">
                                    <span className="text-destructive font-bold text-sm">إيقاف طوارئ</span>
                                    <AlertTriangle className="w-4 h-4 text-destructive group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="text-[10px] text-destructive/70 mt-1 relative z-10">يتطلب صلاحيات عليا (ROOT)</div>
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-semibold text-muted-foreground">حالة المناطق</span>
                        </div>
                        <div className="space-y-2">
                            <RegionStatus name="الرياض" status="active" />
                            <RegionStatus name="جدة" status="active" />
                            <RegionStatus name="الدمام" status="warning" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: string;
  trendValue?: string;
  gradient?: string;
  iconColor?: string;
}

function MetricCard({ title, value, subValue, icon: Icon, trend, trendValue, gradient, iconColor }: MetricCardProps) {
    return (
        <div className={cn("glass-panel rounded-xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300")}>
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", gradient)}></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2 rounded-lg bg-white/5 border border-white/5", iconColor)}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {trend && (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border",
                            trend === 'up' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                            {trendValue} {trend === 'up' ? '↗' : '↘'}
                        </span>
                    )}
                </div>
                <div className="text-muted-foreground text-xs mb-1 font-medium">{title}</div>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {subValue && <div className="text-[10px] text-muted-foreground mt-1 opacity-70">{subValue}</div>}
            </div>
        </div>
    )
}

interface LogEntryProps {
  time: string;
  level: string;
  message: string;
  duration?: string;
  color?: string;
}

function LogEntry({ time, level, message, duration, color }: LogEntryProps) {
    return (
        <div className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors -mx-1 px-2">
            <span className="text-muted-foreground w-16 opacity-60 font-mono">{time}</span>
            <span className={cn("font-bold w-16 font-mono",
                level === 'INFO' ? 'text-blue-400' :
                    level === 'ERROR' ? 'text-red-400' :
                        level === 'SYSTEM' ? 'text-amber-400' : 'text-purple-400'
            )}>{level}</span>
            <span className={cn("flex-1", color || "text-foreground/80")}>{message}</span>
            {duration && <span className="text-muted-foreground text-[10px] border border-white/10 px-1 rounded">{duration}</span>}
        </div>
    )
}

interface ActionButtonProps {
  label: string;
  command: string;
}

function ActionButton({ label, command }: ActionButtonProps) {
    return (
        <button className="w-full text-right px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all duration-200 group">
            <div className="text-sm font-medium group-hover:text-primary transition-colors">{label}</div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity" dir="ltr">&gt; {command}</div>
        </button>
    )
}

interface RegionStatusProps {
  name: string;
  status: string;
}

function RegionStatus({ name, status }: RegionStatusProps) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span>{name}</span>
            <span className={cn("w-2 h-2 rounded-full", status === 'active' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse')}></span>
        </div>
    )
}
