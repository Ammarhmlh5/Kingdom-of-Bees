import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class SafeErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center" dir="rtl">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">عذراً، حدث خطأ غير متوقع</h1>
                    <p className="text-gray-600 mb-8 max-w-md">
                        حدث خطأ أثناء تحميل الصفحة. يرجى محاولة تحديث الصفحة أو العودة لاحقاً.
                    </p>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-left text-sm font-mono text-red-600 mb-6 max-w-2xl overflow-auto w-full">
                        {this.state.error?.toString()}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        تحديث الصفحة
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
