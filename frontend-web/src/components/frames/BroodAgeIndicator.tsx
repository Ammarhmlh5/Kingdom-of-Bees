import React from 'react';

interface BroodAgeIndicatorProps {
  age: 'EGGS' | 'YOUNG_LARVAE' | 'OLD_LARVAE' | 'CAPPED' | 'MIXED' | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const BroodAgeIndicator: React.FC<BroodAgeIndicatorProps> = ({ 
  age, 
  size = 'md',
  showLabel = true 
}) => {
  if (!age) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const getAgeDisplay = () => {
    switch (age) {
      case 'EGGS':
        return {
          label: 'بيض',
          color: 'bg-white',
          pattern: (
            <svg className="w-full h-full" viewBox="0 0 40 40">
              {/* Small white dots representing eggs */}
              <circle cx="10" cy="10" r="2" fill="#fff" stroke="#666" strokeWidth="0.5" />
              <circle cx="20" cy="10" r="2" fill="#fff" stroke="#666" strokeWidth="0.5" />
              <circle cx="30" cy="10" r="2" fill="#fff" stroke="#666" strokeWidth="0.5" />
              <circle cx="15" cy="20" r="2" fill="#fff" stroke="#666" strokeWidth="0.5" />
              <circle cx="25" cy="20" r="2" fill="#fff" stroke="#666" strokeWidth="0.5" />
              <circle cx="10" cy="30" r="2" fill="#fff" stroke="#666" strokeWidth="0.5" />
              <circle cx="20" cy="30" r="2" fill="#fff" stroke="#666" strokeWidth="0.5" />
              <circle cx="30" cy="30" r="2" fill="#fff" stroke="#666" strokeWidth="0.5" />
            </svg>
          )
        };
      
      case 'YOUNG_LARVAE':
        return {
          label: 'يرقات صغيرة',
          color: 'bg-yellow-50',
          pattern: (
            <svg className="w-full h-full" viewBox="0 0 40 40">
              {/* Curved lines representing young larvae */}
              <path d="M 5 10 Q 10 15, 15 10" stroke="#fbbf24" strokeWidth="2" fill="none" />
              <path d="M 20 10 Q 25 15, 30 10" stroke="#fbbf24" strokeWidth="2" fill="none" />
              <path d="M 5 20 Q 10 25, 15 20" stroke="#fbbf24" strokeWidth="2" fill="none" />
              <path d="M 20 20 Q 25 25, 30 20" stroke="#fbbf24" strokeWidth="2" fill="none" />
              <path d="M 5 30 Q 10 35, 15 30" stroke="#fbbf24" strokeWidth="2" fill="none" />
              <path d="M 20 30 Q 25 35, 30 30" stroke="#fbbf24" strokeWidth="2" fill="none" />
            </svg>
          )
        };
      
      case 'OLD_LARVAE':
        return {
          label: 'يرقات كبيرة',
          color: 'bg-yellow-100',
          pattern: (
            <svg className="w-full h-full" viewBox="0 0 40 40">
              {/* Thicker curved lines representing older larvae */}
              <path d="M 5 10 Q 10 15, 15 10" stroke="#f59e0b" strokeWidth="3" fill="none" />
              <path d="M 20 10 Q 25 15, 30 10" stroke="#f59e0b" strokeWidth="3" fill="none" />
              <path d="M 5 20 Q 10 25, 15 20" stroke="#f59e0b" strokeWidth="3" fill="none" />
              <path d="M 20 20 Q 25 25, 30 20" stroke="#f59e0b" strokeWidth="3" fill="none" />
              <path d="M 5 30 Q 10 35, 15 30" stroke="#f59e0b" strokeWidth="3" fill="none" />
              <path d="M 20 30 Q 25 35, 30 30" stroke="#f59e0b" strokeWidth="3" fill="none" />
            </svg>
          )
        };
      
      case 'CAPPED':
        return {
          label: 'حضنة مغلقة',
          color: 'bg-amber-200',
          pattern: (
            <svg className="w-full h-full" viewBox="0 0 40 40">
              {/* Hexagonal cells representing capped brood */}
              <polygon points="10,5 15,8 15,14 10,17 5,14 5,8" fill="#d97706" stroke="#92400e" strokeWidth="1" />
              <polygon points="25,5 30,8 30,14 25,17 20,14 20,8" fill="#d97706" stroke="#92400e" strokeWidth="1" />
              <polygon points="10,20 15,23 15,29 10,32 5,29 5,23" fill="#d97706" stroke="#92400e" strokeWidth="1" />
              <polygon points="25,20 30,23 30,29 25,32 20,29 20,23" fill="#d97706" stroke="#92400e" strokeWidth="1" />
            </svg>
          )
        };
      
      case 'MIXED':
        return {
          label: 'مختلط',
          color: 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-200',
          pattern: (
            <svg className="w-full h-full" viewBox="0 0 40 40">
              {/* Mix of eggs, larvae, and capped cells */}
              <circle cx="8" cy="8" r="2" fill="#fff" stroke="#666" strokeWidth="0.5" />
              <path d="M 15 8 Q 20 13, 25 8" stroke="#fbbf24" strokeWidth="2" fill="none" />
              <polygon points="35,5 38,7 38,11 35,13 32,11 32,7" fill="#d97706" stroke="#92400e" strokeWidth="0.8" />
              <path d="M 5 20 Q 10 25, 15 20" stroke="#f59e0b" strokeWidth="3" fill="none" />
              <circle cx="28" cy="22" r="2" fill="#fff" stroke="#666" strokeWidth="0.5" />
              <polygon points="10,30 13,32 13,36 10,38 7,36 7,32" fill="#d97706" stroke="#92400e" strokeWidth="0.8" />
              <path d="M 20 32 Q 25 37, 30 32" stroke="#fbbf24" strokeWidth="2" fill="none" />
            </svg>
          )
        };
      
      default:
        return null;
    }
  };

  const display = getAgeDisplay();
  if (!display) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        className={`${sizeClasses[size]} ${display.color} rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden shadow-sm`}
      >
        {display.pattern}
      </div>
      {showLabel && (
        <span className={`${labelSizes[size]} text-gray-700 font-medium text-center`}>
          {display.label}
        </span>
      )}
    </div>
  );
};

export default BroodAgeIndicator;
