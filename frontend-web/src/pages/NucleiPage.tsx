import { Link, useSearchParams } from "react-router-dom";
import { useNuclei } from "@/hooks/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Box, Crown } from "lucide-react";

export function NucleiPage() {
    const [searchParams] = useSearchParams();
    const apiaryId = searchParams.get('apiaryId');

    const { data: nuclei = [], isLoading: loading } = useNuclei(apiaryId || '');

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
                        <Box className="w-8 h-8 text-blue-500" />
                        إدارة النويات
                    </h1>
                    <p className="text-muted-foreground mt-1">تتبع نمو النويات وقرارات التوسع</p>
                </div>
                {apiaryId && (
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4" />
                        إضافة نوية
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nuclei.map((nuc) => (
                    <Card key={nuc.id} className="hover:shadow-md transition-shadow border-blue-50">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-bold">
                                    {nuc.nucleusNumber} - {nuc.name || "بدون اسم"}
                                </CardTitle>
                                <Badge variant="outline">{nuc.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">عدد الإطارات:</span>
                                <span className="font-bold">{nuc.frameCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">الغرض:</span>
                                <span>{nuc.purpose}</span>
                            </div>
                            {nuc.queen ? (
                                <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-100 flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-green-600" />
                                    <span className="text-green-700 font-medium">الملكة: {nuc.queen.queenNumber}</span>
                                </div>
                            ) : (
                                <div className="mt-2 p-2 bg-yellow-50 rounded-md border border-yellow-100 text-yellow-700">
                                    بدون ملكة نشطة
                                </div>
                            )}

                            <div className="pt-4 flex gap-2">
                                <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                                    تحديث
                                </Button>
                                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                    تخريج (Hive)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {nuclei.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    لا توجد نويات في هذا العرض
                </div>
            )}
        </div>
    );
}
