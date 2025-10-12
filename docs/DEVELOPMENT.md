# Development Guide

## Overview

This guide covers development workflows, best practices, code standards, and tools for the Model Client React application.

## Getting Started

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd model-client-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Development Environment

**Recommended Tools:**
- **Node.js**: v18 or higher
- **Package Manager**: npm, yarn, or pnpm
- **Code Editor**: VS Code (recommended)
- **Browser**: Chrome or Firefox with React DevTools

**VS Code Extensions:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Auto Import
- Path Intellisense
- GitLens

## Project Scripts

### Available Commands

```bash
# Development
npm run dev              # Start dev server (port 5173)
npm run dev -- --port 3000  # Start on custom port

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint -- --fix    # Fix ESLint errors
npm run type-check       # Check TypeScript types

# Testing (when implemented)
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

## Code Style

### ESLint Configuration

The project uses ESLint for code quality and consistency.

```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'error',
      // ... more rules
    }
  }
]
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Naming Conventions

**Files and Folders:**
```
components/     # PascalCase for components
  UserProfile.tsx
  Button.tsx

hooks/         # camelCase with 'use' prefix
  useAuth.ts
  useFetch.ts

lib/           # camelCase for utilities
  utils.ts
  api.ts

pages/         # PascalCase for pages
  Login.tsx
  Dashboard.tsx
```

**Code:**
```tsx
// Components: PascalCase
function UserProfile() {}
const Button = () => {}

// Functions: camelCase
function fetchData() {}
const handleClick = () => {}

// Constants: UPPER_SNAKE_CASE
const API_URL = 'https://api.example.com'
const MAX_ITEMS = 100

// Types/Interfaces: PascalCase
interface UserData {}
type ButtonProps = {}

// Variables: camelCase
const userName = 'John'
let isLoading = false
```

## Component Development

### Component Template

```tsx
// src/components/ExampleComponent.tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * ExampleComponent - Brief description
 *
 * @param title - Component title
 * @param onAction - Callback when action is triggered
 */
export interface ExampleComponentProps {
  title: string
  onAction?: () => void
  className?: string
}

export function ExampleComponent({
  title,
  onAction,
  className,
}: ExampleComponentProps) {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(prev => prev + 1)
    onAction?.()
  }

  return (
    <div className={cn('p-4 rounded-lg bg-card', className)}>
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={handleClick}>
        Count: {count}
      </button>
    </div>
  )
}
```

### Component Best Practices

1. **Single Responsibility**: Each component should do one thing
2. **Props Interface**: Always define TypeScript interfaces
3. **Default Props**: Use default parameters
4. **Composition**: Break down complex components
5. **Memoization**: Use `memo` for expensive components
6. **Error Boundaries**: Wrap components that might fail

### Example: Complex Component

```tsx
import { memo, useCallback, useMemo } from 'react'

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
}

export const DataTable = memo(function DataTable<T>({
  data,
  columns,
  onRowClick,
}: DataTableProps<T>) {
  // Memoize expensive calculations
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      // Sorting logic
    })
  }, [data])

  // Memoize callbacks
  const handleRowClick = useCallback((row: T) => {
    onRowClick?.(row)
  }, [onRowClick])

  return (
    <table>
      {/* Table implementation */}
    </table>
  )
})
```

## Custom Hooks

### Hook Template

```tsx
// src/hooks/use-example.ts
import { useState, useEffect } from 'react'

/**
 * useExample - Custom hook description
 *
 * @param initialValue - Initial value
 * @returns State and methods
 */
export function useExample(initialValue: string) {
  const [value, setValue] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Effect logic
  }, [value])

  const updateValue = (newValue: string) => {
    setValue(newValue)
  }

  return {
    value,
    loading,
    updateValue,
  }
}
```

### Common Hook Patterns

```tsx
// Data fetching hook
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(url)
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}

// Local storage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

## State Management

### Local State (useState)

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### Form State (React Hook Form)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### Context API (for global state)

```tsx
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState } from 'react'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    // Login logic
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

## API Integration

### API Client Setup

```tsx
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient(API_URL)
```

### Usage Example

```tsx
// src/hooks/use-users.ts
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface User {
  id: number
  name: string
  email: string
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await api.get<User[]>('/users')
        setUsers(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return { users, loading, error }
}
```

## Error Handling

### Try-Catch Pattern

```tsx
async function fetchData() {
  try {
    const data = await api.get('/data')
    return data
  } catch (error) {
    console.error('Failed to fetch data:', error)
    toast.error('Failed to load data')
    throw error
  }
}
```

### Error Boundary Component

```tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Testing (Future Implementation)

### Unit Testing

```tsx
// ExampleComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ExampleComponent } from './ExampleComponent'

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(<ExampleComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<ExampleComponent title="Test" onAction={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Testing

```tsx
// LoginFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from './LoginPage'

describe('Login Flow', () => {
  it('logs in successfully', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(window.location.pathname).toBe('/dahs')
    })
  })
})
```

## Performance Optimization

### Code Splitting

```tsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  )
}
```

### Memoization

```tsx
import { memo, useMemo, useCallback } from 'react'

// Memoize component
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  return <div>{/* Expensive rendering */}</div>
})

// Memoize value
function MyComponent({ items }) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name))
  }, [items])

  return <List items={sortedItems} />
}

// Memoize callback
function MyComponent({ onSave }) {
  const handleSave = useCallback((data) => {
    onSave(data)
  }, [onSave])

  return <Form onSubmit={handleSave} />
}
```

## Debugging

### React DevTools

1. Install React DevTools browser extension
2. Open DevTools (F12)
3. Navigate to "Components" or "Profiler" tab

### Console Logging

```tsx
// Development only
if (import.meta.env.DEV) {
  console.log('Debug info:', data)
}

// Better: Use debug utility
const debug = import.meta.env.DEV
  ? console.log.bind(console)
  : () => {}

debug('Debug info:', data)
```

### Error Tracking

```tsx
// Integrate with error tracking service (e.g., Sentry)
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
})

// Manual error reporting
try {
  // Code
} catch (error) {
  Sentry.captureException(error)
}
```

## Git Workflow

### Branch Strategy

```bash
main          # Production-ready code
develop       # Development branch
feature/*     # New features
bugfix/*      # Bug fixes
hotfix/*      # Urgent production fixes
```

### Commit Messages

Follow conventional commits:

```bash
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: reorganize component structure
test: add tests for UserProfile
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push branch to remote
4. Create pull request
5. Request code review
6. Address feedback
7. Merge when approved

## Best Practices

1. **Code Quality**: Run linter before committing
2. **Type Safety**: Use TypeScript strictly
3. **Component Size**: Keep components small and focused
4. **DRY Principle**: Don't repeat yourself
5. **Documentation**: Comment complex logic
6. **Error Handling**: Always handle errors gracefully
7. **Performance**: Optimize only when necessary
8. **Accessibility**: Test with keyboard and screen readers
9. **Testing**: Write tests for critical functionality
10. **Git**: Commit often with meaningful messages

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev)
- [React Hook Form](https://react-hook-form.com)
- [Testing Library](https://testing-library.com)
- [React DevTools](https://react.dev/learn/react-developer-tools)
