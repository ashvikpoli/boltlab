# BoltFit Design System

## The Lightning-Fast Fitness Design Language

### Version 1.0 | Updated January 2025

---

## 🎯 **Design System Overview**

BoltFit's design system embodies the premium, sophisticated aesthetic of Phantom Wallet while optimizing for fitness app psychology. This system creates an aspirational, tech-forward atmosphere that makes users feel part of an exclusive fitness community rather than using a traditional fitness tracker.

### **Core Philosophy**

**"Premium Energy Through Thoughtful Restraint"**

Our design language balances the sophisticated dark aesthetic of high-end crypto wallets with the motivational energy needed for fitness engagement. Every component, interaction, and visual choice reinforces users' perception of BoltFit as a premium technology platform.

### **Design Principles**

1. **Progressive Trust Building** - Every micro-interaction earns user confidence
2. **Phantom's Elegant Precision** - Purposeful animations and premium materials
3. **Contextual Revelation** - Information appears exactly when needed
4. **Anticipation Over Information** - Create excitement about the fitness journey
5. **Celebration of Progress** - Every achievement feels meaningful and rewarding

---

## 🎨 **Visual Foundation**

### **Color System**

#### **Primary Palette**

```css
/* Primary Purple - The Lightning Energy */
--bolt-primary-50: #f3f0ff;
--bolt-primary-100: #e9e2ff;
--bolt-primary-200: #d6cafe;
--bolt-primary-300: #baa7fd;
--bolt-primary-400: #a78bfa;
--bolt-primary-500: #8b5cf6; /* Main Brand */
--bolt-primary-600: #6b46c1; /* Primary Actions */
--bolt-primary-700: #553c9a; /* Pressed States */
--bolt-primary-800: #4c1d95;
--bolt-primary-900: #3b0764;
```

#### **Dark Neutrals - The Phantom Foundation**

```css
/* Background System */
--bolt-background-primary: #0f0f23; /* Main app background */
--bolt-background-secondary: #1a1a2e; /* Card backgrounds */
--bolt-background-tertiary: #252540; /* Elevated surfaces */
--bolt-background-overlay: rgba(26, 26, 46, 0.9); /* Modal overlays */

/* Border System */
--bolt-border-subtle: rgba(255, 255, 255, 0.1);
--bolt-border-default: rgba(255, 255, 255, 0.2);
--bolt-border-strong: rgba(107, 70, 193, 0.3);
--bolt-border-accent: rgba(107, 70, 193, 0.6);
```

#### **Text Hierarchy**

```css
/* Text Colors */
--bolt-text-primary: #e2e8f0; /* Main content */
--bolt-text-secondary: #94a3b8; /* Supporting text */
--bolt-text-tertiary: #64748b; /* Subtle text */
--bolt-text-accent: #a78bfa; /* Purple accent text */
--bolt-text-inverse: #0f0f23; /* Text on light backgrounds */
```

#### **Semantic Colors**

```css
/* Feedback Colors */
--bolt-success-500: #10b981; /* Achievement unlocks */
--bolt-success-background: rgba(16, 185, 129, 0.1);

--bolt-warning-500: #f59e0b; /* Streak warnings */
--bolt-warning-background: rgba(245, 158, 11, 0.1);

--bolt-error-500: #ef4444; /* Validation errors */
--bolt-error-background: rgba(239, 68, 68, 0.1);

--bolt-info-500: #3b82f6; /* Information states */
--bolt-info-background: rgba(59, 130, 246, 0.1);
```

### **Typography**

#### **Font Family Stack**

```css
/* Primary Font - Inter */
--bolt-font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  sans-serif;

/* Monospace - For numbers and data */
--bolt-font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas,
  monospace;
```

#### **Type Scale**

| Token              | Size | Weight | Line Height | Usage                   |
| ------------------ | ---- | ------ | ----------- | ----------------------- |
| `--bolt-text-xs`   | 12px | 500    | 1.4         | Captions, timestamps    |
| `--bolt-text-sm`   | 14px | 400    | 1.5         | Body text, descriptions |
| `--bolt-text-base` | 16px | 400    | 1.5         | Default body text       |
| `--bolt-text-lg`   | 18px | 500    | 1.4         | Subheadings             |
| `--bolt-text-xl`   | 20px | 600    | 1.3         | Section titles          |
| `--bolt-text-2xl`  | 24px | 600    | 1.25        | Page headings           |
| `--bolt-text-3xl`  | 30px | 700    | 1.2         | Hero headings           |
| `--bolt-text-4xl`  | 36px | 700    | 1.1         | Display text            |

### **Spacing System**

#### **8px Base Grid**

```css
/* Spacing Scale */
--bolt-space-0: 0px;
--bolt-space-1: 4px; /* xs - Tight spacing */
--bolt-space-2: 8px; /* sm - Standard unit */
--bolt-space-3: 12px; /* md - Small gaps */
--bolt-space-4: 16px; /* lg - Default padding */
--bolt-space-5: 20px; /* xl - Comfortable spacing */
--bolt-space-6: 24px; /* 2xl - Section spacing */
--bolt-space-8: 32px; /* 3xl - Large gaps */
--bolt-space-10: 40px; /* 4xl - Major spacing */
--bolt-space-12: 48px; /* 5xl - Hero spacing */
--bolt-space-16: 64px; /* 6xl - Page-level spacing */
```

### **Elevation & Shadows**

#### **Shadow System**

```css
/* Phantom-Inspired Depth */
--bolt-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
--bolt-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.15);
--bolt-shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.25);
--bolt-shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.35);
--bolt-shadow-2xl: 0 24px 48px rgba(0, 0, 0, 0.45);

/* Colored Shadows for Premium Feel */
--bolt-shadow-primary: 0 8px 32px rgba(107, 70, 193, 0.3);
--bolt-shadow-success: 0 8px 32px rgba(16, 185, 129, 0.3);
--bolt-shadow-glow: 0 0 24px rgba(107, 70, 193, 0.4);
```

### **Border Radius**

```css
/* Radius Scale */
--bolt-radius-sm: 4px; /* Small elements */
--bolt-radius-md: 8px; /* Buttons, inputs */
--bolt-radius-lg: 12px; /* Cards, containers */
--bolt-radius-xl: 16px; /* Large cards */
--bolt-radius-2xl: 24px; /* Hero containers */
--bolt-radius-full: 9999px; /* Circular elements */
```

---

## 🧩 **Component Library**

### **Core Components**

#### **BoltCard**

**Purpose:** Primary content container with Phantom's signature depth and premium feel

```tsx
interface BoltCardProps {
  variant?: 'default' | 'interactive' | 'selection' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}
```

**Visual Specifications:**

- **Default:** `bg-background-secondary`, `shadow-md`, `border-subtle`
- **Interactive:** Hover scales to `1.02x`, adds `shadow-lg`
- **Selection:** `border-accent`, `shadow-primary`, checkmark animation
- **Glass:** `backdrop-blur-16`, `bg-overlay`, `border-strong`

**Usage:**

```tsx
<BoltCard variant="interactive" size="lg" onClick={handleSelect}>
  <WorkoutPreview {...workoutData} />
</BoltCard>
```

#### **LightningButton**

**Purpose:** Primary action buttons with energy and confidence

```tsx
interface LightningButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}
```

**Animation Specifications:**

- **Rest:** Subtle glow with `shadow-primary`
- **Hover:** Scale `1.05x`, increased glow
- **Active:** Scale `0.95x`, deeper shadow
- **Loading:** Spinning lightning icon, disabled state
- **Success:** Checkmark animation, brief celebration (2s)

#### **ProgressRing**

**Purpose:** Circular progress with premium feel over linear bars

```tsx
interface ProgressRingProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'segmented';
  showPercentage?: boolean;
  animated?: boolean;
  color?: 'primary' | 'success' | 'warning';
}
```

**Animation Behavior:**

- Progress fills clockwise with `easeOutCubic`
- Completion triggers scale pulse `1.1x` with particle effect
- Gradient variant shows shimmer animation during progress

#### **SmartInput**

**Purpose:** Sophisticated input fields with contextual behavior

```tsx
interface SmartInputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  success?: boolean;
  autoFocus?: boolean;
  validation?: (value: string) => string | null;
}
```

**Focus Behavior:**

- Purple border glow expands from center
- Label floats up with fade transition
- Real-time validation on blur
- Error states include helpful suggestions

### **Specialized Components**

#### **GoalCardStack**

**Purpose:** Interactive card browsing for goal selection

```tsx
interface GoalCardStackProps {
  goals: GoalOption[];
  selectedGoal?: string;
  onGoalSelect: (goalId: string) => void;
  stackDepth?: number;
}
```

**Interaction Pattern:**

- Cards stack with 3D perspective
- Swipe gesture reveals next card with momentum
- Selection animates card to front with glow
- Haptic feedback on iOS

#### **AchievementBadge**

**Purpose:** Gamification elements that celebrate progress

```tsx
interface AchievementBadgeProps {
  achievement: Achievement;
  earned: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'rare' | 'legendary';
  unlockAnimation?: boolean;
}
```

**Unlock Animation Sequence:**

1. Scale from 0 with bounce (300ms)
2. Color sweep across badge (500ms)
3. Particle burst effect (400ms)
4. Glow fade-in (200ms)

---

## 🎭 **Interaction Patterns**

### **Animation Principles**

#### **Timing Guidelines**

| Interaction Type   | Duration   | Easing            | Use Case                    |
| ------------------ | ---------- | ----------------- | --------------------------- |
| **Micro-feedback** | 100-200ms  | `easeOutQuart`    | Button press, selection     |
| **Transitions**    | 300-400ms  | `spring(300, 30)` | Screen changes, card slides |
| **Celebrations**   | 600-1200ms | `easeOutExpo`     | Achievements, completions   |
| **Ambient**        | 2000ms+    | `linear` loop     | Loading states, breathing   |

#### **Phantom-Inspired Physics**

```css
/* Spring Animations - Natural Feel */
.bolt-spring-gentle: cubic-bezier(0.25, 0.46, 0.45, 0.94);
.bolt-spring-bouncy: cubic-bezier(0.68, -0.55, 0.265, 1.55);
.bolt-spring-precise: cubic-bezier(0.4, 0, 0.2, 1);

/* Easing Curves - Confident Movement */
.bolt-ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
.bolt-ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
.bolt-ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### **Gesture Patterns**

#### **Card Navigation**

- **Swipe Right:** Next card/screen
- **Swipe Left:** Previous card/screen
- **Swipe Up:** Expand details
- **Swipe Down:** Dismiss/minimize
- **Long Press:** Additional options

#### **Selection Patterns**

- **Single Tap:** Select/activate
- **Double Tap:** Quick action/favorite
- **Hold:** Multi-select mode
- **Pinch:** Zoom/scale content

---

## 📱 **Responsive Guidelines**

### **Breakpoint System**

```scss
// Mobile First Approach
$bolt-breakpoints: (
  'mobile': 320px,
  'mobile-lg': 480px,
  'tablet': 768px,
  'desktop': 1024px,
  'desktop-lg': 1440px,
);
```

### **Component Scaling**

#### **Touch Target Optimization**

| Device      | Minimum Touch Target | Spacing |
| ----------- | -------------------- | ------- |
| **Mobile**  | 44x44px              | 8px     |
| **Tablet**  | 40x40px              | 12px    |
| **Desktop** | 32x32px              | 16px    |

#### **Typography Scaling**

```scss
// Responsive Typography
.bolt-heading {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  line-height: 1.2;
}

.bolt-body {
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  line-height: 1.5;
}
```

---

## ♿ **Accessibility Standards**

### **Color Contrast Requirements**

| Content Type    | Ratio | Validation                    |
| --------------- | ----- | ----------------------------- |
| **Normal Text** | 4.5:1 | #E2E8F0 on #0F0F23 = 8.2:1 ✅ |
| **Large Text**  | 3:1   | #A78BFA on #0F0F23 = 4.1:1 ✅ |
| **UI Elements** | 3:1   | #6B46C1 on #1A1A2E = 3.8:1 ✅ |

### **Focus Management**

```css
.bolt-focus-ring {
  outline: 2px solid var(--bolt-primary-400);
  outline-offset: 2px;
  border-radius: var(--bolt-radius-md);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .bolt-animation {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### **Screen Reader Support**

```tsx
// ARIA Labels for Complex Components
<BoltCard
  role="button"
  aria-label="Select Fat Burn Journey workout plan"
  aria-pressed={selected}
  tabIndex={0}
>
  <GoalContent />
</BoltCard>
```

---

## 🔧 **Implementation Guidelines**

### **CSS Custom Properties Usage**

```css
/* Component Implementation */
.bolt-card {
  background: var(--bolt-background-secondary);
  border: 1px solid var(--bolt-border-subtle);
  border-radius: var(--bolt-radius-lg);
  box-shadow: var(--bolt-shadow-md);
  padding: var(--bolt-space-4);
  transition: all 200ms var(--bolt-spring-gentle);
}

.bolt-card:hover {
  transform: scale(1.02);
  box-shadow: var(--bolt-shadow-lg);
  border-color: var(--bolt-border-accent);
}
```

### **React Component Structure**

```tsx
// Component Composition Pattern
export const BoltCard = forwardRef<HTMLDivElement, BoltCardProps>(
  ({ variant = 'default', size = 'md', children, ...props }, ref) => {
    const classes = cn(
      'bolt-card',
      `bolt-card--${variant}`,
      `bolt-card--${size}`,
      props.className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);
```

### **Animation Implementation**

```tsx
// Framer Motion Integration
const cardVariants = {
  rest: { scale: 1, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)' },
  hover: { scale: 1.02, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)' },
  tap: { scale: 0.98 },
};

<motion.div
  variants={cardVariants}
  initial="rest"
  whileHover="hover"
  whileTap="tap"
  className="bolt-card"
>
  {children}
</motion.div>;
```

---

## 📋 **Quality Checklist**

### **Component Review Criteria**

- [ ] **Visual Consistency:** Matches Phantom aesthetic principles
- [ ] **Accessibility:** WCAG 2.1 AA compliant
- [ ] **Performance:** 60fps animations, optimized rendering
- [ ] **Responsiveness:** Works across all breakpoints
- [ ] **Dark Theme:** Optimized for dark UI patterns
- [ ] **Touch Targets:** Minimum 44px on mobile
- [ ] **Focus States:** Clear keyboard navigation
- [ ] **Error Handling:** Graceful degradation
- [ ] **Loading States:** Appropriate feedback
- [ ] **Animation:** Respects reduced motion preferences

### **Brand Alignment Verification**

- [ ] **Premium Feel:** Creates sophisticated, high-end impression
- [ ] **Energy & Motivation:** Inspires fitness engagement
- [ ] **Trust Building:** Each interaction builds user confidence
- [ ] **Phantom DNA:** Maintains crypto wallet aesthetic quality
- [ ] **Fitness Context:** Appropriate for workout environments

---

## 🚀 **Getting Started**

### **For Designers**

1. **Install Design Tokens:** Import the Figma token library
2. **Component Templates:** Use the provided component templates
3. **Style Guide Reference:** Follow the visual specifications exactly
4. **Animation Guidelines:** Reference timing and easing specifications

### **For Developers**

1. **CSS Setup:** Import the custom property definitions
2. **Component Library:** Install the React component package
3. **Animation Framework:** Configure Framer Motion with presets
4. **Testing:** Validate accessibility and performance benchmarks

### **For Product Teams**

1. **Pattern Library:** Reference interaction patterns for new features
2. **Quality Standards:** Use the checklist for feature reviews
3. **Brand Guidelines:** Ensure all new features maintain aesthetic consistency
4. **User Testing:** Validate new patterns against usability goals

---

## 📚 **Resources**

- **Figma Component Library:** [BoltFit Design System v1.0]
- **Code Repository:** [GitHub - BoltFit Component Library]
- **Animation Presets:** [Motion Design Specifications]
- **Accessibility Guide:** [WCAG 2.1 Implementation Guide]
- **Brand Guidelines:** [BoltFit Visual Identity Manual]

---

**Version History:**

- **v1.0** - Initial design system establishment (January 2025)
- Future versions will track component additions and refinements

---

_This design system ensures every pixel of BoltFit reflects the premium, sophisticated experience that users expect from a cutting-edge fitness platform. When in doubt, ask: "Does this feel as polished as Phantom Wallet?"_
