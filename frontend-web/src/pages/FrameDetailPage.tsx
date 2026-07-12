import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, History } from 'lucide-react';
import { useFrame, useDeleteFrame } from '@/hooks/api';
import type { Frame } from '../services/frames';
import FrameCard from '../components/frames/FrameCard';
import FrameEditor from '../components/frames/FrameEditor';
import FrameHistoryView from '../components/frames/FrameHistoryView';

export default function FrameDetailPage() {
  const { frameId } = useParams<{ frameId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data: frame, isLoading: loading, error: queryError, refetch: loadFrame } = useFrame(frameId || '');
  const deleteFrameMutation = useDeleteFrame();

  const error = queryError ? (queryError as any).message : null;

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الإطار؟')) {
      return;
    }

    try {
      await deleteFrameMutation.mutateAsync(frameId!);
      navigate(`/hives/${frame?.hiveId}`);
    } catch (err: any) {
      alert('فشل حذف الإطار: ' + err.message);
    }
  };

  const handleSave = async () => {
    setIsEditing(false);
    await loadFrame();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error || !frame) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'الإطار غير موجود'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-yellow-600 hover:text-yellow-700 underline"
        >
          العودة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/hives/${frame.hiveId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              إطار {frame.position} - طابق {frame.story}
            </h1>
            <p className="text-gray-500 mt-1">
              آخر تحديث: {new Date(frame.lastUpdated).toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showHistory
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            <History className="w-4 h-4" />
            <span>التاريخ</span>
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isEditing
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            <Edit className="w-4 h-4" />
            <span>{isEditing ? 'إلغاء' : 'تعديل'}</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frame Display/Editor */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? 'تعديل الإطار' : 'عرض الإطار'}
          </h2>

          {isEditing ? (
            <FrameEditor
              frameId={frameId!}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="flex justify-center">
              <FrameCard
                frame={frame}
                onClick={() => setIsEditing(true)}
              />
            </div>
          )}
        </div>

        {/* Frame Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4">معلومات الإطار</h2>

          <div className="space-y-4">
            {/* Position */}
            <div>
              <label className="text-sm text-gray-600">الموقع</label>
              <p className="text-lg font-semibold">
                طابق {frame.story} - موضع {frame.position}
              </p>
            </div>

            {/* Type */}
            {frame.frameType && (
              <div>
                <label className="text-sm text-gray-600">النوع</label>
                <p className="text-lg font-semibold">{frame.frameType}</p>
              </div>
            )}

            {/* Condition */}
            {frame.condition && (
              <div>
                <label className="text-sm text-gray-600">الحالة</label>
                <p className="text-lg font-semibold">{frame.condition}</p>
              </div>
            )}

            {/* Age */}
            {frame.ageYears !== undefined && (
              <div>
                <label className="text-sm text-gray-600">العمر</label>
                <p className="text-lg font-semibold">{frame.ageYears} سنة</p>
              </div>
            )}

            {/* Side A Summary */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold mb-2">الوجه أ</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">عسل:</span>
                  <span className="font-medium">{frame.sideAHoneyPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">حضنة:</span>
                  <span className="font-medium">{frame.sideABroodPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">لقاح:</span>
                  <span className="font-medium">{frame.sideAPollenPercentage}%</span>
                </div>
                {frame.sideABroodAge && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">عمر الحضنة:</span>
                    <span className="font-medium">{frame.sideABroodAge}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Side B Summary */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold mb-2">الوجه ب</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">عسل:</span>
                  <span className="font-medium">{frame.sideBHoneyPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">حضنة:</span>
                  <span className="font-medium">{frame.sideBBroodPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">لقاح:</span>
                  <span className="font-medium">{frame.sideBPollenPercentage}%</span>
                </div>
                {frame.sideBBroodAge && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">عمر الحضنة:</span>
                    <span className="font-medium">{frame.sideBBroodAge}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Updated By */}
            {frame.updatedBy && (
              <div className="pt-4 border-t border-gray-200">
                <label className="text-sm text-gray-600">آخر تحديث بواسطة</label>
                <p className="text-sm font-medium">{frame.updatedBy}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      {showHistory && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4">تاريخ الإطار</h2>
          <FrameHistoryView frameId={frameId!} limit={20} />
        </div>
      )}
    </div>
  );
}
