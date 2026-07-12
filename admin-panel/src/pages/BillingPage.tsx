import { CreditCard, DollarSign, Users, TrendingUp, Download, Check, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BillingPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-200">
                        إدارة الاشتراكات
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">الإحصائيات المالية والفواتير</p>
                </div>
                <button className="glass-card px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary hover:text-black transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    تصدير التقرير
                </button>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RevenueCard
                    title="الإيرادات الشهرية المتكررة (MRR)"
                    value="$42,500"
                    trend="+12%"
                    icon={DollarSign}
                    color="text-emerald-400"
                    bg="bg-emerald-500/10"
                />
                <RevenueCard
                    title="المشتركون النشطون"
                    value="1,240"
                    trend="+58"
                    icon={Users}
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                />
                <RevenueCard
                    title="الفواتير المعلقة"
                    value="$3,200"
                    trend="4 late"
                    icon={CreditCard}
                    color="text-amber-400"
                    bg="bg-amber-500/10"
                />
            </div>

            {/* Recent Transactions */}
            <div className="glass-panel rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-lg">المعاملات الأخيرة</h3>
                    <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-white/5 cursor-pointer hover:bg-white/10">الكل</span>
                        <span className="px-2 py-1 rounded cursor-pointer hover:bg-white/10 text-muted-foreground">ناجحة</span>
                        <span className="px-2 py-1 rounded cursor-pointer hover:bg-white/10 text-muted-foreground">معلقة</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-muted-foreground bg-white/5 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">رقم الفاتورة</th>
                                <th className="px-6 py-4">العميل</th>
                                <th className="px-6 py-4">الخطة</th>
                                <th className="px-6 py-4">المبلغ</th>
                                <th className="px-6 py-4">الحالة</th>
                                <th className="px-6 py-4">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <TransactionRow id="#INV-2024-001" client="مؤسسة النحل الذهبي" plan="Enterprise" amount="$450.00" status="paid" date="Jan 12, 2024" />
                            <TransactionRow id="#INV-2024-002" client="مزارع الجنوب" plan="Pro" amount="$120.00" status="paid" date="Jan 12, 2024" />
                            <TransactionRow id="#INV-2024-003" client="علي محمد" plan="Starter" amount="$29.00" status="failed" date="Jan 11, 2024" />
                            <TransactionRow id="#INV-2024-004" client="شركة العسل البري" plan="Enterprise" amount="$450.00" status="paid" date="Jan 11, 2024" />
                            <TransactionRow id="#INV-2024-005" client="سالم للأغذية" plan="Pro" amount="$120.00" status="pending" date="Jan 10, 2024" />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

interface RevenueCardProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

function RevenueCard({ title, value, trend, icon: Icon, color, bg }: RevenueCardProps) {
    return (
        <div className="glass-panel p-6 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>{trend}</span>
                </div>
            </div>
            <div className={cn("p-4 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]", bg, color)}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    )
}

interface TransactionRowProps {
  id: string;
  client: string;
  plan: string;
  amount: string;
  status: string;
  date: string;
}

function TransactionRow({ id, client, plan, amount, status, date }: TransactionRowProps) {
    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-4 font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">{id}</td>
            <td className="px-6 py-4 font-medium">{client}</td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/5 border border-white/5">
                    {plan}
                </span>
            </td>
            <td className="px-6 py-4 font-medium text-foreground">{amount}</td>
            <td className="px-6 py-4">
                <StatusBadge status={status} />
            </td>
            <td className="px-6 py-4 text-muted-foreground text-xs">{date}</td>
        </tr>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'paid') {
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Check className="w-3 h-3" /> مدفوع</span>
    }
    if (status === 'failed') {
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><X className="w-3 h-3" /> فشل</span>
    }
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"> معلق</span>
}
