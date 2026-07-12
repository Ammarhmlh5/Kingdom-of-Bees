import React, { useState, useEffect } from "react";
import { getStoreAnalytics } from "@/services/stores";
import { Warehouse, Package, Toolbox, Search } from "lucide-react";

export default function StoresPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const result = await getStoreAnalytics();
                setData(result);
            } catch (e) {
                console.error("Failed to load stores", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                        <Warehouse className="w-10 h-10 text-brand-600 fill-brand-600/10" />
                        إدارة المخازن
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg font-medium">مراقبة المخزون، الأدوات، والمنتجات النهائية.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <Package className="w-12 h-12 text-brand-600 mb-4" />
                        <h3 className="text-xl font-bold">المعدات</h3>
                        <p className="text-4xl font-black mt-2">{data?.equipment?.length || 0}</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <Toolbox className="w-12 h-12 text-blue-600 mb-4" />
                        <h3 className="text-xl font-bold">المنتجات</h3>
                        <p className="text-4xl font-black mt-2">{data?.products?.length || 0}</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <Search className="w-12 h-12 text-amber-600 mb-4" />
                        <h3 className="text-xl font-bold">السكر (مخزون)</h3>
                        <p className="text-4xl font-black mt-2">{data?.feedStock?.sugar || '0kg'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
