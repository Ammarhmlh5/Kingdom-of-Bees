import { useParams, Link } from "react-router-dom";
import { useQueen } from "@/hooks/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Crown, Activity, Calendar, GitBranch } from "lucide-react";

export default function QueenDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: queen, isLoading: loading } = useQueen(id || '');

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    if (!queen) {
        return <div className="text-center py-10">لم يتم العثور على الملكة</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link to="/queens" className="text-muted-foreground hover:text-amber-600">
                            الملكات
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-semibold">{queen.queenNumber || 'بدون رقم'}</span>
                    </div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Crown className="w-8 h-8 text-amber-500" />
                        {queen.name || `الملكة ${queen.queenNumber}`}
                    </h1>
                </div>
                <Badge className={`px-4 py-1 text-base ${queen.status === 'ACTIVE' ? 'bg-green-600' : 'bg-gray-500'}`}>
                    {queen.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            البيانات الأساسية
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm text-muted-foreground block mb-1">السلالة</label>
                            <div className="font-medium text-lg">{queen.beeBreed?.name || 'غير محدد'}</div>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground block mb-1">تاريخ الميلاد</label>
                            <div className="font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {queen.birthDate ? new Date(queen.birthDate).toLocaleDateString('ar-SA') : 'غير مسجل'}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground block mb-1">الموقع الحالي</label>
                            {queen.hive ? (
                                <Link to={`/hives/${queen.hive.id}`}>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-amber-50">
                                        خلية رقم {queen.hive.hiveNumber}
                                    </Badge>
                                </Link>
                            ) : queen.currentNucleus ? (
                                <Link to={`/nuclei?id=${queen.currentNucleus.id}`}>
                                    {/* Ideally link to detail, but nuclei page is list for now */}
                                    <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">
                                        نوية رقم {queen.currentNucleus.name}
                                    </Badge>
                                </Link>
                            ) : (
                                <span className="text-gray-500">غير مسكنة</span>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground block mb-1">اللون / العلامة</label>
                            <div className="flex items-center gap-2">
                                {queen.markColor && (
                                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: queen.markColor.toLowerCase() }}></div>
                                )}
                                <span>{queen.markColor || 'غير معلمة'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lineage / Genealogy */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="w-5 h-5" />
                            شجرة النسب
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Mother */}
                        <div className="relative border-l-2 border-amber-200 pr-4 pb-4">
                            <div className="absolute -right-[9px] top-0 w-4 h-4 bg-amber-200 rounded-full"></div>
                            <label className="text-sm text-muted-foreground block mb-1">الأم</label>
                            {queen.motherQueen ? (
                                <Link to={`/queens/${queen.motherQueen.id}`} className="block hover:bg-amber-50 p-2 rounded transition">
                                    <div className="font-bold text-amber-800">{queen.motherQueen.name}</div>
                                    <div className="text-xs text-gray-500">{queen.motherQueen.name}</div>
                                </Link>
                            ) : (
                                <div className="text-gray-400 italic">غير معروفة</div>
                            )}
                        </div>

                        {/* Current */}
                        <div className="relative border-l-2 border-amber-500 pr-4 pb-4">
                            <div className="absolute -right-[9px] top-0 w-4 h-4 bg-amber-500 rounded-full border-2 border-white ring-2 ring-amber-100"></div>
                            <div className="font-bold text-lg">{queen.queenNumber}</div>
                            <div className="text-sm text-gray-500">الحالية</div>
                        </div>

                        {/* Daughters */}
                        <div>
                            <label className="text-sm text-muted-foreground block mb-2">البنات ({queen.daughters?.length || 0})</label>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {queen.daughters && queen.daughters.length > 0 ? (
                                    queen.daughters.map((daughter: any) => (
                                        <Link key={daughter.id} to={`/queens/${daughter.id}`} className="block">
                                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm">
                                                <span>{daughter.queenNumber}</span>
                                                <span className="text-xs text-gray-400">عرض</span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-400">لا يوجد بنات مسجلات</div>
                                )}
                            </div>
                        </div>

                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
