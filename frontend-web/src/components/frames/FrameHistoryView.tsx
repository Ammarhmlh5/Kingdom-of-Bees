import React, { useEffect, useState } from 'react';
import { frameService, FrameSnapshot } from '../../services/frames';
import BroodAgeIndicator from './BroodAgeIndicator';

interface FrameHistoryViewProps {
  apiaryId?: string;
  hiveId?: string;
  frameId: string;
  limit?: number;
}

const FrameHistoryView: React.FC<FrameHistoryViewProps> = ({ apiaryId, hiveId, frameId, limit = 10 }) => {
  const [snapshots, setSnapshots] = useState<FrameSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<FrameSnapshot | null>(null);

  useEffect(() => {
    loadHistory();
  }, [frameId, limit]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await frameService.getFrameHistory(apiaryId || '', hiveId || '', frameId);
      setSnapshots(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">خطأ: {error}</p>
        <button 
          onClick={loadHistory}
          className="mt-2 text-red-700 underline hover:text-red-800"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">لا توجد لقطات تاريخية لهذا الإطار</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        
        <div className="space-y-6">
          {snapshots.map((snapshot, index) => (
            <div key={snapshot.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute right-2.5 top-6 w-4 h-4 bg-yellow-500 rounded-full border-4 border-white shadow"></div>
              
              {/* Snapshot card */}
              <div 
                className={`mr-12 bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedSnapshot?.id === snapshot.id ? 'ring-2 ring-yellow-500' : ''
                }`}
                onClick={() => setSelectedSnapshot(selectedSnapshot?.id === snapshot.id ? null : snapshot)}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-600">{formatDate(snapshot.recordedAt ?? snapshot.capturedAt)}</p>
                    {snapshot.user && (
                      <p className="text-xs text-gray-500 mt-1">بواسطة: {snapshot.user.name ?? ''}</p>
                    )}
                  </div>
                  {snapshot.inspection && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      فحص
                    </span>
                  )}
                </div>

                {/* Quick summary */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  {/* Side A */}
                  <div className="border-r border-gray-200 pr-3">
                    <p className="text-xs text-gray-500 mb-2">الوجه أ</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>عسل:</span>
                        <span className={getPercentageColor(snapshot.sideAHoneyPercentage ?? 0)}>
                          {snapshot.sideAHoneyPercentage ?? 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>حضنة:</span>
                        <span className={getPercentageColor(snapshot.sideABroodPercentage ?? 0)}>
                          {snapshot.sideABroodPercentage ?? 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>لقاح:</span>
                        <span className={getPercentageColor(snapshot.sideAPollenPercentage ?? 0)}>
                          {snapshot.sideAPollenPercentage ?? 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Side B */}
                  <div className="pl-3">
                    <p className="text-xs text-gray-500 mb-2">الوجه ب</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>عسل:</span>
                        <span className={getPercentageColor(snapshot.sideBHoneyPercentage ?? 0)}>
                          {snapshot.sideBHoneyPercentage ?? 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>حضنة:</span>
                        <span className={getPercentageColor(snapshot.sideBBroodPercentage ?? 0)}>
                          {snapshot.sideBBroodPercentage ?? 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>لقاح:</span>
                        <span className={getPercentageColor(snapshot.sideBPollenPercentage ?? 0)}>
                          {snapshot.sideBPollenPercentage ?? 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {selectedSnapshot?.id === snapshot.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Side A Details */}
                      <div>
                        <h4 className="text-sm font-semibold mb-3">الوجه أ - تفاصيل</h4>
                        {snapshot.sideABroodAge && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-2">عمر الحضنة:</p>
                            <BroodAgeIndicator age={snapshot.sideABroodAge as any} size="sm" />
                          </div>
                        )}
                        {snapshot.sideABroodType && (
                          <p className="text-xs text-gray-600">
                            نوع الحضنة: <span className="font-medium">{snapshot.sideABroodType}</span>
                          </p>
                        )}
                      </div>

                      {/* Side B Details */}
                      <div>
                        <h4 className="text-sm font-semibold mb-3">الوجه ب - تفاصيل</h4>
                        {snapshot.sideBBroodAge && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-2">عمر الحضنة:</p>
                            <BroodAgeIndicator age={snapshot.sideBBroodAge as any} size="sm" />
                          </div>
                        )}
                        {snapshot.sideBBroodType && (
                          <p className="text-xs text-gray-600">
                            نوع الحضنة: <span className="font-medium">{snapshot.sideBBroodType}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {snapshot.notes && (
                      <div className="mt-4 bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600 mb-1">ملاحظات:</p>
                        <p className="text-sm text-gray-800">{snapshot.notes}</p>
                      </div>
                    )}

                    {/* Inspection link */}
                    {snapshot.inspection && (
                      <div className="mt-3">
                        <a 
                          href={`/inspections/${snapshot.inspectionId}`}
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          عرض الفحص الكامل
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes preview */}
                {!selectedSnapshot && snapshot.notes && (
                  <div className="mt-2 text-xs text-gray-600 italic truncate">
                    {snapshot.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load more */}
      {snapshots.length >= limit && (
        <div className="text-center">
          <button
            onClick={() => loadHistory()}
            className="text-sm text-yellow-600 hover:text-yellow-700 underline"
          >
            تحميل المزيد
          </button>
        </div>
      )}
    </div>
  );
};

export default FrameHistoryView;
