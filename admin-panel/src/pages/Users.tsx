import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/config';
import { Users as UsersIcon, Shield, Mail, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface User {
    id: string;
    fullName: string;
    email: string;
    userType: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    totalApiaries: number;
    totalHives: number;
    phone?: string;
    country?: string;
    region?: string;
    city?: string;
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadUsers() {
            try {
                setLoading(true);
                const response = await fetchWithAuth('/admin/users');
                const data = await response.json();
                if (data.success) {
                    setUsers(data.data);
                } else {
                    setError(data.error || 'فشل تحميل المستخدمين');
                }
            } catch (err) {
                console.error('Failed to load users', err);
                setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
            } finally {
                setLoading(false);
            }
        }
        loadUsers();
    }, []);

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
                        <UsersIcon className="w-8 h-8 text-blue-600" />
                        إدارة المستخدمين
                    </h1>
                    <p className="text-gray-500 mt-2">عرض وإدارة جميع مستخدمي النظام</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                        إجمالي المستخدمين: <span className="font-bold text-gray-900">{users.length}</span>
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">نشط</p>
                    <p className="text-2xl font-black text-green-600">
                        {users.filter(u => u.isActive).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">غير نشط</p>
                    <p className="text-2xl font-black text-red-600">
                        {users.filter(u => !u.isActive).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">مدراء</p>
                    <p className="text-2xl font-black text-purple-600">
                        {users.filter(u => u.userType === 'ADMIN').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">نحالين</p>
                    <p className="text-2xl font-black text-amber-600">
                        {users.filter(u => u.userType === 'OWNER').length}
                    </p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الاسم</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">البريد الإلكتروني</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">النوع</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المناحل</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الخلايا</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الموقع</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">تاريخ التسجيل</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                {user.fullName.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="w-4 h-4" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${user.userType === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                user.userType === 'OWNER' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            <Shield className="w-3 h-3" />
                                            {user.userType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-bold text-gray-900">{user.totalApiaries}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-bold text-gray-900">{user.totalHives}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.city || user.region || user.country ? (
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <MapPin className="w-3 h-3" />
                                                {[user.city, user.region, user.country].filter(Boolean).join(', ')}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">غير محدد</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.isActive ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    نشط
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" />
                                                    غير نشط
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="text-center py-12">
                        <UsersIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-400 font-medium">لا يوجد مستخدمين في النظام</p>
                    </div>
                )}
            </div>
        </div>
    );
}
