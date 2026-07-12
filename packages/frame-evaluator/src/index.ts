/**
 * @kingdom-of-bees/frame-evaluator
 * 
 * Interactive frame evaluator component for beekeeping
 * A reusable React/React Native library for evaluating beehive frames
 * 
 * @author Kingdom of Bees
 * @license MIT
 */

// Main component
export { FrameEvaluator, useFrameEvaluatorContext } from './components/FrameEvaluator';

// Slider components
export { HoneySlider } from './components/HoneySlider';
export { BroodSlider } from './components/BroodSlider';
export { BeeBreadSlider } from './components/BeeBreadSlider';
export { BroodAgeSelector } from './components/BroodAgeSelector';

// Renderer components
export { FrameRenderer } from './components/renderer/FrameRenderer';
export type { LayerType } from './components/renderer/FrameRenderer';

// History components (lazy loaded)
export { HistoryViewer } from './components/history/HistoryViewer';
export type { HistoryViewerProps } from './components/history/HistoryViewer';

// Lazy loaded components
export { LazyHistoryViewer, LazyComparisonView } from './lazy';

// Validation components
// export { ValidationDisplay } from './components/validation/ValidationDisplay';

// Hooks
// export { useFrameEvaluator } from './hooks/useFrameEvaluator';
export { useDrag } from './hooks/useDrag';
export { useFrameEvaluator } from './hooks/useFrameEvaluator';
export type { UseFrameEvaluatorOptions, UseFrameEvaluatorReturn } from './hooks/useFrameEvaluator';

// Types
export type {
  FrameData,
  FrameEvaluatorProps,
  BroodAge,
  ValidationError,
  ValidationWarning,
  ValidationState,
  ThemeConfig,
  ColorScheme,
} from './types';

// Utilities
export { ValidationEngine } from './utils/ValidationEngine';
export { validateFrameData, getDefaultValidationRules } from './utils/validation';

// Constants
export { DEFAULT_THEME, DEFAULT_COLORS } from './constants/theme';

// Rendering
export { HexagonalPatternGenerator } from './rendering/HexagonalPatternGenerator';
export type {
  Point,
  HexCell,
  Area,
  HexagonalGridOptions,
} from './rendering/HexagonalPatternGenerator';

export { CellularPatternGenerator } from './rendering/CellularPatternGenerator';
export type {
  BroodCell,
  CellType,
  CellularPatternOptions,
} from './rendering/CellularPatternGenerator';

export { GranularPatternGenerator } from './rendering/GranularPatternGenerator';
export type {
  Grain,
  GranularPatternOptions,
} from './rendering/GranularPatternGenerator';

export { SVGRenderer } from './rendering/SVGRenderer';
export type {
  LayerArea,
  LayerAreas,
  RendererConfig,
} from './rendering/SVGRenderer';

export { GradientGenerator } from './rendering/GradientGenerator';
export type {
  GradientDirection,
  GradientStop,
  GradientDefinition,
} from './rendering/GradientGenerator';

// Animation
export { AnimationEngine, Easing } from './animation/AnimationEngine';
export type {
  EasingFunction,
  EasingType,
  AnimationOptions,
  AnimatableValue,
} from './animation/AnimationEngine';

// Database
export { DatabaseHelpers } from './database/DatabaseAdapter';
export type {
  DatabaseAdapter,
  FrameEvaluationRecord,
  QueryOptions,
  QueryResult,
} from './database/DatabaseAdapter';

export { SQLiteDatabaseAdapter } from './database/SQLiteDatabaseAdapter';
export type {
  SQLiteDatabase,
  SQLiteStatement,
} from './database/SQLiteDatabaseAdapter';

export { PostgreSQLDatabaseAdapter } from './database/PostgreSQLDatabaseAdapter';
export type {
  PostgreSQLClient,
  PostgreSQLResult,
} from './database/PostgreSQLDatabaseAdapter';

export { SupabaseDatabaseAdapter } from './database/SupabaseDatabaseAdapter';
export type {
  SupabaseClient,
  SupabaseQueryBuilder,
  SupabaseResponse,
} from './database/SupabaseDatabaseAdapter';
