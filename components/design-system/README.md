# ⚡ BoltFit Design System Components

Premium React Native components inspired by Phantom Wallet's sophisticated aesthetic, optimized for fitness app psychology.

## 🚀 Quick Start

```tsx
import {
  BoltCard,
  LightningButton,
  ProgressRing,
  SmartInput,
  BoltColors,
  BoltSpacing,
} from '@/components/design-system';
```

## 🧩 Core Components

### BoltCard

Primary content container with Phantom's signature depth and premium feel.

```tsx
<BoltCard
  variant="interactive"
  size="lg"
  elevation="lg"
  selected={isSelected}
  onPress={handlePress}
>
  <WorkoutContent />
</BoltCard>
```

**Props:**
- `variant`: `'default' | 'interactive' | 'selection' | 'glass'`
- `size`: `'sm' | 'md' | 'lg'`
- `elevation`: `'sm' | 'md' | 'lg' | 'xl'`
- `selected`: `boolean` - Shows purple glow border
- `onPress`: `() => void` - Makes card interactive

### LightningButton

Primary action buttons with energy, confidence, and celebration states.

```tsx
<LightningButton
  variant="primary"
  size="lg"
  fullWidth
  loading={isLoading}
  success={isSuccess}
  leftIcon={<Zap size={20} color="#FFFFFF" />}
  onPress={handleSubmit}
>
  Get Started
</LightningButton>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'ghost' | 'danger'`
- `size`: `'sm' | 'md' | 'lg'`
- `loading`: `boolean` - Shows spinning lightning icon
- `success`: `boolean` - Shows checkmark with celebration (auto-resets after 2s)
- `leftIcon`/`rightIcon`: `ReactNode`

### ProgressRing

Circular progress indicators that feel more premium than linear bars.

```tsx
<ProgressRing
  progress={75}
  size="lg"
  variant="gradient"
  showPercentage
  color="primary"
  animated
/>
```

**Props:**
- `progress`: `number` (0-100)
- `variant`: `'default' | 'gradient' | 'segmented'`
- `size`: `'sm' | 'md' | 'lg' | 'xl'`
- `color`: `'primary' | 'success' | 'warning'`
- `showPercentage`: `boolean`
- `animated`: `boolean` - Smooth progress animations

### SmartInput

Sophisticated input fields with floating labels and contextual behavior.

```tsx
<SmartInput
  label="Email Address"
  value={email}
  onChangeText={setEmail}
  leftIcon={<Mail size={18} color="#94A3B8" />}
  validation={(value) => {
    if (!value.includes('@')) return 'Please enter a valid email';
    return null;
  }}
  clearable
  helperText="We'll never share your email"
/>
```

**Props:**
- `label`: `string` - Floating label text
- `validation`: `(value: string) => string | null` - Real-time validation
- `leftIcon`/`rightIcon`: `ReactNode`
- `clearable`: `boolean` - Shows clear button when focused
- `secureTextEntry`: `boolean` - Auto-adds password visibility toggle

## 🎨 Design Tokens

### Colors

```tsx
import { BoltColors } from '@/components/design-system';

// Primary Purple Scale
BoltColors.primary[600] // #6B46C1 - Main brand color
BoltColors.primary[500] // #8B5CF6 - Lighter variant

// Backgrounds
BoltColors.background.primary   // #0F0F23 - Main app background
BoltColors.background.secondary // #1A1A2E - Card backgrounds

// Text
BoltColors.text.primary   // #E2E8F0 - Main content
BoltColors.text.secondary // #94A3B8 - Supporting text

// Semantic
BoltColors.semantic.success // #10B981
BoltColors.semantic.error   // #EF4444
```

### Spacing

```tsx
import { BoltSpacing } from '@/components/design-system';

BoltSpacing[1] // 4px  - xs
BoltSpacing[2] // 8px  - sm
BoltSpacing[4] // 16px - lg (default padding)
BoltSpacing[6] // 24px - 2xl (section spacing)
```

### Animation Presets

```tsx
import { BoltAnimations } from '@/components/design-system';

// Spring animations
BoltAnimations.easing.spring.gentle  // { damping: 15, stiffness: 300 }
BoltAnimations.easing.spring.bouncy  // { damping: 10, stiffness: 300 }

// Timing
BoltAnimations.timing.microFeedback // 150ms - Button press
BoltAnimations.timing.transition    // 300ms - Screen changes
BoltAnimations.timing.celebration   // 800ms - Achievements
```

## ✨ Animation Principles

### Phantom-Inspired Interactions

All components follow Phantom's premium interaction patterns:

- **Micro-feedback** (100-200ms): Immediate response to user input
- **Confident transitions** (300-400ms): Screen changes and card movements
- **Celebration moments** (600-1200ms): Achievements and completions
- **Natural physics**: Spring-based animations that feel organic

### Performance

- GPU-accelerated transforms only (`scale`, `translate`, `opacity`)
- Respects `prefers-reduced-motion` system setting
- 60fps target on all animations
- Proper cleanup of animation loops

## 🎯 Usage Examples

### Goal Selection (Like Phantom's Token List)

```tsx
const goals = [
  { id: 'fat-burn', title: 'Fat Burn', icon: Target },
  { id: 'strength', title: 'Strength', icon: Zap },
];

return (
  <View>
    {goals.map((goal) => (
      <BoltCard
        key={goal.id}
        variant="interactive"
        selected={selectedGoal === goal.id}
        onPress={() => setSelectedGoal(goal.id)}
      >
        <goal.icon size={24} color={selectedGoal === goal.id ? '#FFFFFF' : '#A78BFA'} />
        <Text>{goal.title}</Text>
      </BoltCard>
    ))}
  </View>
);
```

### Form with Validation

```tsx
<SmartInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  validation={(value) => {
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
    return null;
  }}
  helperText="Must be at least 8 characters with uppercase letter"
/>
```

### Progress Tracking

```tsx
<ProgressRing
  progress={workoutProgress}
  size="xl"
  variant="gradient"
  showPercentage
  color="success"
>
  <Text style={{ color: BoltColors.text.primary }}>
    {currentExercise}
  </Text>
</ProgressRing>
```

## 🚀 Demo Component

See `DesignSystemDemo.tsx` for a comprehensive showcase of all components and their interactions.

## 🎨 Best Practices

### Visual Hierarchy

1. Use `BoltCard` with different `elevation` props to create depth
2. Primary actions should use `LightningButton` variant="primary"
3. Progress indicators should use `ProgressRing` over linear bars
4. Form inputs should use `SmartInput` with proper validation

### Animation Guidelines

1. Keep micro-interactions under 200ms
2. Use spring animations for natural feel
3. Celebrate user achievements with success states
4. Respect system accessibility preferences

### Color Usage

1. Purple (`BoltColors.primary[600]`) for primary actions and progress
2. Success green for achievements and confirmations
3. Error red for validation and warnings
4. Maintain high contrast ratios for accessibility

### Accessibility

1. All components include proper ARIA labels
2. Touch targets are minimum 44px (iOS guidelines)
3. Focus states are clearly visible
4. Screen reader support built-in

---

**This design system ensures every pixel of BoltFit reflects the premium, sophisticated experience that users expect from a cutting-edge fitness platform. When in doubt, ask: "Does this feel as polished as Phantom Wallet?"** 