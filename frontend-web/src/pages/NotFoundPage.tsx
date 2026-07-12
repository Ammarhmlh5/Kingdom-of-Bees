import { Link } from 'react-router-dom';
import { Search, Home, Hexagon, ClipboardList, Heart } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4" dir="rtl">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='%233b82f6' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}></div>
            </div>

            <div className="relative w-full max-w-2xl">
                {/* Animated Icon */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                        <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
                            <Search className="w-16 h-16 text-blue-600" />
                        </div>
                        <div className="absolute inset-0 w-32 h-32 bg-blue-200 rounded-full animate-ping opacity-20"></div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border-2 border-blue-100 mt-16">
                    <div className="text-center space-y-6">
                        {/* Header */}
                        <div className="space-y-2">
                            <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
                                404
                            </h1>
                            <h2 className="text-3xl font-bold text-gray-800">
                                🔍 الصفحة غير موجودة
                            </h2>
                            <p className="text-lg text-gray-600">
                                عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-blue-50 rounded-2xl p-6">
                            <h3 className="font-bold text-blue-900 mb-4">الصفحات الشائعة:</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Link
                                    to="/apiaries"
                                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl hover:bg-blue-100 transition-colors group"
                                >
                                    <Home className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold text-gray-700">لوحة التحكم</span>
                                </Link>
                                <Link
                                    to="/apiary/1/hives"
                                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl hover:bg-blue-100 transition-colors group"
                                >
                                    <Hexagon className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold text-gray-700">الخلايا</span>
                                </Link>
                                <Link
                                    to="/apiary/1/inspections"
                                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl hover:bg-blue-100 transition-colors group"
                                >
                                    <ClipboardList className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold text-gray-700">الفحوصات</span>
                                </Link>
                            </div>
                        </div>

                        {/* Action Button */}
                        <Link
                            to="/apiaries"
                            className="inline-block w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Home className="w-5 h-5" />
                                العودة إلى الرئيسية
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -right-6 text-6xl opacity-30 animate-bounce">🔍</div>
                <div className="absolute -bottom-6 -left-6 text-6xl opacity-30 animate-bounce delay-300">❓</div>
            </div>
        </div>
    );
}
