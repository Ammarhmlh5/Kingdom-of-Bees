import { Link, useParams } from "react-router-dom";
import { useQueens } from "@/hooks/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Crown } from "lucide-react";

export function QueensPage() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const { data: queens = [], isLoading: loading } = useQueens({ apiaryId });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Crown className="w-8 h-8 text-yellow-500" />
                        إدارة الملكات
                    </h1>
                    <p className="text-muted-foreground mt-1">سجل السلالات وتتبع الأداء</p>
                </div>
                <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
                    <Plus className="w-4 h-4" />
                    إضافة ملكة
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {queens.map((queen: any) => (
                    <Link key={queen.id} to={`/queens/${queen.id}`}>
                        <Card className="hover:shadow-md transition-shadow border-amber-100 cursor-pointer h-full">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-bold">
                                        {queen.queenNumber || "ملكة بدون رقم"}
                                    </CardTitle>
                                    <Badge variant={queen.status === 'ACTIVE' ? 'default' : 'secondary'}
                                        className={queen.status === 'ACTIVE' ? 'bg-green-600' : ''}>
                                        {queen.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">السلالة:</span>
                                    <span className="font-medium">{queen.beeBreed?.name || "غير محدد"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">تاريخ الميلاد:</span>
                                    <span>{queen.birthDate ? new Date(queen.birthDate).toLocaleDateString('ar-SA') : '-'}</span>
                                </div>
                                {queen.currentHive && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">الموقع الحالي:</span>
                                        <Badge variant="outline">خلية {queen.currentHive.hiveNumber}</Badge>
                                    </div>
                                )}
                                {queen.currentNucleus && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">الموقع الحالي:</span>
                                        <Badge variant="outline">نوية {queen.currentNucleus.nucleusNumber}</Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
            {queens.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    لا توجد ملكات مسجلة حالياً
                </div>
            )}
        </div>
    );
}
