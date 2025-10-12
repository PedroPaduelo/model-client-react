# Quick Start Guide

Get up and running with Model Client React in 5 minutes!

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm**, **yarn**, or **pnpm**
- **Git** ([download](https://git-scm.com/))

## Installation

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd model-client-react

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Create environment file
cp .env.example .env

# Edit .env with your backend API URL
# VITE_API_URL=http://localhost:3013
```

### 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## Your First Changes

### Add a New Page

1. **Create the page component:**

```tsx
// src/pages/dahs/NewPage.tsx
export default function NewPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">My New Page</h1>
      <p className="text-muted-foreground mt-2">
        This is my first page!
      </p>
    </div>
  )
}
```

2. **Add the route:**

```tsx
// src/routes/index.tsx
import NewPage from '@/pages/dahs/NewPage'

// Inside the DahsLayout Route:
<Route path="new-page" element={<NewPage />} />
```

3. **Add navigation link:**

```tsx
// In your navigation component
<Link to="/dahs/new-page">New Page</Link>
```

### Add a Component from shadcn/ui

```bash
# Add a button component
npx shadcn@latest add button

# Use it in your code
import { Button } from '@/components/ui/button'

<Button onClick={() => console.log('Clicked!')}>
  Click Me
</Button>
```

### Create a Form with Validation

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
})

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  })

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input {...form.register('name')} placeholder="Name" />
      <Input {...form.register('email')} placeholder="Email" />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev -- --port 3000  # Use different port

# Production
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Check code quality
npm run lint -- --fix   # Auto-fix issues
```

## Project Structure

```
src/
├── components/ui/     # UI components (shadcn/ui)
├── pages/            # Page components
│   ├── auth/        # Login, Register
│   └── dahs/        # Dashboard pages
├── routes/          # Route configuration
├── hooks/           # Custom hooks
├── lib/             # Utilities (utils.ts, api.ts)
└── App.tsx          # Main app
```

## Key Features

### 1. Tailwind CSS Styling

```tsx
<div className="flex items-center gap-4 p-6 bg-card rounded-lg shadow-md">
  <h2 className="text-xl font-bold">Title</h2>
  <p className="text-muted-foreground">Description</p>
</div>
```

### 2. Dark Mode

```tsx
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  )
}
```

### 3. Navigation

```tsx
import { Link, useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()

  return (
    <>
      <Link to="/dahs/home">Home</Link>
      <button onClick={() => navigate('/dahs/about')}>
        Go to About
      </button>
    </>
  )
}
```

### 4. Toast Notifications

```tsx
import { toast } from 'sonner'

function MyComponent() {
  const showToast = () => {
    toast.success('Success!', {
      description: 'Action completed successfully',
    })
  }

  return <button onClick={showToast}>Show Toast</button>
}
```

## Available Components

The project includes 50+ components from shadcn/ui:

### Forms
- Button, Input, Textarea, Select, Checkbox, Radio, Switch, Slider

### Layout
- Card, Tabs, Accordion, Separator, Collapsible, Scroll Area

### Overlay
- Dialog, Sheet, Drawer, Popover, Tooltip, Alert Dialog

### Feedback
- Alert, Toast, Progress, Skeleton

### Navigation
- Breadcrumb, Dropdown Menu, Navigation Menu, Context Menu

### Data Display
- Table, Badge, Avatar, Calendar, Chart

[See full list](./docs/COMPONENTS.md)

## Need Help?

- **Full Documentation**: [docs/README.md](./docs/README.md)
- **Component Examples**: [docs/COMPONENTS.md](./docs/COMPONENTS.md)
- **Routing Guide**: [docs/ROUTING.md](./docs/ROUTING.md)
- **Styling Guide**: [docs/STYLING.md](./docs/STYLING.md)

## Next Steps

1. Read the [Architecture Guide](./docs/ARCHITECTURE.md) to understand the app structure
2. Explore [Component Examples](./docs/COMPONENTS.md) to learn about available components
3. Check [Development Guide](./docs/DEVELOPMENT.md) for best practices
4. Learn about [Deployment](./docs/DEPLOYMENT.md) when ready to go live

## Troubleshooting

### Port already in use?
```bash
npm run dev -- --port 3000
```

### Dependencies not installing?
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors?
```bash
npm run build
```

### Environment variables not working?
- Ensure they start with `VITE_`
- Restart dev server after changes

---

**You're all set!** Start building amazing features. Check out the [full documentation](./docs/README.md) for more details.
