# Styling Guide

## Overview

This application uses **Tailwind CSS 4** for styling, providing a utility-first approach to building custom designs. This guide covers styling patterns, best practices, and Tailwind CSS usage.

## Tailwind CSS

### What is Tailwind CSS?

Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs without writing custom CSS.

### Benefits

- **Fast Development**: No need to write custom CSS
- **Consistent Design**: Predefined spacing, colors, and scales
- **Responsive**: Mobile-first responsive utilities
- **Dark Mode**: Built-in dark mode support
- **Small Bundle**: Only used utilities are included
- **Customizable**: Easy to extend and customize

## Configuration

### Tailwind Config

Location: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### CSS Variables

Location: `src/index.css`

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... more variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... more variables */
  }
}
```

## Basic Usage

### Utility Classes

```tsx
// Padding and margin
<div className="p-4 m-2">Content</div>

// Flex layout
<div className="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>

// Grid layout
<div className="grid grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Typography
<h1 className="text-4xl font-bold text-gray-900">Title</h1>
<p className="text-base text-gray-600">Paragraph</p>

// Colors
<div className="bg-blue-500 text-white">Colored div</div>

// Borders and shadows
<div className="border border-gray-300 rounded-lg shadow-md">
  Card
</div>
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="
  w-full       // Full width on mobile
  md:w-1/2     // Half width on medium screens
  lg:w-1/3     // One-third width on large screens
">
  Responsive div
</div>

// Responsive text
<h1 className="text-2xl md:text-4xl lg:text-5xl">
  Responsive heading
</h1>

// Responsive layout
<div className="
  flex
  flex-col       // Column on mobile
  md:flex-row    // Row on medium screens
  gap-4
">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Breakpoints

```
sm: 640px   // Small devices (phones)
md: 768px   // Medium devices (tablets)
lg: 1024px  // Large devices (laptops)
xl: 1280px  // Extra large devices (desktops)
2xl: 1536px // 2X large devices (large desktops)
```

## Dark Mode

### Enabling Dark Mode

The application uses `next-themes` for dark mode support.

```tsx
// Add theme provider in main.tsx
import { ThemeProvider } from 'next-themes'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      {/* Your app */}
    </ThemeProvider>
  )
}
```

### Dark Mode Classes

```tsx
// Light and dark variants
<div className="
  bg-white dark:bg-gray-900
  text-black dark:text-white
">
  Content adapts to theme
</div>

// Dark mode specific styles
<div className="
  border-gray-200
  dark:border-gray-800
  hover:bg-gray-100
  dark:hover:bg-gray-800
">
  Hover states for both themes
</div>
```

### Theme Toggle Component

```tsx
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

## Color System

### Using CSS Variables

```tsx
// Using theme colors
<div className="bg-primary text-primary-foreground">
  Primary button
</div>

<div className="bg-secondary text-secondary-foreground">
  Secondary button
</div>

<div className="bg-accent text-accent-foreground">
  Accent element
</div>

<div className="bg-destructive text-destructive-foreground">
  Danger state
</div>
```

### Available Color Classes

```tsx
// Background colors
bg-background       // Main background
bg-foreground      // Text color
bg-card            // Card background
bg-popover         // Popover background
bg-primary         // Primary brand color
bg-secondary       // Secondary color
bg-accent          // Accent color
bg-destructive     // Error/danger color
bg-muted           // Muted background
bg-border          // Border color

// Text colors (same pattern)
text-background
text-foreground
// ... etc
```

## Component Styling

### Using the `cn` Utility

The `cn` utility from `lib/utils.ts` merges class names intelligently:

```tsx
import { cn } from '@/lib/utils'

interface ButtonProps {
  className?: string
  variant?: 'default' | 'outline'
}

function Button({ className, variant = 'default' }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg',
        variant === 'default' && 'bg-primary text-white',
        variant === 'outline' && 'border border-primary text-primary',
        className
      )}
    >
      Click me
    </button>
  )
}
```

### Class Variance Authority (CVA)

For complex variants, use CVA:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  )
}
```

## Layout Patterns

### Container

```tsx
<div className="container mx-auto px-4">
  {/* Content */}
</div>
```

### Centered Content

```tsx
<div className="flex items-center justify-center min-h-screen">
  <div className="w-full max-w-md">
    {/* Centered content */}
  </div>
</div>
```

### Two-Column Layout

```tsx
<div className="grid md:grid-cols-2 gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

### Sidebar Layout

```tsx
<div className="flex min-h-screen">
  <aside className="w-64 bg-gray-100">
    {/* Sidebar */}
  </aside>
  <main className="flex-1 p-6">
    {/* Main content */}
  </main>
</div>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="bg-card rounded-lg p-6 shadow-md">
      {/* Card content */}
    </div>
  ))}
</div>
```

## Typography

### Headings

```tsx
<h1 className="text-4xl font-bold">Heading 1</h1>
<h2 className="text-3xl font-semibold">Heading 2</h2>
<h3 className="text-2xl font-medium">Heading 3</h3>
<h4 className="text-xl font-medium">Heading 4</h4>
```

### Body Text

```tsx
<p className="text-base text-foreground">
  Regular paragraph text
</p>

<p className="text-sm text-muted-foreground">
  Small muted text
</p>

<p className="text-lg font-medium">
  Large medium text
</p>
```

### Text Utilities

```tsx
// Text alignment
<p className="text-left">Left</p>
<p className="text-center">Center</p>
<p className="text-right">Right</p>

// Text decoration
<p className="underline">Underlined</p>
<p className="line-through">Strikethrough</p>

// Text transform
<p className="uppercase">Uppercase</p>
<p className="lowercase">Lowercase</p>
<p className="capitalize">Capitalize</p>

// Text truncation
<p className="truncate">This text will be truncated...</p>
<p className="line-clamp-2">This text will show max 2 lines...</p>
```

## Spacing

### Padding and Margin

```tsx
// Uniform spacing
<div className="p-4">Padding all sides</div>
<div className="m-4">Margin all sides</div>

// Directional spacing
<div className="pt-4">Padding top</div>
<div className="pr-4">Padding right</div>
<div className="pb-4">Padding bottom</div>
<div className="pl-4">Padding left</div>

// Axis spacing
<div className="px-4">Padding horizontal</div>
<div className="py-4">Padding vertical</div>

// Spacing scale
p-0  // 0px
p-1  // 4px
p-2  // 8px
p-4  // 16px
p-6  // 24px
p-8  // 32px
p-12 // 48px
p-16 // 64px
```

### Gap (for Flexbox/Grid)

```tsx
<div className="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div className="grid grid-cols-2 gap-x-4 gap-y-6">
  {/* Grid items */}
</div>
```

## Effects

### Hover States

```tsx
<button className="
  bg-primary
  hover:bg-primary/90
  hover:scale-105
  transition-all
">
  Hover me
</button>
```

### Focus States

```tsx
<input className="
  border
  focus:outline-none
  focus:ring-2
  focus:ring-primary
  focus:border-transparent
" />
```

### Transitions

```tsx
<div className="
  transition-all
  duration-300
  ease-in-out
  hover:translate-y-1
">
  Smooth transition
</div>
```

### Animations

```tsx
// Spin
<div className="animate-spin">Loading...</div>

// Pulse
<div className="animate-pulse">Loading...</div>

// Bounce
<div className="animate-bounce">Attention!</div>
```

## Custom Styles

### When to Use Custom CSS

Use custom CSS for:
- Complex animations
- Unique designs not covered by Tailwind
- Third-party library overrides

### Adding Custom Styles

```css
/* src/App.css or component-specific CSS */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: theme('colors.gray.400');
  border-radius: 4px;
}
```

### Extending Tailwind

```css
/* src/index.css */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90;
  }

  .card {
    @apply bg-card rounded-lg shadow-md p-6;
  }
}
```

## Best Practices

### 1. Use Semantic Class Names

```tsx
// Good
<div className="flex items-center justify-between p-4 bg-card">

// Avoid
<div className="flex items-center justify-between p-4 bg-white">
```

### 2. Keep Classes Organized

```tsx
// Organize by category
<div className="
  // Layout
  flex items-center justify-between
  // Spacing
  p-4 gap-4
  // Appearance
  bg-card rounded-lg shadow-md
  // Responsive
  md:flex-row lg:p-6
">
```

### 3. Use Consistent Spacing

```tsx
// Use the spacing scale
<div className="space-y-4">
  <div className="p-4">Item 1</div>
  <div className="p-4">Item 2</div>
</div>
```

### 4. Mobile-First Approach

```tsx
// Good - start with mobile, add larger breakpoints
<div className="w-full md:w-1/2 lg:w-1/3">

// Avoid - desktop-first
<div className="w-1/3 lg:w-1/2 md:w-full">
```

### 5. Extract Reusable Components

```tsx
// Instead of repeating classes
<button className="px-4 py-2 bg-primary text-white rounded-lg">
  Button 1
</button>
<button className="px-4 py-2 bg-primary text-white rounded-lg">
  Button 2
</button>

// Create a component
function Button({ children }) {
  return (
    <button className="px-4 py-2 bg-primary text-white rounded-lg">
      {children}
    </button>
  )
}
```

## Performance

### PurgeCSS

Tailwind automatically removes unused styles in production. Make sure all class names are complete strings:

```tsx
// Good - Tailwind can detect these
<div className="bg-red-500">
<div className={isActive ? 'bg-blue-500' : 'bg-gray-500'}>

// Bad - Tailwind cannot detect these
<div className={`bg-${color}-500`}>
<div className={'bg-' + color + '-500'}>
```

### JIT Mode

Tailwind 4 uses JIT (Just-In-Time) compilation by default, which:
- Generates styles on-demand
- Smaller CSS files
- Faster build times
- All variants available

## Common Patterns

### Button Styles

```tsx
// Primary button
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">

// Outline button
<button className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10">

// Ghost button
<button className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg">
```

### Input Styles

```tsx
<input
  className="
    w-full px-4 py-2
    border border-input
    rounded-lg
    focus:outline-none
    focus:ring-2
    focus:ring-primary
    dark:bg-background
  "
/>
```

### Card Styles

```tsx
<div className="
  bg-card
  rounded-lg
  shadow-md
  p-6
  border border-border
  hover:shadow-lg
  transition-shadow
">
  Card content
</div>
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Class Variance Authority](https://cva.style/docs)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
