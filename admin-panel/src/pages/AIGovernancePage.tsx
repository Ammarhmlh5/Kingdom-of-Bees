import React from 'react';
import { Shield, Eye, CheckCircle, AlertOctagon, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIGovernancePage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-purple-600 shadow-lg shadow-purple-500/20">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">حوكمة الذكاء الاصطناعي</h1>
                    <p className="text-muted-foreground text-sm">معدلات الدقة، معايير الأمان، وسجلات الاستجابة</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <GovernanceCard
                            title="دقة النماذج (Average)"
                            value="98.2%"
                            status="optimal"
                            trend="+0.4%"
                        />
                        <GovernanceCard
                            title="معدل التدخل البشري"
                            value="1.4%"
                            status="good"
                            trend="-0.2%"
                        />
                    </div>

                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="font-bold mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            حواجز الأمان (Safety Guardrails)
                        </h3>
                        <div className="space-y-4">
                            <GuardrailRow name="منع المحتوى الضار" status="active" checks="24k/24k" />
                            <GuardrailRow name="حماية البيانات الشخصية (PII)" status="active" checks="12k/12k" />
                            <GuardrailRow name="كشف التحيز (Bias Detection)" status="warning" checks="98.5%" />
                            <GuardrailRow name="الامتثالية للقوانين المحلية" status="active" checks="100%" />
                        </div>
                    </div>
                </div>

                {/* Compliance Sidebar */}
                <div className="glass-panel p-6 rounded-xl bg-gradient-to-b from-card to-card/50">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-accent">
                        <Eye className="w-5 h-5" />
                        المراجعة الحية
                    </h3>
                    <div className="space-y-4">
                        <div className="text-sm font-medium text-muted-foreground mb-2">آخر التنبيهات</div>
                        <AlertItem
                            time="10:42 AM"
                            msg="تم حظر استجابة غير ملائمة (Model V4)"
                            severity="high"
                        />
                        <AlertItem
                            time="09:15 AM"
                            msg="انخفاض في دقة التعرف على الصور"
                            severity="medium"
                        />
                        <AlertItem
                            time="08:30 AM"
                            msg="تحديث تلقائي للقواعد التنظيمية"
                            severity="low"
                        />

                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <div className="radial-progress text-primary text-xs font-bold mx-auto mb-2" style={{ "--value": 94, "--size": "80px" } as React.CSSProperties}>
                                94%
                            </div>
                            <div className="text-xs text-muted-foreground">درجة الامتثال الكلي</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface GovernanceCardProps {
  title: string;
  value: string;
  status: string;
  trend: string;
}

function GovernanceCard({ title, value, status, trend }: GovernanceCardProps) {
    return (
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
            <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-10 -mt-10 opacity-20",
                status === 'optimal' ? 'bg-emerald-500' : 'bg-primary'
            )} />
            <div className="text-sm text-muted-foreground font-medium mb-2">{title}</div>
            <div className="text-3xl font-bold tracking-tight mb-2">{value}</div>
            <div className="flex items-center gap-2 text-xs">
                <span className={cn("px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-500/10")}>{trend}</span>
                <span className="text-muted-foreground">مقارنة بالأسبوع الماضي</span>
            </div>
        </div>
    )
}

interface GuardrailRowProps {
  name: string;
  status: string;
  checks: string;
}

function GuardrailRow({ name, status, checks }: GuardrailRowProps) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
                {status === 'active' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                    <AlertOctagon className="w-5 h-5 text-amber-500" />
                )}
                <span className="text-sm font-medium">{name}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-muted-foreground">{checks}</span>
                <span className={cn("text-[10px] px-2 py-1 rounded-full border",
                    status === 'active' ? "border-emerald-500/30 text-emerald-400" : "border-amber-500/30 text-amber-400"
                )}>
                    {status === 'active' ? 'فعال' : 'مراجعة'}
                </span>
            </div>
        </div>
    )
}

interface AlertItemProps {
  time: string;
  msg: string;
  severity: string;
}

function AlertItem({ time, msg, severity }: AlertItemProps) {
    return (
        <div className="flex gap-3 items-start p-2 rounded hover:bg-white/5 transition-colors">
            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                severity === 'high' ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                    severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
            )} />
            <div>
                <div className="text-xs font-medium leading-relaxed">{msg}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{time}</div>
            </div>
        </div>
    )
}
