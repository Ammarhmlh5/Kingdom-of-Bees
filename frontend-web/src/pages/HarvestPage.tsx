import React, { useState, useEffect } from "react";
import { getMyHarvests } from "@/services/harvest";
import { Droplet, History, TrendingUp } from "lucide-react";

export default function HarvestPage() {
    const [harvests, setHarvests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getMyHarvests();
                setHarvests(data);
            } catch (e) {
                console.error("Failed to load harvests", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const totalHoney = harvests.filter(h => h.harvestType === 'HONEY').reduce((sum, h) => sum + Number(h.totalQuantity), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                <Droplet className="w-10 h-10 text-amber-500 fill-amber-500/10" />
                إدارة الحصاد
            </h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-8 rounded-3xl shadow-xl shadow-amber-500/20 text-white">
                            <span className="text-sm font-bold opacity-80 uppercase">إجمالي جني العسل</span>
                            <h2 className="text-5xl font-black mt-2">{totalHoney} كجم</h2>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-50">
                                    <th className="px-8 py-5">المنحل</th>
                                    <th className="px-8 py-5">المنتج</th>
                                    <th className="px-8 py-5">الكمية</th>
                                    <th className="px-8 py-5">التاريخ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {harvests.map(h => (
                                    <tr key={h.id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-8 py-5 font-black text-gray-800">{h.apiary?.name}</td>
                                        <td className="px-8 py-5">{h.harvestType}</td>
                                        <td className="px-8 py-5 text-lg font-black text-amber-600">{h.totalQuantity} كجم</td>
                                        <td className="px-8 py-5 text-gray-400">{new Date(h.harvestDate).toLocaleDateString('ar-SA')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
