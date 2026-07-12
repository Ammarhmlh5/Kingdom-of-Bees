# @kingdom-of-bees/frame-evaluator

<div dir="rtl">

مكتبة React/React Native تفاعلية لتقييم إطارات خلايا النحل بطريقة بصرية وسهلة الاستخدام.

</div>

[![npm version](https://img.shields.io/npm/v/@kingdom-of-bees/frame-evaluator.svg)](https://www.npmjs.com/package/@kingdom-of-bees/frame-evaluator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🐝 Features

- 🎯 **Interactive Sliders**: Drag-based interface for honey, brood, and bee bread percentages
- 🎨 **Visual Rendering**: Real-time SVG visualization of frame composition
- ✅ **Smart Validation**: Automatic validation with helpful suggestions
- 💾 **Database Integration**: Built-in support for Supabase, PostgreSQL, and SQLite
- 🌍 **i18n Support**: Arabic and English translations with RTL support
- 🎭 **Theming**: Light/dark mode with customizable colors
- 📱 **Cross-Platform**: Works on React Web and React Native
- ⚡ **Performance**: Optimized for 60 FPS animations
- 🧪 **Well-Tested**: Comprehensive test coverage

## 📦 Installation

```bash
npm install @kingdom-of-bees/frame-evaluator
```

or

```bash
yarn add @kingdom-of-bees/frame-evaluator
```

## 🚀 Quick Start

```tsx
import { FrameEvaluator } from '@kingdom-of-bees/frame-evaluator';

function App() {
  const handleSave = async (data) => {
    console.log('Frame data:', data);
  };

  return (
    <FrameEvaluator
      onSave={handleSave}
      language="ar"
    />
  );
}
```

## 📖 Basic Usage

### With Initial Data

```tsx
import { FrameEvaluator, FrameData } from '@kingdom-of-bees/frame-evaluator';

const initialData: FrameData = {
  honeyPercentage: 30,
  broodPercentage: 40,
  beeBreadPercentage: 10,
  emptyPercentage: 20,
  broodAge: 'mixed',
};

<FrameEvaluator
  initialData={initialData}
  onSave={handleSave}
/>
```

### With Database Integration

```tsx
import { FrameEvaluator, SupabaseDatabaseAdapter } from '@kingdom-of-bees/frame-evaluator';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const dbAdapter = new SupabaseDatabaseAdapter(supabase);

<FrameEvaluator
  databaseAdapter={dbAdapter}
  frameId="frame-123"
  hiveId="hive-456"
  userId="user-789"
  autoSave={true}
  autoSaveInterval={5000}
/>
```

### With Custom Theme

```tsx
import { FrameEvaluator, ThemeProvider } from '@kingdom-of-bees/frame-evaluator';

<ThemeProvider initialMode="dark">
  <FrameEvaluator onSave={handleSave} />
</ThemeProvider>
```

## 🎨 Components

The library includes several interactive components:

1. **HoneySlider** - Horizontal slider for honey percentage (top)
2. **BroodSlider** - Horizontal slider for brood percentage (bottom)
3. **BeeBreadSlider** - Vertical slider for bee bread percentage (sides)
4. **BroodAgeSelector** - Selector for brood age stages (eggs, larvae, pupae, capped, mixed)
5. **FrameRenderer** - Visual SVG representation of frame composition
6. **HistoryViewer** - View and load previous evaluations
7. **ComparisonView** - Compare two evaluations side-by-side

## 🔧 Advanced Features

### History Viewer

```tsx
import { LazyHistoryViewer } from '@kingdom-of-bees/frame-evaluator';

<LazyHistoryViewer
  frameId="frame-123"
  databaseAdapter={dbAdapter}
  onSelect={(evaluation) => console.log(evaluation)}
/>
```

### Comparison View

```tsx
import { LazyComparisonView } from '@kingdom-of-bees/frame-evaluator';

<LazyComparisonView
  leftData={oldData}
  rightData={newData}
  leftLabel="الأسبوع الماضي"
  rightLabel="هذا الأسبوع"
/>
```

### Custom Validation Rules

```tsx
import { FrameEvaluator, ValidationEngine } from '@kingdom-of-bees/frame-evaluator';

const customRules = {
  maxTotal: 100,
  minValue: 0,
  maxValue: 100,
  requireBroodAge: true,
  warnLowResources: 15,
};

const validationEngine = new ValidationEngine(customRules);

<FrameEvaluator
  validationEngine={validationEngine}
  onSave={handleSave}
/>
```

## 📚 Documentation

For detailed documentation, see:

- [API Documentation](./docs/API.md)
- [Usage Guide](./docs/USAGE.md)
- [Customization Guide](./docs/CUSTOMIZATION.md)
- [Visual Guide](../../.kiro/specs/interactive-frame-evaluator/visual-guide.md)

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Build library
npm run build

# Run Storybook
npm run storybook

# Check bundle size
npm run size
```

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- React Native (iOS/Android)

## 📝 License

MIT © Kingdom of Bees

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📧 Support

For issues and questions, please open an issue on GitHub.
