import React, { useState, useEffect } from 'react';
import { Frame, FrameData } from '../../services/frames';

interface FrameEditorProps {
  frame?: Frame;
  onSave: (data: Partial<FrameData>) => void;
  onCancel: () => void;
}

const FrameEditor: React.FC<FrameEditorProps> = ({ frame, onSave, onCancel }) => {
  // Side A State
  const [sideAHoney, setSideAHoney] = useState(frame?.sideAHoneyPercentage || 0);
  const [sideABrood, setSideABrood] = useState(frame?.sideABroodPercentage || 0);
  const [sideAPollen, setSideAPollen] = useState(frame?.sideAPollenPercentage || 0);
  const [sideABroodAge, setSideABroodAge] = useState(frame?.sideABroodAge || '');

  // Side B State
  const [sideBHoney, setSideBHoney] = useState(frame?.sideBHoneyPercentage || 0);
  const [sideBBrood, setSideBBrood] = useState(frame?.sideBBroodPercentage || 0);
  const [sideBPollen, setSideBPollen] = useState(frame?.sideBPollenPercentage || 0);
  const [sideBBroodAge, setSideBBroodAge] = useState(frame?.sideBBroodAge || '');

  // Validation errors
  const [errors, setErrors] = useState<{ sideA?: string; sideB?: string }>({});

  // Validate percentages
  const validateSide = (honey: number, brood: number, pollen: number, side: 'A' | 'B') => {
    const total = honey + brood + pollen;
    if (total > 100) {
      setErrors(prev => ({ ...prev, [`side${side}`]: `المجموع ${total}% يتجاوز 100%` }));
      return false;
    }
    setErrors(prev => ({ ...prev, [`side${side}`]: undefined }));
    return true;
  };

  // Validate on change
  useEffect(() => {
    validateSide(sideAHoney, sideABrood, sideAPollen, 'A');
  }, [sideAHoney, sideABrood, sideAPollen]);

  useEffect(() => {
    validateSide(sideBHoney, sideBBrood, sideBPollen, 'B');
  }, [sideBHoney, sideBBrood, sideBPollen]);

  const handleSave = () => {
    // Final validation
    const sideAValid = validateSide(sideAHoney, sideABrood, sideAPollen, 'A');
    const sideBValid = validateSide(sideBHoney, sideBBrood, sideBPollen, 'B');

    if (!sideAValid || !sideBValid) {
      return;
    }

    const data: Partial<FrameData> = {
      sideAHoneyPercentage: sideAHoney,
      sideABroodPercentage: sideABrood,
      sideAPollenPercentage: sideAPollen,
      sideABroodAge: sideABroodAge as any || undefined,
      sideBHoneyPercentage: sideBHoney,
      sideBBroodPercentage: sideBBrood,
      sideBPollenPercentage: sideBPollen,
      sideBBroodAge: sideBBroodAge as any || undefined,
    };

    onSave(data);
  };

  const renderSideEditor = (
    side: 'A' | 'B',
    honey: number,
    setHoney: (v: number) => void,
    brood: number,
    setBrood: (v: number) => void,
    pollen: number,
    setPollen: (v: number) => void,
    broodAge: string,
    setBroodAge: (v: string) => void
  ) => {
    const total = honey + brood + pollen;
    const error = errors[`side${side}`];

    return (
      <div className="space-y-4 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
        <h3 className="font-bold text-lg text-center">الوجه {side}</h3>

        {/* Honey Slider (Vertical concept - shown horizontally) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            🍯 عسل: {honey}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={honey}
            onChange={(e) => setHoney(parseInt(e.target.value))}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>قليل</span>
            <span>ممتلئ</span>
          </div>
        </div>

        {/* Brood Slider (Horizontal) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            🐝 حضنة: {brood}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={brood}
            onChange={(e) => setBrood(parseInt(e.target.value))}
            className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>قليل</span>
            <span>كثير</span>
          </div>
        </div>

        {/* Pollen Slider */}
        <div>
          <label className="block text-sm font-medium mb-2">
            🌼 لقاح: {pollen}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={pollen}
            onChange={(e) => setPollen(parseInt(e.target.value))}
            className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>قليل</span>
            <span>كثير</span>
          </div>
        </div>

        {/* Brood Age Selector (Vertical concept) */}
        {brood > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">
              عمر الحضنة
            </label>
            <select
              value={broodAge}
              onChange={(e) => setBroodAge(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر عمر الحضنة</option>
              <option value="EGGS">🥚 بيض (أعلى)</option>
              <option value="YOUNG_LARVAE">🐛 يرقات صغيرة</option>
              <option value="OLD_LARVAE">🐛 يرقات كبيرة</option>
              <option value="CAPPED">🔒 مغلقة (جاهزة للخروج)</option>
              <option value="MIXED">🔄 متنوعة</option>
            </select>
          </div>
        )}

        {/* Total and Error */}
        <div className="pt-2 border-t">
          <div className={`text-sm font-medium ${total > 100 ? 'text-red-600' : 'text-gray-700'}`}>
            المجموع: {total}%
          </div>
          {error && (
            <div className="text-red-600 text-sm mt-1">⚠️ {error}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {frame ? `تحرير إطار ${frame.position}` : 'إطار جديد'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Side A */}
            {renderSideEditor(
              'A',
              sideAHoney, setSideAHoney,
              sideABrood, setSideABrood,
              sideAPollen, setSideAPollen,
              sideABroodAge, setSideABroodAge
            )}

            {/* Side B */}
            {renderSideEditor(
              'B',
              sideBHoney, setSideBHoney,
              sideBBrood, setSideBBrood,
              sideBPollen, setSideBPollen,
              sideBBroodAge, setSideBBroodAge
            )}
          </div>

          {/* Visual Preview */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">معاينة:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">الوجه A:</div>
                <div>عسل: {sideAHoney}% | حضنة: {sideABrood}% | لقاح: {sideAPollen}%</div>
              </div>
              <div>
                <div className="font-medium">الوجه B:</div>
                <div>عسل: {sideBHoney}% | حضنة: {sideBBrood}% | لقاح: {sideBPollen}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={!!errors.sideA || !!errors.sideB}
            className={`
              px-6 py-2 rounded-lg transition
              ${errors.sideA || errors.sideB
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrameEditor;
