import React from 'react';
import { Frame } from '../../services/frames';

interface FrameCardProps {
  frame: Frame;
  onClick?: () => void;
}

const FrameCard: React.FC<FrameCardProps> = ({ frame, onClick }) => {
  // Calculate average percentages from both sides
  const avgHoney = Math.round((frame.sideAHoneyPercentage + frame.sideBHoneyPercentage) / 2);
  const avgBrood = Math.round((frame.sideABroodPercentage + frame.sideBBroodPercentage) / 2);
  const avgPollen = Math.round((frame.sideAPollenPercentage + frame.sideBPollenPercentage) / 2);

  // Get brood age display
  const getBroodAgeDisplay = () => {
    const ages = [frame.sideABroodAge, frame.sideBBroodAge].filter(Boolean);
    if (ages.length === 0) return null;
    if (ages.length === 1) return ages[0];
    return ages[0] === ages[1] ? ages[0] : 'MIXED';
  };

  const broodAge = getBroodAgeDisplay();

  // Get frame type icon
  const getFrameIcon = () => {
    switch (frame.frameType) {
      case 'FOUNDATION': return '🏗️';
      case 'DRAWN': return '📐';
      case 'EMPTY': return '⬜';
      default: return '🍯';
    }
  };

  // Get condition color
  const getConditionColor = () => {
    switch (frame.condition) {
      case 'EXCELLENT': return 'text-green-600';
      case 'GOOD': return 'text-blue-600';
      case 'FAIR': return 'text-yellow-600';
      case 'POOR': return 'text-orange-600';
      case 'DAMAGED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative border-2 rounded-lg p-4 transition-all
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''}
        ${frame.condition === 'DAMAGED' ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getFrameIcon()}</span>
          <div>
            <div className="font-bold text-lg">إطار {frame.position}</div>
            <div className="text-xs text-gray-500">طابق {frame.story}</div>
          </div>
        </div>
        <div className={`text-xs font-semibold ${getConditionColor()}`}>
          {frame.condition}
        </div>
      </div>

      {/* Visual Representation */}
      <div className="space-y-2 mb-3">
        {/* Honey Bar */}
        {avgHoney > 0 && (
          <div className="relative">
            <div className="text-xs text-gray-600 mb-1">عسل: {avgHoney}%</div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all"
                style={{ width: `${avgHoney}%` }}
              />
            </div>
          </div>
        )}

        {/* Brood Bar */}
        {avgBrood > 0 && (
          <div className="relative">
            <div className="text-xs text-gray-600 mb-1 flex justify-between">
              <span>حضنة: {avgBrood}%</span>
              {broodAge && (
                <span className="text-xs bg-brown-100 px-2 py-0.5 rounded">
                  {broodAge === 'EGGS' && '🥚 بيض'}
                  {broodAge === 'YOUNG_LARVAE' && '🐛 يرقات صغيرة'}
                  {broodAge === 'OLD_LARVAE' && '🐛 يرقات كبيرة'}
                  {broodAge === 'CAPPED' && '🔒 مغلقة'}
                  {broodAge === 'MIXED' && '🔄 متنوعة'}
                </span>
              )}
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-700 to-amber-900 transition-all"
                style={{ width: `${avgBrood}%` }}
              />
            </div>
          </div>
        )}

        {/* Pollen Bar */}
        {avgPollen > 0 && (
          <div className="relative">
            <div className="text-xs text-gray-600 mb-1">لقاح: {avgPollen}%</div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
                style={{ width: `${avgPollen}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
        <span>عمر: {frame.ageYears} سنة</span>
        <span>{frame.frameType}</span>
      </div>
    </div>
  );
};

export default FrameCard;
