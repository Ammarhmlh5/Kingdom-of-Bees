import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AccessDeniedPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4" dir="rtl">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='%23dc2626' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}></div>
            </div>

            <div className="relative w-full max-w-2xl">
                {/* Animated Icon */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                        <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                            <ShieldAlert className="w-16 h-16 text-red-600" />
                        </div>
                        <div className="absolute inset-0 w-32 h-32 bg-red-200 rounded-full animate-ping opacity-20"></div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border-2 border-red-100 mt-16">
                    <div className="text-center space-y-6">
                        {/* Header */}
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                                ⛔ الوصول محظور
                            </h1>
                            <p className="text-xl font-bold text-gray-700">
                                هذه الصفحة متاحة فقط لمالكي المناحل
                            </p>
                        </div>

                        {/* User Info */}
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">👤</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-amber-600 font-bold uppercase">حسابك الحالي</p>
                                    <p className="text-lg font-black text-amber-900">
                                        {user?.role === 'WORKER' ? 'عامل (Worker)' : user?.role || 'غير محدد'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-amber-700 leading-relaxed">
                                للوصول إلى هذه الميزة، يرجى التواصل مع مالك المنحل للحصول على الصلاحيات المطلوبة.
                            </p>
                        </div>

                        {/* Explanation */}
                        <div className="bg-gray-50 rounded-2xl p-6 text-right">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-xl">ℹ️</span>
                                لماذا لا يمكنني الوصول؟
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">•</span>
                                    <span>هذه الصفحة تحتوي على معلومات حساسة مثل الماليات والإعدادات</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">•</span>
                                    <span>فقط مالكو المناحل لديهم صلاحية الوصول الكامل</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-1">•</span>
                                    <span>يمكنك الوصول إلى الخلايا، الفحوصات، والصحة بدون قيود</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link
                                to="/apiaries"
                                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                العودة إلى لوحة التحكم
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-5 h-5" />
                                تسجيل الخروج
                            </button>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -right-6 text-6xl opacity-30 animate-bounce">🔒</div>
                <div className="absolute -bottom-6 -left-6 text-6xl opacity-30 animate-bounce delay-300">🚫</div>
            </div>
        </div>
    );
}
