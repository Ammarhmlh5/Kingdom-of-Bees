// 📦 BatchDetailPage
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getBatchDetails, getBatchQR } from "@/services/traceability";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Printer } from "lucide-react";
import { useReactToPrint } from 'react-to-print';

export function BatchDetailPage() {
    const { id } = useParams();
    const [batch, setBatch] = useState<any>(null);
    const [qrData, setQrData] = useState<{ qrImage: string, url: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const printRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
    });

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    async function loadData() {
        try {
            const data = await getBatchDetails(id!);
            setBatch(data);

            // Fetch QR
            const qr = await getBatchQR(data.batchCode);
            setQrData(qr);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!batch) return <div>غير موجود</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold font-mono">الدفعة: {batch.batchCode}</h1>
                <Button onClick={() => handlePrint && handlePrint()} variant="secondary" className="gap-2">
                    <Printer className="w-4 h-4" /> طباعة الملصقات
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>بيانات الدفعة</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between border-b py-2">
                            <span className="text-gray-500">الكمية الإجمالية</span>
                            <span className="font-bold">{batch.totalQuantityKg} كجم</span>
                        </div>
                        <div className="flex justify-between border-b py-2">
                            <span className="text-gray-500">تاريخ الحصاد</span>
                            <span>{new Date(batch.harvestDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between border-b py-2">
                            <span className="text-gray-500">المنحل الأساسي</span>
                            <span>{batch.apiary?.name || "غير محدد"}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span className="text-gray-500">حالة المعالجة</span>
                            <span className="bg-green-100 text-green-800 px-2 rounded-full text-xs flex items-center">{batch.processingStatus}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>رمز التتبع (QR Code)</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-6 bg-white">
                        {qrData ? (
                            <>
                                <img src={qrData.qrImage} alt="QR Code" className="w-48 h-48 border-4 border-black" />
                                <p className="mt-4 text-sm text-gray-500 font-mono select-all text-center">
                                    {qrData.url}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">امسح الكود لعرض صفحة المستهلك</p>
                            </>
                        ) : <Loader2 className="animate-spin" />}
                    </CardContent>
                </Card>
            </div>

            {/* Hidden Print Component */}
            <div style={{ display: "none" }}>
                <div ref={printRef} className="p-8 grid grid-cols-3 gap-4">
                    {/* Generates a sheet of labels */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="border border-gray-300 p-4 rounded flex flex-col items-center justify-center text-center">
                            <h3 className="font-bold text-sm mb-2">عسل طبيعي فاخر</h3>
                            {qrData && <img src={qrData.qrImage} className="w-24 h-24" />}
                            <p className="font-mono text-xs mt-1">{batch.batchCode}</p>
                            <p className="text-[10px] text-gray-500">إنتاج المملكة - {new Date().getFullYear()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
