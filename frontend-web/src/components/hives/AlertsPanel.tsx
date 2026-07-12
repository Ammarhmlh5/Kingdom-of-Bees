
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bell,
    AlertTriangle,
    AlertCircle,
    Info,
    Clock,
    ArrowRight
} from 'lucide-react';

interface AlertsPanelProps {
    hives: any[];
}

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    hiveNumber?: string;
    timestamp: Date;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function AlertsPanel({ hives }: AlertsPanelProps) {
    // Generate alerts based on hive conditions
    const generateAlerts = (): Alert[] => {
        const alerts: Alert[] = [];

        // Critical alerts - Weak hives
        hives.filter(h => h.condition === 'WEAK').forEach(hive => {
            alerts.push({
                id: `weak-${hive.id}`,
                type: 'critical',
                title: 'خلية ضعيفة',
                message: `الخلية #${hive.hiveNumber} في حالة ضعيفة وتحتاج تدخل فوري`,
                hiveNumber: hive.hiveNumber,
                timestamp: new Date()
            });
        });

        // Warning alerts - Hives with no condition (Pending Inspection)
        hives.filter(h => !h.strengthRating && !h.condition).forEach(hive => {
            alerts.push({
                id: `pending-${hive.id}`,
                type: 'warning',
                title: 'بيانات مفقودة',
                message: `الخلية #${hive.hiveNumber} لم يتم فحصها بعد أو تفتقر إلى تقييم القوة`,
                hiveNumber: hive.hiveNumber,
                timestamp: new Date()
            });
        });


        // Warning alerts - High priority inspection needed
        hives.filter(h => h.priority && h.priority > 7).forEach(hive => {
            alerts.push({
                id: `priority-${hive.id}`,
                type: 'warning',
                title: 'فحص عاجل مطلوب',
                message: `الخلية #${hive.hiveNumber} تحتاج فحص عاجل - ${hive.nextInspectionReason || 'متأخرة عن الموعد'}`,
                hiveNumber: hive.hiveNumber,
                timestamp: new Date()
            });
        });

        // Warning alerts - Old queens
        hives.filter(h => h.queenAge && h.queenAge > 3).forEach(hive => {
            alerts.push({
                id: `queen-${hive.id}`,
                type: 'warning',
                title: 'ملكة كبيرة في السن',
                message: `الخلية #${hive.hiveNumber} - الملكة عمرها ${hive.queenAge} سنوات، يُنصح بالاستبدال`,
                hiveNumber: hive.hiveNumber,
                timestamp: new Date()
            });
        });

        // Info alerts - Strong hives ready for split
        hives.filter(h => h.condition === 'EXCELLENT' && h.frames?.total >= 10).forEach(hive => {
            alerts.push({
                id: `split-${hive.id}`,
                type: 'info',
                title: 'جاهزة للتقسيم',
                message: `الخلية #${hive.hiveNumber} قوية وجاهزة للتقسيم`,
                hiveNumber: hive.hiveNumber,
                timestamp: new Date()
            });
        });

        // Sort by priority (critical > warning > info) and limit to 10
        return alerts
            .sort((a, b) => {
                const priority = { critical: 0, warning: 1, info: 2 };
                return priority[a.type] - priority[b.type];
            })
            .slice(0, 10);
    };

    const alerts = generateAlerts();

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-orange-600" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'critical':
                return 'border-l-red-500 bg-red-50';
            case 'warning':
                return 'border-l-orange-500 bg-orange-50';
            case 'info':
                return 'border-l-blue-500 bg-blue-50';
            default:
                return 'border-l-gray-500 bg-gray-50';
        }
    };

    const getAlertBadgeColor = (type: string) => {
        switch (type) {
            case 'critical':
                return 'bg-red-500 text-white';
            case 'warning':
                return 'bg-orange-500 text-white';
            case 'info':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getAlertTypeLabel = (type: string) => {
        switch (type) {
            case 'critical':
                return 'عاجل';
            case 'warning':
                return 'تحذير';
            case 'info':
                return 'معلومة';
            default:
                return type;
        }
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-600" />
                        <CardTitle>التنبيهات</CardTitle>
                    </div>
                    {alerts.length > 0 && (
                        <Badge className="bg-red-500 text-white">
                            {alerts.length}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {alerts.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">لا توجد تنبيهات</p>
                        <p className="text-sm text-gray-400 mt-1">جميع الخلايا في حالة جيدة</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {alerts.map(alert => (
                            <div
                                key={alert.id}
                                className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)} transition-all hover:shadow-md`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getAlertIcon(alert.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-900 text-sm">
                                                {alert.title}
                                            </h4>
                                            <Badge className={`${getAlertBadgeColor(alert.type)} text-xs`}>
                                                {getAlertTypeLabel(alert.type)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">
                                            {alert.message}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            <span>الآن</span>
                                        </div>
                                    </div>
                                </div>

                                {alert.action && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full mt-3 gap-2"
                                        onClick={alert.action.onClick}
                                    >
                                        {alert.action.label}
                                        <ArrowRight className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {alerts.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <Button variant="outline" className="w-full" size="sm">
                            عرض جميع التنبيهات
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
