# Documentation

Welcome to the Model Client React documentation! This comprehensive guide will help you understand, develop, and deploy the application.

## Quick Links

- [Main README](../README.md) - Project overview and quick start
- [Architecture Guide](./ARCHITECTURE.md) - Application structure and design patterns
- [Component Guide](./COMPONENTS.md) - UI components and usage
- [Routing Guide](./ROUTING.md) - Navigation and routing patterns
- [Styling Guide](./STYLING.md) - Tailwind CSS and theming
- [Development Guide](./DEVELOPMENT.md) - Development workflow and best practices
- [Deployment Guide](./DEPLOYMENT.md) - Building and deploying to production

## Getting Started

If you're new to the project, start here:

1. **Setup**: Read the [Main README](../README.md#getting-started) to set up your development environment
2. **Architecture**: Understand the [Architecture Guide](./ARCHITECTURE.md) to learn how the app is structured
3. **Components**: Learn about UI components in the [Component Guide](./COMPONENTS.md)
4. **Development**: Follow best practices in the [Development Guide](./DEVELOPMENT.md)

## Documentation Structure

### [Architecture Guide](./ARCHITECTURE.md)
Learn about the application's architecture, design patterns, and structure:
- Component-based architecture
- Design patterns (Layout, Composition, Custom Hooks)
- Data flow and state management
- Routing architecture
- Performance optimization
- Best practices

### [Component Guide](./COMPONENTS.md)
Comprehensive guide to using and creating components:
- Available UI components (50+ components)
- Component usage examples
- Creating custom components
- Form components and validation
- Dialogs and modals
- Styling components
- Accessibility features

### [Routing Guide](./ROUTING.md)
Everything about navigation and routing:
- Route structure and configuration
- Layouts and nested routes
- Navigation components (Link, NavLink)
- Dynamic routes and parameters
- Query parameters
- Route protection and guards
- Navigation hooks

### [Styling Guide](./STYLING.md)
Master Tailwind CSS and theming:
- Tailwind CSS basics
- Responsive design
- Dark mode implementation
- Color system
- Component styling patterns
- Layout patterns
- Typography and spacing
- Custom styles

### [Development Guide](./DEVELOPMENT.md)
Development workflow and best practices:
- Project setup and scripts
- Code style and conventions
- Component development
- Custom hooks
- State management
- API integration
- Error handling
- Testing
- Performance optimization
- Git workflow

### [Deployment Guide](./DEPLOYMENT.md)
Build and deploy to production:
- Building for production
- Environment variables
- Deployment to various platforms (Vercel, Netlify, AWS, etc.)
- CI/CD pipelines
- Performance optimization
- Monitoring and analytics
- Security considerations
- Troubleshooting

## Tech Stack

### Core
- **React 19.1.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 7.1.2** - Build tool

### UI & Styling
- **Tailwind CSS 4.1.13** - Utility-first CSS
- **shadcn/ui** - Component library
- **Radix UI** - Accessible primitives
- **Lucide React** - Icons

### Forms & Validation
- **React Hook Form 7.62.0** - Form management
- **Zod 4.1.5** - Schema validation

### Routing
- **React Router DOM 7.8.2** - Client-side routing

## Project Structure

```
model-client-react/
├── docs/                    # Documentation
│   ├── README.md           # This file
│   ├── ARCHITECTURE.md     # Architecture guide
│   ├── COMPONENTS.md       # Component guide
│   ├── ROUTING.md          # Routing guide
│   ├── STYLING.md          # Styling guide
│   ├── DEVELOPMENT.md      # Development guide
│   └── DEPLOYMENT.md       # Deployment guide
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts
│   ├── components/        # Reusable components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   └── dahs/         # Dashboard pages
│   ├── routes/           # Route definitions
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── .env.example          # Environment variables template
├── README.md             # Project README
├── package.json          # Dependencies
└── vite.config.ts        # Vite configuration
```

## Common Tasks

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route in `src/routes/index.tsx`
3. Update navigation if needed

Example:
```tsx
// src/pages/Users.tsx
export default function Users() {
  return <div>Users Page</div>
}

// src/routes/index.tsx
<Route path="/users" element={<Users />} />
```

### Adding a New Component

1. Option 1: Use shadcn/ui CLI
   ```bash
   npx shadcn@latest add button
   ```

2. Option 2: Create custom component
   ```tsx
   // src/components/MyComponent.tsx
   export function MyComponent() {
     return <div>Component</div>
   }
   ```

### Styling a Component

Use Tailwind CSS utility classes:
```tsx
<div className="flex items-center gap-4 p-4 bg-card rounded-lg">
  Content
</div>
```

### Making API Calls

```tsx
import { api } from '@/lib/api'

const data = await api.get('/endpoint')
const result = await api.post('/endpoint', { data })
```

### Form with Validation

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  email: z.string().email(),
})

const form = useForm({
  resolver: zodResolver(schema),
})
```

## Frequently Asked Questions

### How do I add a new shadcn/ui component?

```bash
npx shadcn@latest add [component-name]
```

### How do I change the theme colors?

Edit CSS variables in `src/index.css`.

### How do I protect a route?

See the [Routing Guide - Route Protection](./ROUTING.md#route-protection).

### How do I enable dark mode?

The app includes dark mode support via `next-themes`. See [Styling Guide - Dark Mode](./STYLING.md#dark-mode).

### How do I optimize performance?

See [Development Guide - Performance Optimization](./DEVELOPMENT.md#performance-optimization).

### How do I deploy to production?

See the [Deployment Guide](./DEPLOYMENT.md).

## Troubleshooting

### Common Issues

**Issue:** `node_modules` appearing in Git
```bash
git rm -r --cached node_modules
```

**Issue:** TypeScript errors
```bash
npm run build
```

**Issue:** Styling not working
- Restart dev server after Tailwind changes
- Check class names are complete strings

**Issue:** Routes not working
- Check route configuration
- Verify layout components use `<Outlet />`

For more troubleshooting help, see:
- [Development Guide - Debugging](./DEVELOPMENT.md#debugging)
- [Deployment Guide - Troubleshooting](./DEPLOYMENT.md#troubleshooting)

## Contributing

When contributing to documentation:

1. Keep examples simple and practical
2. Update all relevant sections
3. Test code examples
4. Use proper markdown formatting
5. Include links to related docs

## Resources

### Official Documentation
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [React Router](https://reactrouter.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

### Learning Resources
- [React Tutorial](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/utility-first)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## Need Help?

If you can't find what you're looking for:

1. Check the relevant guide in this documentation
2. Search the codebase for examples
3. Review the official documentation for the technology
4. Ask the development team
5. Create an issue in the repository

## Changelog

### Documentation Updates

- **2025-10-12**: Initial documentation created
  - Architecture guide
  - Component guide
  - Routing guide
  - Styling guide
  - Development guide
  - Deployment guide

---

**Happy coding!** If you find any issues or have suggestions for improving this documentation, please let us know.
