# Tamagui Migration Guide

## Overview

This guide provides a comprehensive roadmap for migrating your ExpenseTracker app from Native Base to Tamagui UI. Tamagui offers better performance, smaller bundle sizes, and more modern styling capabilities.

## Current State Analysis

### Dependencies to Replace
- **Native Base**: Currently using v3.4.28
- **React Native SVG**: Already compatible (v15.11.2)
- **Expo Linear Gradient**: Already compatible (v14.1.4)

### Components Currently Using Native Base
Based on project analysis, the following files need migration:

#### Core App Files
- `App.tsx` - Main app wrapper with NativeBaseProvider
- `colorModeManager.ts` - Color mode management

#### Screens (11 files)
- `LoginScreen.tsx` - Authentication UI
- `RegisterScreen.tsx` - User registration
- `DashboardScreen.tsx` - Main dashboard
- `ExpensesListScreen.tsx` - Expense listing
- `AddEditExpenseScreen.tsx` - Expense form
- `CategoriesScreen.tsx` - Category management
- `SettingsScreen.tsx` - App settings
- `ExpenseDetailScreen.tsx` - Expense details
- `ReportsScreen.tsx` - Reports view
- `AboutScreen.tsx` - About page
- `AdminScreen.tsx` - Admin panel

#### Components (7 files)
- `UserInfo.tsx` - User profile display
- `RecentTransactions.tsx` - Transaction list
- `SmartInsights.tsx` - Analytics component
- `OCRProcessing.tsx` - OCR functionality
- `QuickActions.tsx` - Action buttons
- `ExpenseBreakdown.tsx` - Expense charts
- `ExpenseSummary.tsx` - Summary cards

## Migration Strategy

### Phase 1: Setup and Configuration (Day 1)

#### 1.1 Install Tamagui Dependencies

```bash
cd frontend
npm install @tamagui/core @tamagui/config @tamagui/animations-react-native @tamagui/font-inter @tamagui/theme-base @tamagui/shorthands
npm install @tamagui/lucide-icons  # For icons
npm install react-native-reanimated react-native-gesture-handler  # Required for animations
```

#### 1.2 Install Development Dependencies

```bash
npm install --save-dev @tamagui/babel-plugin @tamagui/webpack-plugin
```

#### 1.3 Configure Babel

Update `babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['@tamagui/core'],
          config: './tamagui.config.ts',
        },
      ],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
```

#### 1.4 Create Tamagui Configuration

Create `frontend/tamagui.config.ts`:

```typescript
import { config } from '@tamagui/config/v3'
import { createTamagui } from '@tamagui/core'

const tamaguiConfig = createTamagui(config)

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}
```

#### 1.5 Update App.tsx Provider

Replace NativeBaseProvider with TamaguiProvider:

```typescript
import { TamaguiProvider } from '@tamagui/core'
import tamaguiConfig from './tamagui.config'

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TamaguiProvider>
  );
}
```

### Phase 2: Component Mapping and Migration (Days 2-4)

#### 2.1 Native Base to Tamagui Component Mapping

| Native Base | Tamagui Equivalent | Notes |
|-------------|-------------------|-------|
| `Box` | `View` or `Stack` | Use `View` for basic containers, `Stack` for spacing |
| `VStack` | `YStack` | Vertical stack with spacing |
| `HStack` | `XStack` | Horizontal stack with spacing |
| `Text` | `Text` or `Paragraph` | Use `Paragraph` for body text |
| `Heading` | `H1`, `H2`, `H3`, etc. | Semantic heading components |
| `Button` | `Button` | Similar API with enhanced styling |
| `Input` | `Input` | Form input component |
| `Icon` | `Lucide` icons | Use @tamagui/lucide-icons |
| `Avatar` | Custom component | Build using `Circle` + `Text` |
| `Spinner` | `Spinner` | Loading indicator |
| `useColorModeValue` | `useTheme` | Access theme values |
| `useToast` | Custom hook | Build toast system |

#### 2.2 Color Mode Migration

Replace `colorModeManager.ts` with Tamagui theme system:

```typescript
// frontend/theme.ts
import { createTheme } from '@tamagui/core'

export const lightTheme = createTheme({
  background: '#ffffff',
  backgroundHover: '#f5f5f5',
  backgroundPress: '#eeeeee',
  color: '#000000',
  colorHover: '#333333',
  // ... more colors
})

export const darkTheme = createTheme({
  background: '#000000',
  backgroundHover: '#111111',
  backgroundPress: '#222222',
  color: '#ffffff',
  colorHover: '#cccccc',
  // ... more colors
})
```

#### 2.3 Custom Components to Create

##### Avatar Component
```typescript
// components/ui/Avatar.tsx
import { Circle, Text } from '@tamagui/core'

interface AvatarProps {
  size?: number
  children: string
  backgroundColor?: string
}

export const Avatar = ({ size = 40, children, backgroundColor = '$blue10' }: AvatarProps) => (
  <Circle size={size} backgroundColor={backgroundColor}>
    <Text color="white" fontWeight="bold">
      {children}
    </Text>
  </Circle>
)
```

##### Toast System
```typescript
// hooks/useToast.ts
import { useState } from 'react'

export const useToast = () => {
  const [toasts, setToasts] = useState([])
  
  const show = ({ title, description, duration = 3000 }) => {
    // Implementation for toast system
  }
  
  return { show }
}
```

### Phase 3: Screen-by-Screen Migration (Days 5-8)

#### 3.1 Priority Order for Migration

1. **LoginScreen.tsx** - Critical for app access
2. **App.tsx** - Core app structure
3. **DashboardScreen.tsx** - Main user interface
4. **UserInfo.tsx** - Frequently used component
5. **AddEditExpenseScreen.tsx** - Core functionality
6. **ExpensesListScreen.tsx** - Core functionality
7. **SettingsScreen.tsx** - User preferences
8. **RegisterScreen.tsx** - User onboarding
9. **CategoriesScreen.tsx** - Data management
10. **RecentTransactions.tsx** - Dashboard component
11. **ExpenseSummary.tsx** - Dashboard component
12. **SmartInsights.tsx** - Analytics
13. **QuickActions.tsx** - Action buttons
14. **OCRProcessing.tsx** - Advanced feature
15. **ExpenseBreakdown.tsx** - Charts
16. **ExpenseDetailScreen.tsx** - Detail view
17. **ReportsScreen.tsx** - Reports
18. **AboutScreen.tsx** - Static content
19. **AdminScreen.tsx** - Admin features

#### 3.2 Migration Template for Each Component

For each component, follow this pattern:

```typescript
// Before (Native Base)
import { Box, Text, VStack, HStack, Button } from 'native-base'

// After (Tamagui)
import { View, Text, YStack, XStack, Button } from '@tamagui/core'

// Replace useColorModeValue with useTheme
const theme = useTheme()
const backgroundColor = theme.background.val
```

#### 3.3 Styling Migration

Replace Native Base props with Tamagui equivalents:

```typescript
// Before
<Box bg="blue.500" p={4} borderRadius="lg" shadow={2}>

// After
<View backgroundColor="$blue10" padding="$4" borderRadius="$4" shadowColor="$shadowColor" shadowRadius="$2">
```

### Phase 4: Advanced Features and Optimization (Days 9-10)

#### 4.1 Animation Migration

Replace Native Base animations with Tamagui animations:

```typescript
import { AnimatePresence } from '@tamagui/animations-react-native'

<AnimatePresence>
  <View
    animation="bouncy"
    enterStyle={{ opacity: 0, scale: 0.9 }}
    exitStyle={{ opacity: 0, scale: 0.9 }}
  >
    {/* Content */}
  </View>
</AnimatePresence>
```

#### 4.2 Form Handling

Update form components to use Tamagui inputs:

```typescript
import { Input, Label, Form } from '@tamagui/core'

<Form>
  <Label htmlFor="username">Username</Label>
  <Input
    id="username"
    placeholder="Enter username"
    value={username}
    onChangeText={setUsername}
  />
</Form>
```

#### 4.3 Performance Optimization

- Enable tree shaking in webpack config
- Use Tamagui's built-in optimization features
- Implement lazy loading for heavy components

## Testing Strategy

### 4.1 Component Testing Checklist

For each migrated component, verify:

- [ ] Visual appearance matches original design
- [ ] All interactive elements work correctly
- [ ] Color mode switching functions properly
- [ ] Responsive behavior is maintained
- [ ] Performance is improved or maintained
- [ ] No console errors or warnings

### 4.2 Screen Testing Checklist

For each migrated screen, test:

- [ ] Navigation works correctly
- [ ] Form submissions function properly
- [ ] Data loading and display is correct
- [ ] Error handling works as expected
- [ ] Accessibility features are maintained

### 4.3 Integration Testing

- [ ] App launches without errors
- [ ] Authentication flow works end-to-end
- [ ] Data persistence functions correctly
- [ ] All navigation paths are functional
- [ ] Theme switching works globally

## Common Migration Patterns

### Pattern 1: Layout Components

```typescript
// Native Base
<VStack space={4} p={4}>
  <HStack justifyContent="space-between">
    <Text>Label</Text>
    <Text>Value</Text>
  </HStack>
</VStack>

// Tamagui
<YStack gap="$4" padding="$4">
  <XStack justifyContent="space-between">
    <Text>Label</Text>
    <Text>Value</Text>
  </XStack>
</YStack>
```

### Pattern 2: Conditional Styling

```typescript
// Native Base
const bgColor = useColorModeValue('white', 'gray.800')

// Tamagui
const theme = useTheme()
const bgColor = theme.background.val
```

### Pattern 3: Custom Components

```typescript
// Native Base
<Box bg="blue.500" borderRadius="full" p={2}>
  <Icon as={Ionicons} name="add" color="white" />
</Box>

// Tamagui
<Circle backgroundColor="$blue10" padding="$2">
  <Plus color="white" size="$1" />
</Circle>
```

## Troubleshooting Common Issues

### Issue 1: Metro Bundle Errors

**Problem**: Metro bundler fails to resolve Tamagui modules

**Solution**: 
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@tamagui/core': require.resolve('@tamagui/core'),
  '@tamagui/config': require.resolve('@tamagui/config'),
};

module.exports = config;
```

### Issue 2: TypeScript Errors

**Problem**: TypeScript cannot find Tamagui types

**Solution**: Ensure `tamagui.config.ts` is properly configured and imported

### Issue 3: Animation Performance

**Problem**: Animations are laggy or not working

**Solution**: Ensure react-native-reanimated is properly installed and configured

### Issue 4: Theme Not Applied

**Problem**: Theme colors not showing correctly

**Solution**: Verify TamaguiProvider wraps the entire app and config is correct

## Performance Benefits

After migration, expect:

- **Bundle Size**: 20-30% reduction in JavaScript bundle size
- **Runtime Performance**: Faster component rendering
- **Development Experience**: Better TypeScript support and autocomplete
- **Styling Performance**: Compile-time style optimization
- **Tree Shaking**: Better dead code elimination

## Migration Timeline

### Week 1: Foundation
- Days 1-2: Setup and configuration
- Days 3-4: Core component mapping
- Day 5: Testing setup

### Week 2: Implementation
- Days 6-8: Screen migration (priority order)
- Days 9-10: Component migration
- Days 11-12: Testing and bug fixes

### Week 3: Polish
- Days 13-14: Performance optimization
- Day 15: Final testing and documentation

## Post-Migration Cleanup

1. Remove Native Base dependencies:
   ```bash
   npm uninstall native-base react-native-svg react-native-safe-area-context
   ```

2. Clean up unused imports and files

3. Update documentation and README

4. Run full test suite

5. Performance audit and optimization

## Resources and References

- [Tamagui Documentation](https://tamagui.dev)
- [Tamagui GitHub Repository](https://github.com/tamagui/tamagui)
- [Migration Examples](https://tamagui.dev/docs/guides/migration)
- [Performance Guide](https://tamagui.dev/docs/intro/performance)
- [Component API Reference](https://tamagui.dev/docs/components/stacks)

## Support and Community

- [Tamagui Discord](https://discord.gg/tamagui)
- [GitHub Issues](https://github.com/tamagui/tamagui/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/tamagui)

---

**Note**: This migration guide is based on the current project structure analysis. Adjust timelines and priorities based on your specific requirements and team capacity. 