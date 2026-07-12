import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  
  // Honey colors
  honeyLight: string;
  honeyDark: string;
  
  // Brood colors
  broodEggs: string;
  broodLarvae: string;
  broodPupae: string;
  broodCapped: string;
  broodMixed: string;
  
  // Bee bread colors
  beeBreadLight: string;
  beeBreadDark: string;
  
  // Empty/frame colors
  emptyColor: string;
  frameColor: string;
  
  // UI colors
  border: string;
  error: string;
  warning: string;
  success: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    honeyLight: '#FEF9C3',
    honeyDark: '#FDE047',
    broodEggs: '#DBEAFE',
    broodLarvae: '#BFDBFE',
    broodPupae: '#93C5FD',
    broodCapped: '#60A5FA',
    broodMixed: '#3B82F6',
    beeBreadLight: '#FFEDD5',
    beeBreadDark: '#FDBA74',
    emptyColor: '#E5E7EB',
    frameColor: '#D1D5DB',
    border: '#D1D5DB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
  },
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    honeyLight: '#854D0E',
    honeyDark: '#CA8A04',
    broodEggs: '#1E3A8A',
    broodLarvae: '#1E40AF',
    broodPupae: '#2563EB',
    broodCapped: '#3B82F6',
    broodMixed: '#60A5FA',
    beeBreadLight: '#7C2D12',
    beeBreadDark: '#EA580C',
    emptyColor: '#374151',
    frameColor: '#4B5563',
    border: '#4B5563',
    error: '#DC2626',
    warning: '#D97706',
    success: '#059669',
  },
};

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  customizeColors: (colors: Partial<ThemeColors>) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
  customColors?: Partial<ThemeColors>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'light',
  customColors,
}) => {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [customizedColors, setCustomizedColors] = useState<Partial<ThemeColors> | undefined>(
    customColors
  );

  const baseTheme = mode === 'light' ? lightTheme : darkTheme;
  
  const theme: Theme = {
    mode,
    colors: {
      ...baseTheme.colors,
      ...customizedColors,
    },
  };

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const customizeColors = (colors: Partial<ThemeColors>) => {
    setCustomizedColors((prev) => ({
      ...prev,
      ...colors,
    }));
  };

  useEffect(() => {
    if (customColors) {
      setCustomizedColors(customColors);
    }
  }, [customColors]);

  const value: ThemeContextValue = {
    theme,
    toggleTheme,
    setThemeMode,
    customizeColors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { lightTheme, darkTheme };
