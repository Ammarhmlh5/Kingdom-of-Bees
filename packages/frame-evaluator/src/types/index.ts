/**
 * Core types for the Frame Evaluator library
 */

/**
 * Brood age stages
 */
export type BroodAge = 'EGGS' | 'YOUNG_LARVAE' | 'OLD_LARVAE' | 'CAPPED' | 'MIXED';

/**
 * Layer types in the frame
 */
export type LayerType = 'honey' | 'brood' | 'beebread' | 'empty';

/**
 * Frame data model
 */
export interface FrameData {
  // Identifiers
  id?: string;
  frameId?: string;
  side: 'A' | 'B';

  // Percentages
  honeyPercentage: number; // 0-100
  broodPercentage: number; // 0-100
  beeBreadPercentage: number; // 0-100
  emptyPercentage: number; // Calculated: 100 - (honey + brood + beebread)

  // Brood details
  broodAge?: BroodAge;
  broodPattern?: 'cellular' | 'scattered';

  // Honey details
  honeyCapped?: boolean;
  honeyPattern?: 'hexagonal' | 'capped' | 'uncapped';

  // Bee bread details
  pollenColors?: string[];
  beeBreadPattern?: 'granular' | 'packed';

  // Metadata
  evaluatedBy?: string;
  evaluatedAt?: Date;
  notes?: string;

  // Validation state
  isValid: boolean;
  validationErrors?: ValidationError[];
  validationWarnings?: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  type: 'TOTAL_EXCEEDED' | 'INVALID_RANGE' | 'MISSING_BROOD_AGE';
  message: string;
  field?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  type: 'LOW_RESOURCES' | 'UNUSUAL_DISTRIBUTION';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Validation state
 */
export interface ValidationState {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: Suggestion[];
}

/**
 * Suggestion for fixing validation errors
 */
export interface Suggestion {
  description: string;
  changes: Partial<FrameData>;
}

/**
 * Validation rules
 */
export interface ValidationRules {
  maxTotal: number; // 100
  minValue: number; // 0
  maxValue: number; // 100
  broodAgeRequired: boolean;
  lowResourcesThreshold: number; // 20
  customValidators?: Array<(data: FrameData) => ValidationError | null>;
  customWarnings?: Array<(data: FrameData) => ValidationWarning | null>;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: 'light' | 'dark';
  colors: ColorScheme;
  spacing: SpacingConfig;
  typography: TypographyConfig;
  animations: AnimationConfig;
}

/**
 * Color scheme
 */
export interface ColorScheme {
  honey: {
    light: string;
    medium: string;
    dark: string;
    stroke: string;
  };
  brood: {
    eggs: string;
    youngLarvae: string;
    oldLarvae: string;
    capped: string;
    mixed: string[];
    stroke: string;
  };
  beeBread: {
    light: string;
    medium: string;
    dark: string;
    variations: string[];
  };
  empty: string;
  background: string;
  border: string;
  text: string;
  error: string;
  warning: string;
  success: string;
}

/**
 * Spacing configuration
 */
export interface SpacingConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

/**
 * Typography configuration
 */
export interface TypographyConfig {
  fontFamily: string;
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontWeight: {
    normal: number;
    medium: number;
    bold: number;
  };
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

/**
 * Main component props
 */
export interface FrameEvaluatorProps {
  // Basic data
  frameId?: string;
  side: 'A' | 'B';
  initialData?: FrameData;

  // Event handlers
  onChange?: (data: FrameData) => void;
  onSave?: (data: FrameData) => Promise<void>;
  onCancel?: () => void;
  onValidationError?: (errors: ValidationError[]) => void;

  // Customization
  theme?: ThemeConfig;
  language?: 'ar' | 'en';
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;

  // Optional features
  showHistory?: boolean;
  showComparison?: boolean;
  showRenderer?: boolean;
  showValidation?: boolean;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;

  // Advanced customization
  customColors?: ColorScheme;
  customValidation?: ValidationRules;
  validationEngine?: any;
  renderCustomHeader?: (data: FrameData, validationState: ValidationState) => React.ReactNode;
  renderCustomFooter?: (data: FrameData, validationState: ValidationState) => React.ReactNode;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  
  // Auto save
  autoSave?: boolean;
}
