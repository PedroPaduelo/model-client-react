# Architecture Guide

## Overview

This document describes the architecture and design patterns used in the Model Client React application.

## Architecture Principles

### 1. Component-Based Architecture
The application follows a component-based architecture where the UI is broken down into small, reusable components.

### 2. Separation of Concerns
- **Presentation Layer**: React components (pages, UI components)
- **Business Logic**: Custom hooks and utility functions
- **Routing**: React Router for navigation
- **State Management**: React hooks (useState, useContext, etc.)

### 3. Type Safety
- Full TypeScript coverage
- Strict type checking enabled
- Interface definitions for all data structures

## Project Structure

```
src/
├── assets/           # Static assets (images, fonts)
├── components/       # Reusable UI components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── pages/           # Page components
│   ├── auth/        # Authentication pages
│   └── dahs/        # Dashboard pages
├── routes/          # Route definitions
├── App.tsx          # Root component
└── main.tsx         # Entry point
```

## Design Patterns

### 1. Layout Pattern
Pages are organized with layout wrappers that handle common structure:

```tsx
// Layout component
<AuthLayout>
  <Outlet /> {/* Child routes render here */}
</AuthLayout>
```

**Benefits:**
- Consistent page structure
- Shared navigation and sidebars
- Easy to maintain common elements

### 2. Component Composition
Components are designed to be composable and reusable:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

**Benefits:**
- Flexible and customizable
- Better code reuse
- Easier to test

### 3. Custom Hooks Pattern
Business logic is extracted into custom hooks:

```tsx
// hooks/use-mobile.ts
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Logic here
  }, [])

  return isMobile
}
```

**Benefits:**
- Logic reusability
- Cleaner components
- Easier to test business logic

### 4. Compound Components
Complex components use the compound component pattern:

```tsx
<Form>
  <FormField>
    <FormLabel />
    <FormControl />
    <FormMessage />
  </FormField>
</Form>
```

### 5. Render Props & Children Props
Components accept children and render props for flexibility:

```tsx
<Dialog>
  <DialogTrigger>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    Custom content here
  </DialogContent>
</Dialog>
```

## Data Flow

### Unidirectional Data Flow

```
User Action → Event Handler → State Update → Re-render
```

1. **User Interaction**: User clicks a button, types in input
2. **Event Handler**: React event handler is triggered
3. **State Update**: setState or other state management
4. **Re-render**: Component re-renders with new state

### Props Down, Events Up

```tsx
// Parent Component
function Parent() {
  const [data, setData] = useState()

  return (
    <Child
      data={data}              // Props down
      onChange={setData}       // Events up
    />
  )
}
```

## Routing Architecture

### Route Structure

```
/                    → Redirect to /login
/login              → Login page (Auth Layout)
/register           → Register page (Auth Layout)
/dahs               → Dashboard home
/dahs/home          → Dashboard home (same as above)
/dahs/agout         → About page
*                   → Redirect to /login
```

### Nested Routes

```tsx
<Routes>
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Route>

  <Route element={<DahsLayout />}>
    <Route path="/dahs">
      <Route index element={<DahsHome />} />
      <Route path="home" element={<DahsHome />} />
      <Route path="agout" element={<DahsAgout />} />
    </Route>
  </Route>
</Routes>
```

## Component Architecture

### Atomic Design Methodology

The application follows a modified version of Atomic Design:

1. **Atoms** - Basic UI elements (Button, Input, Label)
   - Location: `src/components/ui/`
   - Example: `button.tsx`, `input.tsx`

2. **Molecules** - Simple combinations of atoms
   - Location: `src/components/ui/`
   - Example: `card.tsx`, `form.tsx`

3. **Organisms** - Complex UI sections
   - Location: `src/components/`
   - Example: Navigation bars, forms with validation

4. **Pages** - Complete page layouts
   - Location: `src/pages/`
   - Example: `Login.tsx`, `Home.tsx`

### Component Structure

Each component should follow this structure:

```tsx
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types/Interfaces
interface MyComponentProps {
  title: string
  onSubmit?: () => void
}

// 3. Component Definition
export function MyComponent({ title, onSubmit }: MyComponentProps) {
  // 4. Hooks
  const [state, setState] = useState()

  // 5. Event Handlers
  const handleClick = () => {
    // Logic
  }

  // 6. Effects
  useEffect(() => {
    // Side effects
  }, [])

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

## State Management

### Local State
For component-specific state, use `useState`:

```tsx
const [isOpen, setIsOpen] = useState(false)
```

### Form State
For forms, use React Hook Form:

```tsx
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {}
})
```

### Global State (Future)
For global state, consider:
- React Context API
- Zustand
- Redux Toolkit
- Jotai

## Styling Architecture

### Tailwind CSS Utility-First
Primary styling approach using Tailwind utility classes:

```tsx
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900">
  {/* Content */}
</div>
```

### CSS Variables for Theming
Theme colors are defined using CSS custom properties:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}
```

### Component Variants
Use `class-variance-authority` for variant-based styling:

```tsx
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        outline: "outline-classes"
      }
    }
  }
)
```

## API Integration (Future)

### API Client Structure

```tsx
// lib/api.ts
const API_URL = import.meta.env.VITE_API_URL

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`)
    return response.json()
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}
```

### React Query (Recommended)
For data fetching and caching:

```tsx
import { useQuery } from '@tanstack/react-query'

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users')
  })
}
```

## Error Handling

### Error Boundaries
Use error boundaries to catch rendering errors:

```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

### Try-Catch for Async Operations

```tsx
async function fetchData() {
  try {
    const data = await api.get('/data')
    return data
  } catch (error) {
    console.error('Failed to fetch data:', error)
    toast.error('Failed to load data')
  }
}
```

## Performance Optimization

### Code Splitting
Routes are automatically code-split by Vite:

```tsx
// Lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'))

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Memoization

```tsx
// Prevent unnecessary re-renders
const MemoizedComponent = memo(ExpensiveComponent)

// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b)
}, [a, b])

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(a)
}, [a])
```

### Image Optimization
- Use modern formats (WebP, AVIF)
- Lazy load images
- Provide multiple sizes for responsive images

## Testing Strategy (Future)

### Unit Tests
Test individual components and functions:
- **Tool**: Vitest
- **Library**: Testing Library

### Integration Tests
Test component interactions:
- **Tool**: Testing Library
- **Focus**: User interactions, form submissions

### E2E Tests
Test complete user flows:
- **Tool**: Playwright or Cypress
- **Focus**: Critical user journeys

## Security Considerations

### Input Validation
- Use Zod schemas for all form inputs
- Sanitize user input before display
- Validate on both client and server

### Authentication
- Store tokens securely (httpOnly cookies preferred)
- Implement token refresh mechanism
- Handle token expiration gracefully

### XSS Prevention
- React escapes content by default
- Be careful with `dangerouslySetInnerHTML`
- Use Content Security Policy headers

## Build & Deployment

### Build Process

```bash
npm run build
```

**Output**: `dist/` folder with optimized static files

### Environment Variables
- Development: `.env`
- Production: Set in deployment platform
- All variables must start with `VITE_`

### Deployment Targets
- **Static Hosting**: Vercel, Netlify, Cloudflare Pages
- **Traditional Hosting**: Nginx, Apache
- **CDN**: CloudFront, Fastly

## Future Improvements

1. **State Management**: Implement Zustand or Redux for global state
2. **API Layer**: Add React Query for data fetching
3. **Testing**: Add comprehensive test suite
4. **i18n**: Internationalization support
5. **Analytics**: Add analytics tracking
6. **Error Tracking**: Integrate Sentry or similar
7. **PWA**: Progressive Web App features
8. **Accessibility**: Enhanced ARIA support and keyboard navigation

## Best Practices

1. **Keep Components Small**: Each component should have a single responsibility
2. **Use TypeScript**: Always define types for props and state
3. **Accessibility First**: Use semantic HTML and ARIA attributes
4. **Performance**: Optimize re-renders with memo, useMemo, useCallback
5. **Error Handling**: Always handle errors gracefully
6. **Code Organization**: Group related files together
7. **Documentation**: Document complex logic and APIs
8. **Testing**: Write tests for critical functionality
9. **Git Workflow**: Use feature branches and PR reviews
10. **Code Review**: Review all code before merging

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Router](https://reactrouter.com)
