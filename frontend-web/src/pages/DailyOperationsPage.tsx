// 🐝 DailyOperationsPage
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    getDailyOperations,
    getOperationStats,
    getOperationTypes,
    deleteOperation,
    DailyOperation,
    OperationStats,
    OperationType
} from '@/services/operations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
    Calendar,
    Filter,
    Trash2,
    TrendingUp,
    Users,
    Activity,
    BarChart3,
    Clock
} from 'lucide-react';

export default function DailyOperationsPage() {
    const { apiaryId } = useParams<{ apiaryId: string }>();
    const [operations, setOperations] = useState<DailyOperation[]>([]);
    const [stats, setStats] = useState<OperationStats | null>(null);
    const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedWorker, setSelectedWorker] = useState('');

    // Delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [operationToDelete, setOperationToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchOperationTypes();
        fetchData();
    }, [apiaryId]);

    const fetchOperationTypes = async () => {
        try {
            const types = await getOperationTypes();
            setOperationTypes(types);
        } catch (error) {
            console.error('Failed to load operation types:', error);
        }
    };

    const fetchData = async () => {
        if (!apiaryId) return;

        setLoading(true);
        try {
            const [opsData, statsData] = await Promise.all([
                getDailyOperations({
                    apiaryId,
                    startDate,
                    endDate,
                    operationType: selectedType,
                    performedBy: selectedWorker
                }),
                getOperationStats({ apiaryId, startDate, endDate })
            ]);

            setOperations(opsData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load operations:', error);
            toast.error('فشل تحميل العمليات');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!operationToDelete) return;

        try {
            await deleteOperation(operationToDelete);
            toast.success('تم حذف العملية بنجاح');
            setDeleteDialogOpen(false);
            setOperationToDelete(null);
            fetchData();
        } catch (error) {
            console.error('Failed to delete operation:', error);
            toast.error('فشل حذف العملية');
        }
    };

    const getOperationIcon = (type: string) => {
        // Return appropriate icon based on operation type
        return <Activity className="w-5 h-5" />;
    };

    const getOperationColor = (type: string) => {
        const colors: Record<string, string> = {
            'FRAME_TRANSFER': 'bg-blue-100 text-blue-800 border-blue-200',
            'FOUNDATION_ADD': 'bg-green-100 text-green-800 border-green-200',
            'QUEEN_REPLACE': 'bg-purple-100 text-purple-800 border-purple-200',
            'INSPECTION': 'bg-amber-100 text-amber-800 border-amber-200',
            'FEEDING': 'bg-orange-100 text-orange-800 border-orange-200',
            'TREATMENT': 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">جاري تحميل العمليات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-amber-600" />
                        أعمال اليوم
                    </h1>
                    <p className="text-gray-500 mt-1">سجل توثيقي لجميع العمليات في المنحل</p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                إجمالي العمليات
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-600">
                                {stats.totalOperations}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                أكثر عملية
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-blue-600">
                                {operationTypes.find(t => t.value === stats.mostCommonOperation.type)?.label || stats.mostCommonOperation.type}
                            </div>
                            <div className="text-sm text-gray-500">
                                {stats.mostCommonOperation.count} مرة
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                أكثر عامل نشاطاً
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-green-600">
                                {stats.mostActiveWorker.name}
                            </div>
                            <div className="text-sm text-gray-500">
                                {stats.mostActiveWorker.count} عملية
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                أنواع العمليات
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">
                                {Object.keys(stats.operationsByType).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        فلترة العمليات
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>من تاريخ</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>إلى تاريخ</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>نوع العملية</Label>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="جميع الأنواع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">جميع الأنواع</SelectItem>
                                    {operationTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={fetchData}
                                className="w-full bg-amber-600 hover:bg-amber-700"
                            >
                                تطبيق الفلتر
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Operations Timeline */}
            <div className="space-y-4">
                {operations.length === 0 ? (
                    <Card className="border-2 border-dashed">
                        <CardContent className="py-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                لا توجد عمليات
                            </h3>
                            <p className="text-gray-500">
                                لم يتم تسجيل أي عمليات في الفترة المحددة
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    operations.map((operation) => (
                        <Card
                            key={operation.id}
                            className="hover:shadow-md transition-shadow"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-3 rounded-lg ${getOperationColor(operation.operationType)}`}>
                                            {getOperationIcon(operation.operationType)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={getOperationColor(operation.operationType)}>
                                                    {operationTypes.find(t => t.value === operation.operationType)?.label || operation.operationType}
                                                </Badge>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(operation.operationDate).toLocaleString('ar-SA')}
                                                </span>
                                            </div>

                                            <h3 className="font-semibold text-lg mb-1">
                                                {operation.operationData.description}
                                            </h3>

                                            {operation.operationData.details && (
                                                <p className="text-gray-600 text-sm mb-2">
                                                    {operation.operationData.details}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                {operation.hiveNumber && (
                                                    <span>خلية #{operation.hiveNumber}</span>
                                                )}
                                                {operation.apiaryName && (
                                                    <span>منحل: {operation.apiaryName}</span>
                                                )}
                                            </div>

                                            {operation.notes && (
                                                <p className="text-sm text-gray-600 mt-2 italic">
                                                    ملاحظات: {operation.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            setOperationToDelete(operation.id);
                                            setDeleteDialogOpen(true);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف هذه العملية؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
