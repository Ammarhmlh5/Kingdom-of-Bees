# API Documentation

Complete API reference for @kingdom-of-bees/frame-evaluator

## Table of Contents

- [Components](#components)
  - [FrameEvaluator](#frameevaluator)
  - [HoneySlider](#honeyslider)
  - [BroodSlider](#broodslider)
  - [BeeBreadSlider](#beebreadslider)
  - [BroodAgeSelector](#broodageselector)
  - [FrameRenderer](#framerenderer)
  - [HistoryViewer](#historyviewer)
  - [ComparisonView](#comparisonview)
- [Hooks](#hooks)
  - [useFrameEvaluator](#useframeevaluator)
  - [useDrag](#usedrag)
  - [useTheme](#usetheme)
  - [useI18n](#usei18n)
  - [useErrorHandler](#useerrorhandler)
- [Types](#types)
- [Database Adapters](#database-adapters)
- [Utilities](#utilities)

---

## Components

### FrameEvaluator

Main component for frame evaluation.

#### Props

```typescript
interface FrameEvaluatorProps {
  // Data
  initialData?: FrameData;
  
  // Database
  databaseAdapter?: DatabaseAdapter;
  frameId?: string;
  hiveId?: string;
  userId?: string;
  
  // Auto-save
  autoSave?: boolean;
  autoSaveInterval?: number; // milliseconds
  
  // Callbacks
  onChange?: (data: FrameData) => void;
  onSave?: (data: FrameData) => Promise<void>;
  onCancel?: () => void;
  onValidationError?: (errors: ValidationError[]) => void;
  
  // Customization
  theme?: ThemeConfig;
  language?: 'ar' | 'en';
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
  
  // Validation
  validationEngine?: ValidationEngine;
  
  // Custom rendering
  renderCustomHeader?: () => ReactNode;
  renderCustomFooter?: () => ReactNode;
}
```

#### Example

```tsx
<FrameEvaluator
  initialData={{
    honeyPercentage: 30,
    broodPercentage: 40,
    beeBreadPercentage: 10,
    emptyPercentage: 20,
    broodAge: 'mixed'
  }}
  onSave={async (data) => {
    await saveToDatabase(data);
  }}
  language="ar"
  autoSave={true}
  autoSaveInterval={5000}
/>
```

---

### HoneySlider

Horizontal slider for honey percentage.

#### Props

```typescript
interface HoneySliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showLabel?: boolean;
  color?: string;
}
```

#### Example

```tsx
<HoneySlider
  value={30}
  onChange={(value) => console.log(value)}
  showLabel={true}
/>
```

---

### BroodSlider

Horizontal slider for brood percentage.

#### Props

```typescript
interface BroodSliderProps {
  value: number;
  onChange: (value: number) => void;
  broodAge?: BroodAge;
  disabled?: boolean;
  showLabel?: boolean;
}
```

---

### BeeBreadSlider

Vertical slider for bee bread percentage.

#### Props

```typescript
interface BeeBreadSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showLabel?: boolean;
  color?: string;
}
```

---

### BroodAgeSelector

Selector for brood age stages.

#### Props

```typescript
interface BroodAgeSelectorProps {
  value: BroodAge;
  onChange: (age: BroodAge) => void;
  disabled?: boolean;
  visible?: boolean;
}

type BroodAge = 'eggs' | 'larvae' | 'pupae' | 'capped' | 'mixed';
```

#### Example

```tsx
<BroodAgeSelector
  value="mixed"
  onChange={(age) => console.log(age)}
/>
```

---

### FrameRenderer

Visual SVG renderer for frame composition.

#### Props

```typescript
interface FrameRendererProps {
  data: FrameData;
  width?: number;
  height?: number;
  animate?: boolean;
  showPatterns?: boolean;
}
```

#### Example

```tsx
<FrameRenderer
  data={frameData}
  width={400}
  height={600}
  animate={true}
  showPatterns={true}
/>
```

---

### HistoryViewer

Component for viewing evaluation history.

#### Props

```typescript
interface HistoryViewerProps {
  frameId: string;
  databaseAdapter: DatabaseAdapter;
  onSelect?: (evaluation: FrameEvaluationRecord) => void;
  onDelete?: (id: string) => void;
  limit?: number;
}
```

#### Example

```tsx
<LazyHistoryViewer
  frameId="frame-123"
  databaseAdapter={dbAdapter}
  onSelect={(evaluation) => loadEvaluation(evaluation)}
  limit={10}
/>
```

---

### ComparisonView

Component for comparing two evaluations.

#### Props

```typescript
interface ComparisonViewProps {
  leftData: FrameData;
  rightData: FrameData;
  leftLabel?: string;
  rightLabel?: string;
  showDifferences?: boolean;
  onClose?: () => void;
}
```

#### Example

```tsx
<LazyComparisonView
  leftData={oldData}
  rightData={newData}
  leftLabel="Previous Week"
  rightLabel="This Week"
  showDifferences={true}
/>
```

---

## Hooks

### useFrameEvaluator

Main hook for managing frame evaluation state.

#### Signature

```typescript
function useFrameEvaluator(
  options: UseFrameEvaluatorOptions
): UseFrameEvaluatorReturn;

interface UseFrameEvaluatorOptions {
  initialData?: FrameData;
  databaseAdapter?: DatabaseAdapter;
  frameId?: string;
  hiveId?: string;
  userId?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
  validationEngine?: ValidationEngine;
  onChange?: (data: FrameData) => void;
  onSave?: (data: FrameData) => Promise<void>;
}

interface UseFrameEvaluatorReturn {
  data: FrameData;
  updateHoney: (value: number) => void;
  updateBrood: (value: number) => void;
  updateBeeBread: (value: number) => void;
  updateBroodAge: (age: BroodAge) => void;
  validationState: ValidationState;
  isDirty: boolean;
  isSaving: boolean;
  save: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
```

#### Example

```tsx
const {
  data,
  updateHoney,
  validationState,
  save,
  undo,
  redo
} = useFrameEvaluator({
  initialData: myData,
  autoSave: true,
  autoSaveInterval: 5000
});
```

---

### useDrag

Hook for handling drag gestures.

#### Signature

```typescript
function useDrag(options: UseDragOptions): UseDragReturn;

interface UseDragOptions {
  onDragStart?: (position: Point) => void;
  onDragUpdate?: (position: Point, delta: Point) => void;
  onDragEnd?: (position: Point) => void;
  direction?: 'horizontal' | 'vertical' | 'both';
  snapPoints?: number[];
}
```

---

### useTheme

Hook for accessing theme context.

#### Signature

```typescript
function useTheme(): ThemeContextValue;

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  customizeColors: (colors: Partial<ThemeColors>) => void;
}
```

#### Example

```tsx
const { theme, toggleTheme, customizeColors } = useTheme();

// Toggle theme
toggleTheme();

// Customize colors
customizeColors({
  honeyLight: '#FFD700',
  honeyDark: '#FFA500'
});
```

---

### useI18n

Hook for internationalization.

#### Signature

```typescript
function useI18n(): I18nContextValue;

interface I18nContextValue {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  t: Translations;
  isRTL: boolean;
}
```

#### Example

```tsx
const { language, setLanguage, t, isRTL } = useI18n();

// Change language
setLanguage('en');

// Use translations
console.log(t.honey); // "Honey" or "العسل"
```

---

### useErrorHandler

Hook for error handling.

#### Signature

```typescript
function useErrorHandler(): UseErrorHandlerReturn;

interface UseErrorHandlerReturn {
  error: ErrorState | null;
  setError: (type: ErrorType, message: string, details?: string) => void;
  clearError: () => void;
  hasError: boolean;
}

type ErrorType = 'validation' | 'database' | 'network' | 'unknown';
```

---

## Types

### FrameData

```typescript
interface FrameData {
  honeyPercentage: number;
  broodPercentage: number;
  beeBreadPercentage: number;
  emptyPercentage?: number;
  broodAge?: BroodAge;
}

type BroodAge = 'eggs' | 'larvae' | 'pupae' | 'capped' | 'mixed';
```

### ValidationState

```typescript
interface ValidationState {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}
```

### ThemeConfig

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark';
  colors: Partial<ThemeColors>;
}

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  honeyLight: string;
  honeyDark: string;
  broodEggs: string;
  broodLarvae: string;
  broodPupae: string;
  broodCapped: string;
  broodMixed: string;
  beeBreadLight: string;
  beeBreadDark: string;
  emptyColor: string;
  frameColor: string;
  border: string;
  error: string;
  warning: string;
  success: string;
}
```

---

## Database Adapters

### DatabaseAdapter Interface

```typescript
interface DatabaseAdapter {
  saveEvaluation(data: FrameData, metadata: EvaluationMetadata): Promise<string>;
  getEvaluation(id: string): Promise<FrameEvaluationRecord | null>;
  getLatestEvaluation(frameId: string): Promise<FrameEvaluationRecord | null>;
  getEvaluationHistory(frameId: string, options?: QueryOptions): Promise<QueryResult>;
  updateEvaluation(id: string, data: Partial<FrameData>): Promise<void>;
  deleteEvaluation(id: string): Promise<void>;
}
```

### SupabaseDatabaseAdapter

```typescript
const adapter = new SupabaseDatabaseAdapter(supabaseClient);
```

### PostgreSQLDatabaseAdapter

```typescript
const adapter = new PostgreSQLDatabaseAdapter(pgClient);
```

### SQLiteDatabaseAdapter

```typescript
const adapter = new SQLiteDatabaseAdapter(sqliteDb);
```

---

## Utilities

### ValidationEngine

```typescript
class ValidationEngine {
  constructor(rules?: ValidationRules);
  validate(data: FrameData): ValidationState;
  generateSuggestions(data: FrameData): string[];
}

interface ValidationRules {
  maxTotal?: number;
  minValue?: number;
  maxValue?: number;
  requireBroodAge?: boolean;
  warnLowResources?: number;
  warnUnusualDistribution?: number;
}
```

#### Example

```typescript
const engine = new ValidationEngine({
  maxTotal: 100,
  requireBroodAge: true,
  warnLowResources: 15
});

const result = engine.validate(frameData);
if (!result.isValid) {
  console.log(result.errors);
}
```

### Helper Functions

```typescript
// Validate frame data
function validateFrameData(data: FrameData): ValidationState;

// Get default validation rules
function getDefaultValidationRules(): ValidationRules;
```

---

## Context Providers

### ThemeProvider

```tsx
<ThemeProvider initialMode="dark" customColors={{ honeyLight: '#FFD700' }}>
  <App />
</ThemeProvider>
```

### I18nProvider

```tsx
<I18nProvider initialLanguage="ar">
  <App />
</I18nProvider>
```

### FrameEvaluatorErrorBoundary

```tsx
<FrameEvaluatorErrorBoundary
  fallback={(error, errorInfo) => <CustomError error={error} />}
  onError={(error, errorInfo) => logError(error)}
>
  <App />
</FrameEvaluatorErrorBoundary>
```

---

## Constants

### DEFAULT_THEME

```typescript
const DEFAULT_THEME: ThemeConfig;
```

### DEFAULT_COLORS

```typescript
const DEFAULT_COLORS: ThemeColors;
```

---

## Advanced Usage

### Custom Validation Engine

```typescript
const customEngine = new ValidationEngine({
  maxTotal: 100,
  minValue: 0,
  maxValue: 100,
  requireBroodAge: true,
  warnLowResources: 20,
  warnUnusualDistribution: 30
});

<FrameEvaluator validationEngine={customEngine} />
```

### Custom Database Adapter

```typescript
class MyCustomAdapter implements DatabaseAdapter {
  async saveEvaluation(data, metadata) {
    // Custom implementation
  }
  // ... implement other methods
}

const adapter = new MyCustomAdapter();
<FrameEvaluator databaseAdapter={adapter} />
```

---

## TypeScript Support

All components and hooks are fully typed. Import types as needed:

```typescript
import type {
  FrameData,
  BroodAge,
  ValidationState,
  ThemeConfig,
  DatabaseAdapter
} from '@kingdom-of-bees/frame-evaluator';
```
