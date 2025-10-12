# Routing Guide

## Overview

This application uses **React Router v7** for client-side routing. This guide covers routing patterns, navigation, and best practices.

## Basic Concepts

### React Router Basics

React Router enables:
- **Client-side routing**: Navigate without page reloads
- **Nested routes**: Child routes within parent layouts
- **Dynamic routes**: Routes with parameters
- **Route protection**: Conditional rendering based on auth state

## Current Route Structure

```
/                         → Redirect to /login
/login                   → Login page (Auth Layout)
/register                → Register page (Auth Layout)
/dahs                    → Dashboard home
/dahs/home               → Dashboard home (same as above)
/dahs/agout              → About page
*                        → Catch-all redirect to /login
```

## Route Configuration

### Main Routes File

Location: `src/routes/index.tsx`

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '@/pages/auth/Layout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import DahsLayout from '@/pages/dahs/Layout'
import DahsHome from '@/pages/dahs/Home'
import DahsAgout from '@/pages/dahs/Agout'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth area */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Dashboard area */}
      <Route element={<DahsLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dahs">
          <Route index element={<DahsHome />} />
          <Route path="home" element={<DahsHome />} />
          <Route path="agout" element={<DahsAgout />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  )
}
```

## Layouts

### Auth Layout

Purpose: Wraps authentication pages (login, register)

```tsx
// src/pages/auth/Layout.tsx
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <Outlet /> {/* Child routes render here */}
      </div>
    </div>
  )
}
```

### Dashboard Layout

Purpose: Wraps dashboard pages with sidebar, header, etc.

```tsx
// src/pages/dahs/Layout.tsx
import { Outlet } from 'react-router-dom'

export default function DahsLayout() {
  return (
    <div className="min-h-screen">
      <header>{/* Navigation */}</header>
      <aside>{/* Sidebar */}</aside>
      <main>
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  )
}
```

## Navigation

### Link Component

Use `Link` for internal navigation:

```tsx
import { Link } from 'react-router-dom'

function Navigation() {
  return (
    <nav>
      <Link to="/dahs">Home</Link>
      <Link to="/dahs/agout">About</Link>
      <Link to="/login">Login</Link>
    </nav>
  )
}
```

### NavLink Component

Use `NavLink` for navigation with active state:

```tsx
import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav>
      <NavLink
        to="/dahs"
        className={({ isActive }) =>
          isActive ? 'active-class' : 'inactive-class'
        }
      >
        Home
      </NavLink>
    </nav>
  )
}
```

### Programmatic Navigation

Use `useNavigate` hook:

```tsx
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()

  const handleLogin = async () => {
    // Login logic
    navigate('/dahs', { replace: true })
  }

  const handleCancel = () => {
    navigate(-1) // Go back
  }

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  )
}
```

## Dynamic Routes

### Route Parameters

```tsx
// Route definition
<Route path="/users/:userId" element={<UserProfile />} />

// Component
import { useParams } from 'react-router-dom'

function UserProfile() {
  const { userId } = useParams()

  return <div>User ID: {userId}</div>
}

// Navigation
<Link to="/users/123">View User</Link>
```

### Optional Parameters

```tsx
<Route path="/products/:id?" element={<Products />} />

function Products() {
  const { id } = useParams()

  if (id) {
    return <ProductDetail id={id} />
  }

  return <ProductList />
}
```

### Multiple Parameters

```tsx
<Route path="/users/:userId/posts/:postId" element={<Post />} />

function Post() {
  const { userId, postId } = useParams()

  return (
    <div>
      User: {userId}, Post: {postId}
    </div>
  )
}
```

## Query Parameters

### Reading Query Parameters

```tsx
import { useSearchParams } from 'react-router-dom'

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q')
  const page = searchParams.get('page') || '1'

  return (
    <div>
      <p>Search: {query}</p>
      <p>Page: {page}</p>
    </div>
  )
}
```

### Setting Query Parameters

```tsx
function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const handleSearch = (query: string) => {
    setSearchParams({ q: query })
  }

  return (
    <input
      type="text"
      onChange={(e) => handleSearch(e.target.value)}
    />
  )
}
```

### Preserving Query Parameters

```tsx
function Pagination() {
  const [searchParams, setSearchParams] = useSearchParams()

  const changePage = (page: number) => {
    setSearchParams((prev) => {
      prev.set('page', page.toString())
      return prev
    })
  }

  return (
    <button onClick={() => changePage(2)}>
      Page 2
    </button>
  )
}
```

## Route Protection

### Protected Route Component

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
```

### Usage

```tsx
<Routes>
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<Login />} />
  </Route>

  <Route element={<ProtectedRoute />}>
    <Route element={<DahsLayout />}>
      <Route path="/dahs" element={<DahsHome />} />
    </Route>
  </Route>
</Routes>
```

### Role-Based Protection

```tsx
interface RoleProtectedRouteProps {
  allowedRoles: string[]
}

function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

// Usage
<Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
  <Route path="/admin" element={<AdminPanel />} />
</Route>
```

## Redirects

### Permanent Redirect

```tsx
<Route path="/old-path" element={<Navigate to="/new-path" replace />} />
```

### Conditional Redirect

```tsx
function ConditionalRedirect() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dahs" replace />
  }

  return <LoginPage />
}
```

### Redirect After Action

```tsx
function CreateUser() {
  const navigate = useNavigate()

  const handleSubmit = async (data: any) => {
    await createUser(data)
    navigate('/users', { replace: true })
  }

  return <UserForm onSubmit={handleSubmit} />
}
```

## Nested Routes

### Parent-Child Structure

```tsx
<Routes>
  <Route path="/settings" element={<SettingsLayout />}>
    <Route index element={<GeneralSettings />} />
    <Route path="profile" element={<ProfileSettings />} />
    <Route path="security" element={<SecuritySettings />} />
    <Route path="notifications" element={<NotificationSettings />} />
  </Route>
</Routes>
```

### Layout with Navigation

```tsx
function SettingsLayout() {
  return (
    <div className="flex">
      <nav className="w-64">
        <NavLink to="/settings">General</NavLink>
        <NavLink to="/settings/profile">Profile</NavLink>
        <NavLink to="/settings/security">Security</NavLink>
        <NavLink to="/settings/notifications">Notifications</NavLink>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
```

## Route Hooks

### useLocation

```tsx
import { useLocation } from 'react-router-dom'

function MyComponent() {
  const location = useLocation()

  console.log(location.pathname)  // "/dahs/home"
  console.log(location.search)    // "?page=2"
  console.log(location.hash)      // "#section"
  console.log(location.state)     // Passed state

  return <div>Current path: {location.pathname}</div>
}
```

### useNavigate

```tsx
import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()

  // Navigate to route
  navigate('/dahs')

  // Navigate with state
  navigate('/dahs', { state: { from: 'home' } })

  // Replace current entry
  navigate('/dahs', { replace: true })

  // Go back
  navigate(-1)

  // Go forward
  navigate(1)
}
```

### useParams

```tsx
import { useParams } from 'react-router-dom'

function UserProfile() {
  const { userId } = useParams<{ userId: string }>()

  return <div>User ID: {userId}</div>
}
```

### useSearchParams

```tsx
import { useSearchParams } from 'react-router-dom'

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q')

  const handleSearch = (value: string) => {
    setSearchParams({ q: value })
  }

  return (
    <input
      value={query || ''}
      onChange={(e) => handleSearch(e.target.value)}
    />
  )
}
```

## Loading States

### Route Loading

```tsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dahs" element={<Dashboard />} />
      </Routes>
    </Suspense>
  )
}
```

### Navigation Loading

```tsx
import { useNavigation } from 'react-router-dom'

function App() {
  const navigation = useNavigation()

  return (
    <>
      {navigation.state === 'loading' && <LoadingBar />}
      <Outlet />
    </>
  )
}
```

## Error Handling

### Error Boundary

```tsx
import { useRouteError } from 'react-router-dom'

function ErrorBoundary() {
  const error = useRouteError()

  return (
    <div>
      <h1>Oops!</h1>
      <p>{error.message}</p>
    </div>
  )
}

// Usage
<Route
  path="/dahs"
  element={<Dashboard />}
  errorElement={<ErrorBoundary />}
/>
```

## Best Practices

### 1. Route Organization

```
src/routes/
├── index.tsx           # Main routes
├── auth.tsx            # Auth routes
├── dashboard.tsx       # Dashboard routes
└── admin.tsx           # Admin routes
```

### 2. Lazy Loading

```tsx
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Settings = lazy(() => import('@/pages/Settings'))

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dahs" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}
```

### 3. Typed Routes

```tsx
// Define route paths as constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dahs',
  DASHBOARD_HOME: '/dahs/home',
  DASHBOARD_ABOUT: '/dahs/agout',
} as const

// Usage
<Link to={ROUTES.DASHBOARD}>Dashboard</Link>
navigate(ROUTES.LOGIN)
```

### 4. Route Utilities

```tsx
// src/lib/route-utils.ts
export function buildPath(
  path: string,
  params: Record<string, string>
): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, value),
    path
  )
}

// Usage
const path = buildPath('/users/:userId/posts/:postId', {
  userId: '123',
  postId: '456',
})
// Result: "/users/123/posts/456"
```

### 5. Navigation Guards

```tsx
function NavigationGuard() {
  const location = useLocation()

  useEffect(() => {
    // Track page views
    analytics.track('page_view', { path: location.pathname })
  }, [location])

  return <Outlet />
}
```

## Common Patterns

### Breadcrumbs

```tsx
import { useMatches } from 'react-router-dom'

function Breadcrumbs() {
  const matches = useMatches()

  return (
    <nav>
      {matches.map((match, index) => (
        <span key={match.pathname}>
          <Link to={match.pathname}>
            {match.handle?.crumb}
          </Link>
          {index < matches.length - 1 && ' > '}
        </span>
      ))}
    </nav>
  )
}
```

### Tab Navigation

```tsx
function TabNavigation() {
  const location = useLocation()

  return (
    <div>
      <div className="border-b">
        <Link
          to="/settings"
          className={location.pathname === '/settings' ? 'active' : ''}
        >
          General
        </Link>
        <Link
          to="/settings/profile"
          className={location.pathname === '/settings/profile' ? 'active' : ''}
        >
          Profile
        </Link>
      </div>
      <Outlet />
    </div>
  )
}
```

## Future Improvements

1. **Data Loaders**: Implement route-level data loading
2. **Route Guards**: Add more sophisticated route protection
3. **Route Animations**: Add page transition animations
4. **404 Page**: Create a custom 404 error page
5. **Breadcrumbs**: Implement automatic breadcrumb generation
6. **Route Metadata**: Add SEO metadata per route

## Resources

- [React Router Documentation](https://reactrouter.com)
- [React Router v7 Migration Guide](https://reactrouter.com/en/main/upgrading/v6)
- [React Router Patterns](https://reactrouter.com/en/main/start/concepts)
