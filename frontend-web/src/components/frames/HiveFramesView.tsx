import React, { useEffect, useState } from 'react';
import { Frame } from '../../services/frames';
import { frameService } from '../../services/frames';
import FrameCard from './FrameCard';
import FrameEditor from './FrameEditor';

interface HiveFramesViewProps {
  apiaryId?: string;
  hiveId: string;
  onFrameClick?: (frame: Frame) => void;
}

const HiveFramesView: React.FC<HiveFramesViewProps> = ({ apiaryId, hiveId, onFrameClick }) => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFrame, setEditingFrame] = useState<Frame | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadFrames();
  }, [hiveId]);

  const loadFrames = async () => {
    try {
      setLoading(true);
      const data = await frameService.getHiveFrames(apiaryId || '', hiveId);
      setFrames(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFrameClick = (frame: Frame) => {
    if (onFrameClick) {
      onFrameClick(frame);
    } else {
      setEditingFrame(frame);
      setShowEditor(true);
    }
  };

  const handleSaveFrame = async (data: any) => {
    try {
      if (editingFrame) {
        await frameService.updateFrame(apiaryId || '', editingFrame.hiveId || hiveId, editingFrame.id, data);
      }
      setShowEditor(false);
      setEditingFrame(null);
      await loadFrames();
    } catch (err: any) {
      alert('خطأ في حفظ الإطار: ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingFrame(null);
  };

  // Group frames by story
  const framesByStory = frames.reduce((acc, frame) => {
    const story = frame.story ?? 0;
    if (!acc[story]) {
      acc[story] = [];
    }
    acc[story].push(frame);
    return acc;
  }, {} as Record<number, Frame[]>);

  // Sort stories
  const stories = Object.keys(framesByStory)
    .map(Number)
    .sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">خطأ في تحميل الإطارات: {error}</p>
        <button
          onClick={loadFrames}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (frames.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 mb-4">لا توجد إطارات في هذه الخلية</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إطارات الخلية ({frames.length})</h2>
        <button
          onClick={loadFrames}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 تحديث
        </button>
      </div>

      {/* Frames by Story */}
      {stories.map(story => {
        const storyFrames = framesByStory[story].sort((a, b) => a.position - b.position);
        
        return (
          <div key={story} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">
              الطابق {story} ({storyFrames.length} إطار)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {storyFrames.map(frame => (
                <FrameCard
                  key={frame.id}
                  frame={frame}
                  onClick={() => handleFrameClick(frame)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">ملخص الإطارات</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{frames.length}</div>
            <div className="text-sm text-gray-600">إجمالي الإطارات</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {frames.filter(f => ((f.sideAHoneyPercentage ?? 0) + (f.sideBHoneyPercentage ?? 0)) / 2 > 30).length}
            </div>
            <div className="text-sm text-gray-600">إطارات عسل</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-amber-700">
              {frames.filter(f => ((f.sideABroodPercentage ?? 0) + (f.sideBBroodPercentage ?? 0)) / 2 > 30).length}
            </div>
            <div className="text-sm text-gray-600">إطارات حضنة</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {frames.filter(f => ((f.sideAPollenPercentage ?? 0) + (f.sideBPollenPercentage ?? 0)) / 2 > 20).length}
            </div>
            <div className="text-sm text-gray-600">إطارات لقاح</div>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && editingFrame && (
        <FrameEditor
          frame={editingFrame}
          onSave={handleSaveFrame}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default HiveFramesView;
