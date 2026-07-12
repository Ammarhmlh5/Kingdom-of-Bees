# Customization Guide

Complete guide for customizing @kingdom-of-bees/frame-evaluator

## Table of Contents

- [Theming](#theming)
- [Colors](#colors)
- [Validation Rules](#validation-rules)
- [Custom Database Adapters](#custom-database-adapters)
- [Custom Components](#custom-components)
- [Styling](#styling)
- [Internationalization](#internationalization)

---

## Theming

### Basic Theme Setup

```tsx
import { ThemeProvider } from '@kingdom-of-bees/frame-evaluator';

function App() {
  return (
    <ThemeProvider initialMode="dark">
      <FrameEvaluator onSave={handleSave} />
    </ThemeProvider>
  );
}
```

### Dynamic Theme Switching

```tsx
import { ThemeProvider, useTheme } from '@kingdom-of-bees/frame-evaluator';

function ThemeControls() {
  const { theme, toggleTheme, setThemeMode } = useTheme();
  
  return (
    <div>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
      
      <button onClick={() => setThemeMode('light')}>
        Light Mode
      </button>
      
      <button onClick={() => setThemeMode('dark')}>
        Dark Mode
      </button>
      
      <p>Current mode: {theme.mode}</p>
    </div>
  );
}
```

### Theme Configuration

```tsx
const customTheme = {
  mode: 'light' as const,
  colors: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    // ... more colors
  }
};

<ThemeProvider initialMode="light" customColors={customTheme.colors}>
  <FrameEvaluator onSave={handleSave} />
</ThemeProvider>
```

---

## Colors

### Default Color Palette

#### Light Mode

```typescript
const lightColors = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  
  // Honey colors
  honeyLight: '#FEF9C3',
  honeyDark: '#FDE047',
  
  // Brood colors
  broodEggs: '#DBEAFE',
  broodLarvae: '#BFDBFE',
  broodPupae: '#93C5FD',
  broodCapped: '#60A5FA',
  broodMixed: '#3B82F6',
  
  // Bee bread colors
  beeBreadLight: '#FFEDD5',
  beeBreadDark: '#FDBA74',
  
  // Frame colors
  emptyColor: '#E5E7EB',
  frameColor: '#D1D5DB',
  
  // UI colors
  border: '#D1D5DB',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
};
```

#### Dark Mode

```typescript
const darkColors = {
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
};
```

### Customizing Colors

#### Method 1: Using customizeColors

```tsx
import { useTheme } from '@kingdom-of-bees/frame-evaluator';

function CustomColors() {
  const { customizeColors } = useTheme();
  
  useEffect(() => {
    customizeColors({
      honeyLight: '#FFD700',
      honeyDark: '#FFA500',
      broodMixed: '#4169E1',
      beeBreadLight: '#FFE4B5',
      beeBreadDark: '#DEB887'
    });
  }, []);
  
  return <FrameEvaluator onSave={handleSave} />;
}
```

#### Method 2: Using ThemeProvider

```tsx
<ThemeProvider
  initialMode="light"
  customColors={{
    honeyLight: '#FFD700',
    honeyDark: '#FFA500',
    broodMixed: '#4169E1'
  }}
>
  <FrameEvaluator onSave={handleSave} />
</ThemeProvider>
```

### Color Schemes

#### Warm Color Scheme

```typescript
const warmColors = {
  honeyLight: '#FFF4E6',
  honeyDark: '#FFB84D',
  broodMixed: '#FF8C42',
  beeBreadLight: '#FFE5CC',
  beeBreadDark: '#FF9F66',
};
```

#### Cool Color Scheme

```typescript
const coolColors = {
  honeyLight: '#E6F7FF',
  honeyDark: '#69C0FF',
  broodMixed: '#597EF7',
  beeBreadLight: '#F0F5FF',
  beeBreadDark: '#ADC6FF',
};
```

#### Monochrome Scheme

```typescript
const monochromeColors = {
  honeyLight: '#F5F5F5',
  honeyDark: '#BFBFBF',
  broodMixed: '#8C8C8C',
  beeBreadLight: '#E8E8E8',
  beeBreadDark: '#A6A6A6',
};
```

---

## Validation Rules

### Default Rules

```typescript
const defaultRules = {
  maxTotal: 100,
  minValue: 0,
  maxValue: 100,
  requireBroodAge: true,
  warnLowResources: 20,
  warnUnusualDistribution: 30
};
```

### Custom Validation Engine

```tsx
import { ValidationEngine } from '@kingdom-of-bees/frame-evaluator';

const customRules = {
  maxTotal: 100,
  minValue: 5,           // Minimum 5% for any value
  maxValue: 80,          // Maximum 80% for any value
  requireBroodAge: true,
  warnLowResources: 15,  // Warn if honey + bee bread < 15%
  warnUnusualDistribution: 40  // Warn if empty > 40%
};

const validationEngine = new ValidationEngine(customRules);

<FrameEvaluator
  validationEngine={validationEngine}
  onSave={handleSave}
/>
```

### Custom Validation Logic

Extend ValidationEngine for complex rules:

```typescript
import { ValidationEngine, FrameData, ValidationState } from '@kingdom-of-bees/frame-evaluator';

class CustomValidationEngine extends ValidationEngine {
  validate(data: FrameData): ValidationState {
    const baseValidation = super.validate(data);
    
    // Add custom validation
    const customErrors = [];
    const customWarnings = [];
    
    // Example: Warn if honey is too low
    if (data.honeyPercentage < 10) {
      customWarnings.push({
        field: 'honeyPercentage',
        message: 'Honey stores are critically low',
        code: 'CRITICAL_LOW_HONEY'
      });
    }
    
    // Example: Error if brood without bee bread
    if (data.broodPercentage > 0 && data.beeBreadPercentage === 0) {
      customErrors.push({
        field: 'beeBreadPercentage',
        message: 'Brood requires bee bread (pollen)',
        code: 'BROOD_NEEDS_POLLEN'
      });
    }
    
    return {
      isValid: baseValidation.isValid && customErrors.length === 0,
      errors: [...baseValidation.errors, ...customErrors],
      warnings: [...baseValidation.warnings, ...customWarnings],
      suggestions: baseValidation.suggestions
    };
  }
}

const engine = new CustomValidationEngine(customRules);
<FrameEvaluator validationEngine={engine} onSave={handleSave} />
```

---

## Custom Database Adapters

### Creating a Custom Adapter

```typescript
import { DatabaseAdapter, FrameData, FrameEvaluationRecord } from '@kingdom-of-bees/frame-evaluator';

class MyCustomDatabaseAdapter implements DatabaseAdapter {
  private apiUrl: string;
  
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }
  
  async saveEvaluation(data: FrameData, metadata: any): Promise<string> {
    const response = await fetch(`${this.apiUrl}/evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, metadata })
    });
    
    const result = await response.json();
    return result.id;
  }
  
  async getEvaluation(id: string): Promise<FrameEvaluationRecord | null> {
    const response = await fetch(`${this.apiUrl}/evaluations/${id}`);
    if (!response.ok) return null;
    return await response.json();
  }
  
  async getLatestEvaluation(frameId: string): Promise<FrameEvaluationRecord | null> {
    const response = await fetch(`${this.apiUrl}/evaluations/latest/${frameId}`);
    if (!response.ok) return null;
    return await response.json();
  }
  
  async getEvaluationHistory(frameId: string, options?: any): Promise<any> {
    const params = new URLSearchParams({
      frameId,
      limit: options?.limit?.toString() || '10',
      offset: options?.offset?.toString() || '0'
    });
    
    const response = await fetch(`${this.apiUrl}/evaluations?${params}`);
    return await response.json();
  }
  
  async updateEvaluation(id: string, data: Partial<FrameData>): Promise<void> {
    await fetch(`${this.apiUrl}/evaluations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
  
  async deleteEvaluation(id: string): Promise<void> {
    await fetch(`${this.apiUrl}/evaluations/${id}`, {
      method: 'DELETE'
    });
  }
}

// Usage
const adapter = new MyCustomDatabaseAdapter('https://api.example.com');
<FrameEvaluator databaseAdapter={adapter} frameId="frame-123" />
```

### Firebase Adapter Example

```typescript
import { getFirestore, collection, doc, setDoc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';

class FirebaseDatabaseAdapter implements DatabaseAdapter {
  private db: any;
  
  constructor(firebaseApp: any) {
    this.db = getFirestore(firebaseApp);
  }
  
  async saveEvaluation(data: FrameData, metadata: any): Promise<string> {
    const docRef = doc(collection(this.db, 'evaluations'));
    await setDoc(docRef, {
      data,
      ...metadata,
      createdAt: new Date()
    });
    return docRef.id;
  }
  
  async getEvaluation(id: string): Promise<FrameEvaluationRecord | null> {
    const docRef = doc(this.db, 'evaluations', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as FrameEvaluationRecord : null;
  }
  
  // ... implement other methods
}
```

---

## Custom Components

### Custom Slider Component

```tsx
import { useDrag } from '@kingdom-of-bees/frame-evaluator';

function CustomSlider({ value, onChange, color }: any) {
  const { position, handlers } = useDrag({
    onDragUpdate: (pos) => {
      const percentage = Math.max(0, Math.min(100, pos.x));
      onChange(percentage);
    },
    direction: 'horizontal'
  });
  
  return (
    <div
      {...handlers}
      style={{
        width: '100%',
        height: '40px',
        background: `linear-gradient(to right, ${color} ${value}%, #E5E7EB ${value}%)`,
        borderRadius: '8px',
        cursor: 'pointer'
      }}
    >
      <div style={{ padding: '10px', color: '#FFF' }}>
        {value.toFixed(1)}%
      </div>
    </div>
  );
}
```

### Custom Renderer

```tsx
import { FrameData } from '@kingdom-of-bees/frame-evaluator';

function CustomFrameRenderer({ data }: { data: FrameData }) {
  return (
    <svg width="400" height="600" viewBox="0 0 400 600">
      {/* Honey layer */}
      <rect
        x="0"
        y="0"
        width="400"
        height={600 * (data.honeyPercentage / 100)}
        fill="#FDE047"
      />
      
      {/* Brood layer */}
      <rect
        x="0"
        y={600 * (data.honeyPercentage / 100)}
        width="400"
        height={600 * (data.broodPercentage / 100)}
        fill="#3B82F6"
      />
      
      {/* Add more layers... */}
    </svg>
  );
}
```

---

## Styling

### CSS Custom Properties

```css
:root {
  --frame-evaluator-honey-light: #FEF9C3;
  --frame-evaluator-honey-dark: #FDE047;
  --frame-evaluator-brood-mixed: #3B82F6;
  --frame-evaluator-beebread-light: #FFEDD5;
  --frame-evaluator-beebread-dark: #FDBA74;
}

.frame-evaluator {
  --honey-light: var(--frame-evaluator-honey-light);
  --honey-dark: var(--frame-evaluator-honey-dark);
}
```

### Styled Components

```tsx
import styled from 'styled-components';
import { FrameEvaluator } from '@kingdom-of-bees/frame-evaluator';

const StyledFrameEvaluator = styled(FrameEvaluator)`
  .honey-slider {
    background: linear-gradient(to right, #FFD700, #FFA500);
  }
  
  .brood-slider {
    background: linear-gradient(to right, #4169E1, #1E90FF);
  }
`;
```

### Tailwind CSS

```tsx
<div className="p-4 bg-white rounded-lg shadow-lg">
  <FrameEvaluator
    onSave={handleSave}
    renderCustomHeader={() => (
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Frame Evaluation</h2>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Help
        </button>
      </div>
    )}
  />
</div>
```

---

## Internationalization

### Adding Custom Translations

```typescript
import { translations } from '@kingdom-of-bees/frame-evaluator';

const customTranslations = {
  ...translations,
  fr: {
    honey: 'Miel',
    brood: 'Couvain',
    beeBread: 'Pain d\'abeille',
    empty: 'Vide',
    broodAge: {
      eggs: 'Œufs',
      larvae: 'Larves',
      pupae: 'Nymphes',
      capped: 'Operculé',
      mixed: 'Mixte'
    },
    // ... more translations
  }
};
```

### RTL Support

```tsx
import { useI18n } from '@kingdom-of-bees/frame-evaluator';

function RTLAwareComponent() {
  const { isRTL } = useI18n();
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{
      textAlign: isRTL ? 'right' : 'left'
    }}>
      <FrameEvaluator onSave={handleSave} />
    </div>
  );
}
```

---

## Advanced Customization

### Custom Animation

```tsx
import { AnimationEngine } from '@kingdom-of-bees/frame-evaluator';

const customAnimation = new AnimationEngine();

customAnimation.animate({
  from: 0,
  to: 100,
  duration: 1000,
  easing: 'easeInOutCubic',
  onUpdate: (value) => {
    console.log('Animation value:', value);
  }
});
```

### Custom Patterns

```tsx
import { HexagonalPatternGenerator } from '@kingdom-of-bees/frame-evaluator';

const patternGenerator = new HexagonalPatternGenerator();
const pattern = patternGenerator.generate({
  width: 400,
  height: 600,
  cellSize: 20,
  color: '#FDE047'
});
```

---

## Examples

### Complete Custom Theme

```tsx
import { ThemeProvider, FrameEvaluator } from '@kingdom-of-bees/frame-evaluator';

const myTheme = {
  background: '#1A1A2E',
  surface: '#16213E',
  text: '#EAEAEA',
  textSecondary: '#A0A0A0',
  honeyLight: '#FFD700',
  honeyDark: '#FFA500',
  broodMixed: '#4169E1',
  beeBreadLight: '#FFE4B5',
  beeBreadDark: '#DEB887',
  error: '#FF6B6B',
  warning: '#FFD93D',
  success: '#6BCF7F'
};

function App() {
  return (
    <ThemeProvider initialMode="dark" customColors={myTheme}>
      <FrameEvaluator onSave={handleSave} />
    </ThemeProvider>
  );
}
```

### Complete Custom Validation

```tsx
import { ValidationEngine, FrameEvaluator } from '@kingdom-of-bees/frame-evaluator';

class BeekeeperValidation extends ValidationEngine {
  validate(data) {
    const result = super.validate(data);
    
    // Spring season rules
    if (isSpring()) {
      if (data.broodPercentage < 30) {
        result.warnings.push({
          field: 'broodPercentage',
          message: 'Low brood in spring - check queen',
          code: 'SPRING_LOW_BROOD'
        });
      }
    }
    
    // Winter season rules
    if (isWinter()) {
      if (data.honeyPercentage < 40) {
        result.errors.push({
          field: 'honeyPercentage',
          message: 'Insufficient honey stores for winter',
          code: 'WINTER_LOW_HONEY'
        });
      }
    }
    
    return result;
  }
}

const engine = new BeekeeperValidation();
<FrameEvaluator validationEngine={engine} onSave={handleSave} />
```

---

## Best Practices

1. **Theme Consistency**: Use ThemeProvider at the root level
2. **Color Accessibility**: Ensure sufficient contrast ratios (WCAG AA)
3. **Validation Logic**: Keep validation rules simple and clear
4. **Database Adapters**: Handle errors gracefully
5. **Custom Components**: Follow React best practices
6. **Performance**: Use React.memo for custom components

---

## Resources

- [API Documentation](./API.md)
- [Usage Guide](./USAGE.md)
- [Storybook Examples](../storybook-static/index.html)
