import { useEffect, useState } from 'react';
// import { fetchWithAuth } from '@/config';
import { FileText, Filter, Download } from 'lucide-react';

interface LogEntry {
    id: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    userId: string;
    userName: string;
    details?: unknown;
    ipAddress?: string;
    createdAt: string;
}

export default function Logs() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        async function loadLogs() {
            try {
                setLoading(true);
                // TODO: Implement API endpoint
                // const response = await fetchWithAuth('/admin/logs');
                // const data = await response.json();
                // if (data.success) {
                //     setLogs(data.data);
                // }

                // Mock data for now
                setLogs([]);
            } catch (err) {
                console.error('Failed to load logs', err);
                setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
            } finally {
                setLoading(false);
            }
        }
        loadLogs();
    }, [filter]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 font-bold">خطأ: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-purple-600" />
                        سجلات النظام
                    </h1>
                    <p className="text-gray-500 mt-2">عرض جميع العمليات والأنشطة في النظام</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                        <Filter className="w-5 h-5" />
                        تصفية
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                        <Download className="w-5 h-5" />
                        تصدير
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex gap-2">
                    {['all', 'auth', 'apiary', 'hive', 'inspection', 'admin'].map((filterType) => (
                        <button
                            key={filterType}
                            onClick={() => setFilter(filterType)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${filter === filterType
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {filterType === 'all' ? 'الكل' :
                                filterType === 'auth' ? 'المصادقة' :
                                    filterType === 'apiary' ? 'المناحل' :
                                        filterType === 'hive' ? 'الخلايا' :
                                            filterType === 'inspection' ? 'الفحوصات' :
                                                'الإدارة'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs Table */}
            {logs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">لا توجد سجلات</h3>
                    <p className="text-gray-400">لم يتم تسجيل أي نشاط في النظام بعد</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الوقت</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المستخدم</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">العملية</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">النوع</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المعرف</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(log.createdAt).toLocaleString('ar-SA')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {log.userName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                                {log.resourceType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {log.resourceId ? log.resourceId.substring(0, 8) + '...' : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {log.ipAddress || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h4 className="font-bold text-amber-900 mb-2">معلومة</h4>
                <p className="text-amber-700 text-sm">
                    يتم الاحتفاظ بسجلات النظام لمدة 90 يوماً. للحصول على سجلات أقدم، يرجى تصدير البيانات بشكل دوري.
                </p>
            </div>
        </div>
    );
}
