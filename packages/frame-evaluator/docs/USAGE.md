# Usage Guide

Comprehensive guide for using @kingdom-of-bees/frame-evaluator

## Table of Contents

- [Getting Started](#getting-started)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
- [Database Integration](#database-integration)
- [Customization](#customization)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

```bash
npm install @kingdom-of-bees/frame-evaluator
```

### Basic Setup

```tsx
import { FrameEvaluator } from '@kingdom-of-bees/frame-evaluator';

function App() {
  return (
    <FrameEvaluator
      onSave={async (data) => {
        console.log('Saved:', data);
      }}
    />
  );
}
```

---

## Basic Usage

### 1. Simple Evaluation

Start with a basic frame evaluation:

```tsx
import { FrameEvaluator } from '@kingdom-of-bees/frame-evaluator';

function SimpleEvaluation() {
  const handleSave = async (data) => {
    console.log('Frame data:', data);
    // Save to your backend
  };

  return (
    <FrameEvaluator
      onSave={handleSave}
      language="ar"
    />
  );
}
```

### 2. With Initial Data

Load existing evaluation data:

```tsx
import { FrameEvaluator, FrameData } from '@kingdom-of-bees/frame-evaluator';

function EditEvaluation() {
  const existingData: FrameData = {
    honeyPercentage: 30,
    broodPercentage: 40,
    beeBreadPercentage: 10,
    emptyPercentage: 20,
    broodAge: 'mixed'
  };

  return (
    <FrameEvaluator
      initialData={existingData}
      onSave={handleSave}
    />
  );
}
```

### 3. Handling Changes

React to data changes in real-time:

```tsx
function LiveEvaluation() {
  const [currentData, setCurrentData] = useState<FrameData | null>(null);

  return (
    <div>
      <FrameEvaluator
        onChange={(data) => {
          setCurrentData(data);
          console.log('Data changed:', data);
        }}
        onSave={handleSave}
      />
      
      {currentData && (
        <div>
          <p>Honey: {currentData.honeyPercentage}%</p>
          <p>Brood: {currentData.broodPercentage}%</p>
        </div>
      )}
    </div>
  );
}
```

---

## Advanced Features

### Auto-Save

Enable automatic saving:

```tsx
<FrameEvaluator
  autoSave={true}
  autoSaveInterval={5000} // Save every 5 seconds
  onSave={async (data) => {
    await saveToDatabase(data);
  }}
/>
```

### Validation Handling

Handle validation errors:

```tsx
function ValidatedEvaluation() {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  return (
    <div>
      <FrameEvaluator
        onValidationError={(validationErrors) => {
          setErrors(validationErrors);
        }}
        onSave={handleSave}
      />
      
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((error, i) => (
            <p key={i}>{error.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Custom Validation Rules

Define your own validation rules:

```tsx
import { ValidationEngine } from '@kingdom-of-bees/frame-evaluator';

const customRules = {
  maxTotal: 100,
  minValue: 0,
  maxValue: 100,
  requireBroodAge: true,
  warnLowResources: 15, // Warn if honey + bee bread < 15%
  warnUnusualDistribution: 40 // Warn if empty > 40%
};

const validationEngine = new ValidationEngine(customRules);

<FrameEvaluator
  validationEngine={validationEngine}
  onSave={handleSave}
/>
```

### Read-Only Mode

Display evaluation without editing:

```tsx
<FrameEvaluator
  initialData={data}
  readonly={true}
/>
```

---

## Database Integration

### Supabase Integration

```tsx
import { createClient } from '@supabase/supabase-js';
import { SupabaseDatabaseAdapter } from '@kingdom-of-bees/frame-evaluator';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const dbAdapter = new SupabaseDatabaseAdapter(supabase);

function DatabaseEvaluation() {
  return (
    <FrameEvaluator
      databaseAdapter={dbAdapter}
      frameId="frame-123"
      hiveId="hive-456"
      userId="user-789"
      autoSave={true}
      autoSaveInterval={5000}
    />
  );
}
```

### PostgreSQL Integration

```tsx
import { Pool } from 'pg';
import { PostgreSQLDatabaseAdapter } from '@kingdom-of-bees/frame-evaluator';

const pool = new Pool({
  host: 'localhost',
  database: 'beekeeping',
  user: 'postgres',
  password: 'password'
});

const dbAdapter = new PostgreSQLDatabaseAdapter(pool);

<FrameEvaluator
  databaseAdapter={dbAdapter}
  frameId="frame-123"
  hiveId="hive-456"
  userId="user-789"
/>
```

### SQLite Integration

```tsx
import Database from 'better-sqlite3';
import { SQLiteDatabaseAdapter } from '@kingdom-of-bees/frame-evaluator';

const db = new Database('beekeeping.db');
const dbAdapter = new SQLiteDatabaseAdapter(db);

<FrameEvaluator
  databaseAdapter={dbAdapter}
  frameId="frame-123"
/>
```

### Loading History

View previous evaluations:

```tsx
import { LazyHistoryViewer } from '@kingdom-of-bees/frame-evaluator';

function EvaluationHistory() {
  const [selectedData, setSelectedData] = useState<FrameData | null>(null);

  return (
    <div>
      <LazyHistoryViewer
        frameId="frame-123"
        databaseAdapter={dbAdapter}
        onSelect={(evaluation) => {
          setSelectedData(evaluation.data);
        }}
        limit={20}
      />
      
      {selectedData && (
        <FrameEvaluator
          initialData={selectedData}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
```

---

## Customization

### Theming

#### Light/Dark Mode

```tsx
import { ThemeProvider } from '@kingdom-of-bees/frame-evaluator';

function ThemedApp() {
  return (
    <ThemeProvider initialMode="dark">
      <FrameEvaluator onSave={handleSave} />
    </ThemeProvider>
  );
}
```

#### Dynamic Theme Toggle

```tsx
import { ThemeProvider, useTheme } from '@kingdom-of-bees/frame-evaluator';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme.mode === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <FrameEvaluator onSave={handleSave} />
    </ThemeProvider>
  );
}
```

#### Custom Colors

```tsx
import { ThemeProvider, useTheme } from '@kingdom-of-bees/frame-evaluator';

function CustomThemedApp() {
  const { customizeColors } = useTheme();
  
  useEffect(() => {
    customizeColors({
      honeyLight: '#FFD700',
      honeyDark: '#FFA500',
      broodMixed: '#4169E1'
    });
  }, []);

  return <FrameEvaluator onSave={handleSave} />;
}
```

### Internationalization

#### Language Selection

```tsx
import { I18nProvider } from '@kingdom-of-bees/frame-evaluator';

function MultilingualApp() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  return (
    <I18nProvider initialLanguage={language}>
      <select value={language} onChange={(e) => setLanguage(e.target.value as 'ar' | 'en')}>
        <option value="ar">العربية</option>
        <option value="en">English</option>
      </select>
      
      <FrameEvaluator onSave={handleSave} />
    </I18nProvider>
  );
}
```

#### Using Translations

```tsx
import { useI18n } from '@kingdom-of-bees/frame-evaluator';

function TranslatedComponent() {
  const { t, isRTL } = useI18n();
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <h1>{t.honey}</h1>
      <p>{t.brood}</p>
    </div>
  );
}
```

### Size Variants

```tsx
<FrameEvaluator
  size="small"  // or "medium" or "large"
  onSave={handleSave}
/>
```

### Custom Header/Footer

```tsx
<FrameEvaluator
  renderCustomHeader={() => (
    <div className="custom-header">
      <h2>Frame Evaluation</h2>
      <button>Help</button>
    </div>
  )}
  renderCustomFooter={() => (
    <div className="custom-footer">
      <p>Last saved: {lastSaveTime}</p>
    </div>
  )}
  onSave={handleSave}
/>
```

---

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```tsx
import { FrameEvaluatorErrorBoundary } from '@kingdom-of-bees/frame-evaluator';

function App() {
  return (
    <FrameEvaluatorErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Error:', error);
        logToService(error, errorInfo);
      }}
      fallback={(error) => (
        <div>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
        </div>
      )}
    >
      <FrameEvaluator onSave={handleSave} />
    </FrameEvaluatorErrorBoundary>
  );
}
```

### 2. Performance Optimization

Use lazy loading for heavy components:

```tsx
import { LazyHistoryViewer, LazyComparisonView } from '@kingdom-of-bees/frame-evaluator';

// These components are loaded only when needed
<LazyHistoryViewer frameId="frame-123" databaseAdapter={dbAdapter} />
<LazyComparisonView leftData={oldData} rightData={newData} />
```

### 3. Data Persistence

Implement proper save/load logic:

```tsx
function PersistentEvaluation() {
  const [data, setData] = useState<FrameData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data on mount
    loadData().then(setData).finally(() => setLoading(false));
  }, []);

  const handleSave = async (newData: FrameData) => {
    try {
      await saveData(newData);
      setData(newData);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <FrameEvaluator
      initialData={data || undefined}
      onSave={handleSave}
      autoSave={true}
    />
  );
}
```

---

## Common Patterns

### Pattern 1: Comparison Workflow

```tsx
function ComparisonWorkflow() {
  const [oldData, setOldData] = useState<FrameData | null>(null);
  const [newData, setNewData] = useState<FrameData | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div>
      {!showComparison ? (
        <FrameEvaluator
          initialData={oldData || undefined}
          onSave={(data) => {
            setNewData(data);
            setShowComparison(true);
          }}
        />
      ) : (
        <LazyComparisonView
          leftData={oldData!}
          rightData={newData!}
          leftLabel="Previous"
          rightLabel="Current"
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
```

### Pattern 2: Multi-Frame Evaluation

```tsx
function MultiFrameEvaluation() {
  const [currentFrameId, setCurrentFrameId] = useState('frame-1');
  const frames = ['frame-1', 'frame-2', 'frame-3'];

  return (
    <div>
      <select value={currentFrameId} onChange={(e) => setCurrentFrameId(e.target.value)}>
        {frames.map(id => (
          <option key={id} value={id}>{id}</option>
        ))}
      </select>
      
      <FrameEvaluator
        key={currentFrameId}
        frameId={currentFrameId}
        databaseAdapter={dbAdapter}
        autoSave={true}
      />
    </div>
  );
}
```

### Pattern 3: Undo/Redo

```tsx
function UndoRedoEvaluation() {
  const {
    data,
    updateHoney,
    undo,
    redo,
    canUndo,
    canRedo
  } = useFrameEvaluator({
    initialData: myData
  });

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
      
      <FrameEvaluator
        initialData={data}
        onChange={(newData) => {
          // Handle changes
        }}
      />
    </div>
  );
}
```

---

## Troubleshooting

### Issue: Validation Not Working

**Solution**: Ensure data is properly formatted:

```tsx
const data: FrameData = {
  honeyPercentage: 30,    // Must be number
  broodPercentage: 40,
  beeBreadPercentage: 10,
  emptyPercentage: 20,    // Optional but recommended
  broodAge: 'mixed'       // Required if broodPercentage > 0
};
```

### Issue: Auto-Save Not Triggering

**Solution**: Check that `onSave` is async and returns a Promise:

```tsx
<FrameEvaluator
  autoSave={true}
  autoSaveInterval={5000}
  onSave={async (data) => {
    await saveToDatabase(data);  // Must be async
  }}
/>
```

### Issue: Theme Not Applying

**Solution**: Wrap your app with ThemeProvider:

```tsx
<ThemeProvider initialMode="dark">
  <FrameEvaluator onSave={handleSave} />
</ThemeProvider>
```

### Issue: Database Connection Errors

**Solution**: Verify database adapter configuration:

```tsx
// Check connection
const adapter = new SupabaseDatabaseAdapter(supabase);

// Test connection
try {
  await adapter.getLatestEvaluation('test-frame');
} catch (error) {
  console.error('Database connection failed:', error);
}
```

---

## FAQ

**Q: Can I use this with React Native?**
A: Yes! The library is fully compatible with React Native.

**Q: How do I customize colors?**
A: Use the ThemeProvider and customizeColors function. See [Customization Guide](./CUSTOMIZATION.md).

**Q: Can I disable certain sliders?**
A: Yes, use the `readonly` prop or create custom components using the individual slider components.

**Q: How do I handle offline mode?**
A: Implement your own caching layer and sync when online. The library supports custom database adapters.

**Q: Is TypeScript required?**
A: No, but it's recommended for better type safety and IDE support.

---

## Next Steps

- Read the [API Documentation](./API.md) for detailed API reference
- Check the [Customization Guide](./CUSTOMIZATION.md) for advanced theming
- Explore the [Storybook](../storybook-static/index.html) for interactive examples
