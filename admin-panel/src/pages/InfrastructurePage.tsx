import { Server, Activity, Cpu, HardDrive, Globe, Clock, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InfrastructurePage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        البنية التحتية
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">إدارة العقد (Nodes) وموارد الشبكة</p>
                </div>
                <div className="flex gap-2">
                    <span className="glass-card px-3 py-1 rounded-full text-xs flex items-center gap-2 text-primary border-primary/20">
                        <Activity className="w-3 h-3" />
                        حالة الشبكة: نشطة
                    </span>
                </div>
            </div>

            {/* Region/Cluster Map (Visual Placeholder) */}
            <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Globe className="w-24 h-24 text-primary/5" />
                </div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    توزيع العقد الجغرافي
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <RegionCard name="الرياض (Cluster A)" status="online" nodes={12} load="45%" />
                    <RegionCard name="جدة (Cluster B)" status="online" nodes={8} load="32%" />
                    <RegionCard name="الدمام (Cluster C)" status="maintenance" nodes={6} load="0%" />
                </div>
            </div>

            {/* Server Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <NodeCard
                    id="SRV-01"
                    role="Primary DB"
                    status="online"
                    cpu="45%"
                    memory="12GB/32GB"
                    uptime="14d"
                />
                <NodeCard
                    id="SRV-02"
                    role="Application v2"
                    status="online"
                    cpu="62%"
                    memory="8GB/16GB"
                    uptime="14d"
                />
                <NodeCard
                    id="SRV-03"
                    role="AI Inference"
                    status="high_load"
                    cpu="94%"
                    memory="60GB/64GB"
                    uptime="2d"
                />
                <NodeCard
                    id="SRV-04"
                    role="Application v2"
                    status="online"
                    cpu="22%"
                    memory="4GB/16GB"
                    uptime="14d"
                />
                <NodeCard
                    id="SRV-05"
                    role="Backup"
                    status="offline"
                    cpu="0%"
                    memory="0GB/16GB"
                    uptime="0d"
                />
            </div>
        </div>
    );
}

interface RegionCardProps {
  name: string;
  status: string;
  nodes: number;
  load: string;
}

function RegionCard({ name, status, nodes, load }: RegionCardProps) {
    return (
        <div className="glass-card p-4 rounded-lg border border-white/5 bg-black/20 hover:bg-white/5 transition-all">
            <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-sm">{name}</span>
                <StatusBadge status={status} />
            </div>
            <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>العقد النشطة</span>
                    <span className="font-mono text-foreground">{nodes}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>الحمل الحالي</span>
                    <span className={cn("font-mono", parseInt(load) > 80 ? "text-destructive" : "text-emerald-400")}>{load}</span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500",
                        status === 'maintenance' ? 'bg-amber-500 w-full opacity-50 striped-bg' : 'bg-primary'
                    )} style={{ width: status === 'maintenance' ? '100%' : load }}></div>
                </div>
            </div>
        </div>
    )
}

interface NodeCardProps {
  id: string;
  role: string;
  status: string;
  cpu: string;
  memory: string;
  uptime: string;
}

function NodeCard({ id, role, status, cpu, memory, uptime }: NodeCardProps) {
    return (
        <div className="glass-panel p-5 rounded-xl transition-all duration-300 hover:border-primary/30 group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg",
                        status === 'offline' ? 'bg-zinc-800 text-zinc-500' : 'bg-primary/10 text-primary'
                    )}>
                        <Server className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm tracking-tight">{id}</h4>
                        <p className="text-[10px] text-muted-foreground">{role}</p>
                    </div>
                </div>
                <StatusBadge status={status} />
            </div>

            <div className="space-y-3">
                <MetricRow icon={Cpu} label="CPU Load" value={cpu} warning={parseInt(cpu) > 90} />
                <MetricRow icon={HardDrive} label="Memory" value={memory} />
                <MetricRow icon={Clock} label="Uptime" value={uptime} />
            </div>

            {status !== 'offline' && (
                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                    <button className="flex-1 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground transition-colors">
                        Ssh
                    </button>
                    <button className="flex-1 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground transition-colors">
                        Logs
                    </button>
                    <button className="flex-1 py-1.5 text-xs bg-white/5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors">
                        Reboot
                    </button>
                </div>
            )}
        </div>
    )
}

interface MetricRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
  warning?: boolean;
}

function MetricRow({ icon: Icon, label, value, warning }: MetricRowProps) {
    return (
        <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
            </div>
            <span className={cn("font-mono font-medium", warning && "text-destructive animate-pulse")}>{value}</span>
        </div>
    )
}

const STATUS_STYLES: Record<string, string> = {
    online: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    offline: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    maintenance: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    high_load: "bg-destructive/10 text-destructive border-destructive/20"
};

const STATUS_LABELS: Record<string, string> = {
    online: "نشط",
    offline: "متوقف",
    maintenance: "صيانة",
    high_load: "ضغط عالي"
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] border flex items-center gap-1.5", STATUS_STYLES[status])}>
            <span className={cn("w-1.5 h-1.5 rounded-full",
                status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                    status === 'high_load' ? 'bg-destructive animate-ping' :
                        status === 'maintenance' ? 'bg-amber-500' : 'bg-zinc-500'
            )}></span>
            {STATUS_LABELS[status]}
        </span>
    )
}
