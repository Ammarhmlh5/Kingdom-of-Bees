import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, X, ClipboardCheck, AlertTriangle, Activity, Thermometer, Droplets, Wind, Scale } from 'lucide-react';
import { useInspection, useHiveFrames, useCreateSnapshot } from '@/hooks/api';
import { Frame, CreateSnapshotData } from '../services/frames';
import FrameCard from '../components/frames/FrameCard';
import FrameEditor from '../components/frames/FrameEditor';

export default function InspectionDetailPage() {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();

  const { data: inspection, isLoading: loadingInspection } = useInspection(inspectionId || '');
  const { data: frames = [], isLoading: loadingFrames } = useHiveFrames(inspection?.hive?.id || '');
  const createSnapshotMutation = useCreateSnapshot();

  const loading = loadingInspection || loadingFrames;

  const [editingFrameId, setEditingFrameId] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [frameId: string]: string }>({});

  const handleFrameUpdate = async (frameId: string) => {
    try {
      const frame = frames.find((f: any) => f.id === frameId);
      if (!frame) return;

      const snapshotData: CreateSnapshotData = {
        inspectionId: inspectionId || '',
        notes: notes[frameId] || undefined,
        sideAHoneyPercentage: frame.sideAHoneyPercentage,
        sideABroodPercentage: frame.sideABroodPercentage,
        sideAPollenPercentage: frame.sideAPollenPercentage,
        sideABroodType: frame.sideABroodType,
        sideABroodAge: frame.sideABroodAge,
        sideBHoneyPercentage: frame.sideBHoneyPercentage,
        sideBBroodPercentage: frame.sideBBroodPercentage,
        sideBPollenPercentage: frame.sideBPollenPercentage,
        sideBBroodType: frame.sideBBroodType,
        sideBBroodAge: frame.sideBBroodAge,
      };

      await createSnapshotMutation.mutateAsync({ apiaryId: (inspection as any)?.apiaryId || '', hiveId: inspection?.hive?.id || '', data: snapshotData });
      setEditingFrameId(null);
    } catch (error: any) {
      alert('فشل حفظ التحديث: ' + error.message);
    }
  };

  const handleSaveAll = async () => {
    try {
      const promises = frames.map((frame: any) => {
        const snapshotData: CreateSnapshotData = {
          inspectionId: inspectionId || '',
          notes: notes[frame.id] || undefined,
          sideAHoneyPercentage: frame.sideAHoneyPercentage,
          sideABroodPercentage: frame.sideABroodPercentage,
          sideAPollenPercentage: frame.sideAPollenPercentage,
          sideABroodType: frame.sideABroodType,
          sideABroodAge: frame.sideABroodAge,
          sideBHoneyPercentage: frame.sideBHoneyPercentage,
          sideBBroodPercentage: frame.sideBBroodPercentage,
          sideBPollenPercentage: frame.sideBPollenPercentage,
          sideBBroodType: frame.sideBBroodType,
          sideBBroodAge: frame.sideBBroodAge,
        };
        return createSnapshotMutation.mutateAsync({ apiaryId: (inspection as any)?.apiaryId || '', hiveId: inspection?.hive?.id || '', data: snapshotData });
      });

      await Promise.all(promises);

      alert('تم حفظ جميع التحديثات بنجاح');
      navigate(`/inspections/${inspectionId}`);
    } catch (error: any) {
      alert('فشل حفظ التحديثات: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">الفحص غير موجود</p>
        <button
          onClick={() => navigate('/inspections')}
          className="mt-4 text-yellow-600 hover:text-yellow-700 underline"
        >
          العودة للفحوصات
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500" >
      {/* Header */}
      < div className="flex items-center justify-between" >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/inspections')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              فحص خلية #{inspection.hive?.hiveNumber}
            </h1>
            <p className="text-gray-500 mt-1">
              {new Date(inspection.inspectionDate ?? inspection.createdAt ?? '').toLocaleDateString('ar-SA')} • {inspection.inspectionType}
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-semibold"
        >
          <Save className="w-5 h-5" />
          <span>حفظ جميع التحديثات</span>
        </button>
      </div >

      {/* Report Summary & Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
            <ClipboardCheck className="w-5 h-5 text-yellow-600" />
            ملخص الحالة
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Scale className="w-4 h-4" />
                <span>التقييم العام</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${inspection.overallAssessment === 'EXCELLENT' ? 'bg-green-100 text-green-700' :
                  inspection.overallAssessment === 'GOOD' ? 'bg-blue-100 text-blue-700' :
                    inspection.overallAssessment === 'POOR' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                }`}>
                {inspection.overallAssessment}
              </span>
            </div>

            {inspection.weatherConditions && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Wind className="w-4 h-4" />
                  <span>الطقس</span>
                </div>
                <span className="font-medium text-gray-900">{inspection.weatherConditions}</span>
              </div>
            )}

            {inspection.temperatureCelsius && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Thermometer className="w-4 h-4" />
                  <span>درجة الحرارة</span>
                </div>
                <span className="font-medium text-gray-900">{inspection.temperatureCelsius}°C</span>
              </div>
            )}

            <div className="pt-4 border-t border-gray-50">
              <p className="text-sm text-gray-500 mb-2 font-semibold">ملاحظات عامة:</p>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {inspection.notes || 'لا توجد ملاحظات مسجلة.'}
              </p>
            </div>
          </div>
        </div>

        {/* Findings & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Findings */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              الملاحظات المكتشفة ({inspection.findings?.length || 0})
            </h3>
            {(inspection.findings?.length ?? 0) > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inspection.findings?.map((finding: any) => (
                  <div key={finding.id} className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-red-800">{finding.title}</span>
                      <span className="px-2 py-0.5 bg-white rounded text-[10px] font-bold text-red-600 border border-red-100">
                        {finding.severity}
                      </span>
                    </div>
                    <p className="text-sm text-red-700/80 mb-2">{finding.description}</p>
                    {finding.recommendedAction && (
                      <div className="text-xs text-red-600 bg-red-100/50 p-2 rounded-lg">
                        <span className="font-bold">توصية:</span> {finding.recommendedAction}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                لا توجد ملاحظات غير طبيعية مسجلة
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-500" />
              الإجراءات المتخذة ({inspection.actions?.length || 0})
            </h3>
            {(inspection.actions?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {inspection.actions?.map((action: any) => (
                  <div key={action.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
                    <div>
                      <span className="block font-bold text-gray-900 text-sm mb-0.5">{action.actionType.replace(/_/g, ' ')}</span>
                      <p className="text-gray-600 text-xs">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                لم يتم تسجيل أي إجراءات
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      < div className="bg-blue-50 border border-blue-200 rounded-lg p-4" >
        <p className="text-blue-800 text-sm">
          💡 قم بتحديث حالة كل إطار أثناء الفحص. سيتم حفظ جميع التحديثات كلقطات مرتبطة بهذا الفحص.
        </p>
      </div >

      {/* Frames Grid */}
      < div className="space-y-6" >
        {
          frames.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">لا توجد إطارات لهذه الخلية</p>
            </div>
          ) : (
            <>
              {/* Group by story */}
              {Array.from(new Set(frames.map((f: any) => f.story))).sort().map((story: any) => (
                <div key={story} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-xl font-bold mb-4">طابق {story}</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {frames
                      .filter((f: any) => f.story === story)
                      .sort((a, b) => a.position - b.position)
                      .map((frame: any) => (
                        <div key={frame.id} className="space-y-3">
                          {/* Frame Card */}
                          <div className="relative">
                            {editingFrameId === frame.id ? (
                              <div className="border-2 border-yellow-500 rounded-lg p-4">
                                <FrameEditor
                                  frame={frame}
                                  onSave={() => handleFrameUpdate(frame.id)}
                                  onCancel={() => setEditingFrameId(null)}
                                />
                              </div>
                            ) : (
                              <div className="relative group">
                                <FrameCard
                                  frame={frame}
                                  onClick={() => setEditingFrameId(frame.id)}
                                />
                                <button
                                  onClick={() => setEditingFrameId(frame.id)}
                                  className="absolute top-2 left-2 p-2 bg-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">
                              ملاحظات (اختياري)
                            </label>
                            <textarea
                              value={notes[frame.id] || ''}
                              onChange={(e) => setNotes({ ...notes, [frame.id]: e.target.value })}
                              placeholder="أضف ملاحظات عن هذا الإطار..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </>
          )
        }
      </div >

      {/* Footer Actions */}
      < div className="flex justify-between items-center bg-white rounded-lg border border-gray-200 p-4" >
        <button
          onClick={() => navigate('/inspections')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>إلغاء</span>
        </button>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-semibold"
        >
          <Save className="w-5 h-5" />
          <span>حفظ جميع التحديثات</span>
        </button>
      </div >
    </div >
  );
}
