# Component Guide

## Overview

This guide covers how to use, create, and customize components in the Model Client React application. The project uses **shadcn/ui** components built on top of **Radix UI** primitives.

## Component Library

### What is shadcn/ui?

shadcn/ui is not a traditional component library. Instead of installing a package, components are copied directly into your project. This gives you:

- **Full control** over the code
- **Customization** without fighting the library
- **No dependencies** on a specific version
- **Type safety** with TypeScript

### Available Components

The project includes 50+ pre-built components:

#### Layout Components
- **Accordion** - Collapsible content sections
- **Card** - Content container with header, body, footer
- **Collapsible** - Show/hide content
- **Tabs** - Tabbed interface
- **Separator** - Visual divider
- **Aspect Ratio** - Maintain aspect ratio
- **Resizable** - Resizable panels
- **Scroll Area** - Custom scrollable area

#### Form Components
- **Button** - Clickable button with variants
- **Input** - Text input field
- **Textarea** - Multi-line text input
- **Select** - Dropdown select
- **Checkbox** - Checkbox input
- **Radio Group** - Radio button group
- **Switch** - Toggle switch
- **Slider** - Range slider
- **Label** - Form label
- **Form** - Form with validation

#### Data Display
- **Table** - Data table with sorting
- **Badge** - Status badge
- **Avatar** - User avatar
- **Calendar** - Date picker calendar
- **Progress** - Progress bar
- **Chart** - Data visualization charts

#### Feedback
- **Alert** - Alert message
- **Toast** - Toast notification (Sonner)
- **Alert Dialog** - Modal alert
- **Skeleton** - Loading skeleton

#### Navigation
- **Breadcrumb** - Navigation breadcrumb
- **Dropdown Menu** - Dropdown menu
- **Navigation Menu** - Navigation bar
- **Menubar** - Menu bar
- **Context Menu** - Right-click menu
- **Command** - Command palette (cmdk)

#### Overlay
- **Dialog** - Modal dialog
- **Sheet** - Slide-out panel
- **Drawer** - Bottom drawer (mobile)
- **Popover** - Popover content
- **Tooltip** - Hover tooltip
- **Hover Card** - Hover card

#### Other
- **Carousel** - Image carousel
- **Input OTP** - OTP input
- **Toggle** - Toggle button
- **Toggle Group** - Toggle button group

## Using Components

### Basic Usage

```tsx
import { Button } from '@/components/ui/button'

function MyComponent() {
  return (
    <Button onClick={() => console.log('Clicked!')}>
      Click Me
    </Button>
  )
}
```

### Component Variants

Most components support variants:

```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Icon />
</Button>
```

### Composition Pattern

Components are designed to be composed:

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function MyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  )
}
```

## Adding New Components

### Using the CLI

The easiest way to add a new component:

```bash
npx shadcn@latest add [component-name]
```

Examples:

```bash
# Add a button component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add button input form

# Add all components
npx shadcn@latest add
```

The CLI will:
1. Download the component code
2. Add it to `src/components/ui/`
3. Install any required dependencies
4. Configure properly for your project

### Manual Installation

If you prefer to add components manually:

1. Copy component code from [ui.shadcn.com](https://ui.shadcn.com)
2. Place in `src/components/ui/[component-name].tsx`
3. Install required dependencies
4. Import and use

## Creating Custom Components

### Component Template

```tsx
// src/components/my-component.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface MyComponentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  variant?: 'default' | 'secondary'
}

const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, title, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'base-classes',
          variant === 'secondary' && 'secondary-classes',
          className
        )}
        {...props}
      >
        {title && <h3>{title}</h3>}
        {props.children}
      </div>
    )
  }
)

MyComponent.displayName = 'MyComponent'

export { MyComponent }
```

### Using Variants

Use `class-variance-authority` for type-safe variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const componentVariants = cva(
  'base-classes-for-all-variants',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-input bg-background',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface MyComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

export function MyComponent({
  className,
  variant,
  size,
  ...props
}: MyComponentProps) {
  return (
    <div
      className={componentVariants({ variant, size, className })}
      {...props}
    />
  )
}
```

## Form Components

### React Hook Form Integration

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormDescription>
                Enter your email address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Form Validation with Zod

```tsx
import * as z from 'zod'

// Define schema
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18 years old'),
  role: z.enum(['admin', 'user', 'guest']),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to terms',
  }),
})

// Type inference
type UserFormData = z.infer<typeof userSchema>
```

## Dialog & Modal Components

### Basic Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a dialog description
          </DialogDescription>
        </DialogHeader>
        <div>
          {/* Dialog content */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Controlled Dialog

```tsx
function ControlledDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Controlled Dialog</DialogTitle>
        </DialogHeader>
        <Button onClick={() => setOpen(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}
```

## Toast Notifications

### Using Sonner

```tsx
import { toast } from 'sonner'

function MyComponent() {
  const showToast = () => {
    toast.success('Success!', {
      description: 'Your action was successful',
    })
  }

  const showError = () => {
    toast.error('Error!', {
      description: 'Something went wrong',
    })
  }

  const showPromise = async () => {
    toast.promise(
      fetch('/api/data'),
      {
        loading: 'Loading...',
        success: 'Data loaded!',
        error: 'Failed to load data',
      }
    )
  }

  return (
    <div>
      <Button onClick={showToast}>Show Success</Button>
      <Button onClick={showError}>Show Error</Button>
      <Button onClick={showPromise}>Show Promise</Button>
    </div>
  )
}
```

## Data Tables

### Basic Table

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function UsersTable({ users }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

## Styling Components

### Using Tailwind Classes

```tsx
<Button className="w-full md:w-auto bg-blue-500 hover:bg-blue-600">
  Custom Button
</Button>
```

### Using the `cn` Utility

The `cn` utility merges class names and handles conflicts:

```tsx
import { cn } from '@/lib/utils'

function MyComponent({ className, isActive }) {
  return (
    <div
      className={cn(
        'base-classes',
        isActive && 'active-classes',
        className
      )}
    />
  )
}
```

### Dark Mode Support

Components automatically support dark mode:

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  This adapts to the theme
</div>
```

## Accessibility

### Keyboard Navigation

All components support keyboard navigation:
- **Tab**: Navigate between focusable elements
- **Enter/Space**: Activate buttons and checkboxes
- **Escape**: Close dialogs and menus
- **Arrow keys**: Navigate menus and lists

### ARIA Attributes

Components include proper ARIA attributes:

```tsx
<Button
  aria-label="Close dialog"
  aria-pressed={isActive}
  aria-disabled={isDisabled}
>
  Close
</Button>
```

### Screen Reader Support

All interactive elements have appropriate labels and descriptions.

## Performance Tips

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### Memoization

```tsx
import { memo } from 'react'

const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Expensive rendering logic
  return <div>{/* ... */}</div>
})
```

### Virtual Lists

For large lists, use virtualization:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }) {
  const parentRef = useRef()

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  })

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div key={virtualItem.key} style={{ height: virtualItem.size }}>
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Best Practices

1. **Use Semantic HTML**: Choose the right HTML elements
2. **Composition over Configuration**: Build complex UIs from simple components
3. **Type Everything**: Use TypeScript for all props and state
4. **Accessibility First**: Consider keyboard and screen reader users
5. **Responsive Design**: Test on different screen sizes
6. **Performance**: Use memo, useMemo, useCallback when appropriate
7. **Consistent Naming**: Follow naming conventions
8. **Documentation**: Document complex components
9. **Testing**: Write tests for complex interactions
10. **Error Handling**: Handle errors gracefully

## Common Patterns

### Modal Form

```tsx
function EditUserDialog({ user, onSave }) {
  const [open, setOpen] = useState(false)
  const form = useForm({
    defaultValues: user,
  })

  const onSubmit = async (data) => {
    await onSave(data)
    setOpen(false)
    toast.success('User updated!')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Form fields */}
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

### Confirmation Dialog

```tsx
function DeleteButton({ onDelete }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)
