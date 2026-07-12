import { useState } from "react";
import { API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, Table as TableIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProductionReport } from "@/hooks/api";
import { fetchWithAuth } from "@/config";

interface ProductionRecord {
    id: string;
    quantityKg: string;
    createdAt: string;
    hive: {
        hiveNumber: string;
        apiary: {
            name: string;
        }
    }
}

export function ProductionReportPage() {
    const { data: records = [], isLoading: loading } = useProductionReport();

    const downloadCsv = async () => {
        try {
            const res = await fetchWithAuth(`/reports/export?type=production&format=csv`);

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `production-report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            console.error("Download failed", e);
        }
    };

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
                    <h1 className="text-3xl font-bold">تقارير الإنتاج</h1>
                    <p className="text-muted-foreground">سجل تفصيلي لعمليات جني العسل</p>
                </div>
                <Button onClick={downloadCsv} className="gap-2 bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4" />
                    تصدير CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TableIcon className="w-5 h-5" />
                        السجلات الأخيرة
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="h-10 px-4 text-right font-medium">التاريخ</th>
                                    <th className="h-10 px-4 text-right font-medium">المنحل</th>
                                    <th className="h-10 px-4 text-right font-medium">رقم الخلية</th>
                                    <th className="h-10 px-4 text-right font-medium">الكمية (كجم)</th>
                                    <th className="h-10 px-4 text-right font-medium">النوع</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">لا توجد سجلات</td>
                                    </tr>
                                ) : (
                                    records.map((r: any, idx: number) => (
                                        <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="p-4">{r.date}</td>
                                            <td className="p-4">{r.apiary}</td>
                                            <td className="p-4">
                                                <Badge variant="outline">{r.hive}</Badge>
                                            </td>
                                            <td className="p-4 font-bold text-amber-600">{r.quantityKg}</td>
                                            <td className="p-4">{r.type}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
