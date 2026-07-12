import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Activity } from 'lucide-react';
import { useHive } from '@/hooks/api';
import HiveFramesView from '../components/frames/HiveFramesView';
import HiveAnalysisCard from '../components/analysis/HiveAnalysisCard';
import AlertsList from '../components/alerts/AlertsList';

export default function HiveDetailPage() {
  const { hiveId } = useParams<{ hiveId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'frames' | 'analysis' | 'alerts' | 'info'>('frames');

  const { data: hive, isLoading: loading } = useHive(hiveId || '');



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!hive) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">الخلية غير موجودة</p>
        <button
          onClick={() => navigate('/hives')}
          className="mt-4 text-yellow-600 hover:text-yellow-700 underline"
        >
          العودة للخلايا
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/hives')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Activity className="w-8 h-8 text-yellow-600" />
              خلية #{hive.hiveNumber}
            </h1>
            <p className="text-gray-500 mt-1">
              {hive.apiary?.name} • {hive.hiveType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/hives/${hiveId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>تعديل</span>
          </button>
          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من حذف هذه الخلية؟')) {
                // TODO: Implement delete
                navigate('/hives');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('frames')}
            className={`pb-4 px-2 font-semibold transition-colors relative ${activeTab === 'frames'
              ? 'text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            الإطارات
            {activeTab === 'frames' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`pb-4 px-2 font-semibold transition-colors relative ${activeTab === 'analysis'
              ? 'text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            التحليل
            {activeTab === 'analysis' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-4 px-2 font-semibold transition-colors relative ${activeTab === 'alerts'
              ? 'text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            التنبيهات
            {activeTab === 'alerts' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-4 px-2 font-semibold transition-colors relative ${activeTab === 'info'
              ? 'text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            المعلومات
            {activeTab === 'info' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600"></div>
            )}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {activeTab === 'frames' && (
          <HiveFramesView hiveId={hiveId!} />
        )}

        {activeTab === 'analysis' && (
          <HiveAnalysisCard hiveId={hiveId!} />
        )}

        {activeTab === 'alerts' && (
          <AlertsList
            alerts={[]}
            showHiveInfo={false}
          />
        )}

        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600">رقم الخلية</label>
                <p className="text-lg font-semibold">{hive.hiveNumber}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">نوع الخلية</label>
                <p className="text-lg font-semibold">{hive.hiveType}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">الحالة</label>
                <p className="text-lg font-semibold">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {hive.status === 'ACTIVE' ? 'نشطة' : 'غير نشطة'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">المنحل</label>
                <p className="text-lg font-semibold">{hive.apiary?.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
