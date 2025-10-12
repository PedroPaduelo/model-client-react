# Model Client - React Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19.1.1-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1.2-646cff?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.13-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-Private-red)

Modern, fast, and scalable React application built with TypeScript, Vite, and Tailwind CSS.

[Features](#features) • [Getting Started](#getting-started) • [Documentation](#documentation) • [Tech Stack](#tech-stack)

</div>

---

## Overview

This is a modern React application template featuring a complete authentication flow, dashboard interface, and a comprehensive UI component library powered by **shadcn/ui** and **Radix UI**. The project is optimized for developer experience with hot module replacement, TypeScript support, and a beautiful, accessible design system.

## Features

### Core Features
- ⚡ **Lightning Fast** - Built with Vite for instant server start and HMR
- 🎨 **Beautiful UI** - Complete shadcn/ui component library with 50+ components
- 🔐 **Authentication** - Ready-to-use login and registration pages
- 📱 **Responsive** - Mobile-first design with responsive layouts
- 🌓 **Dark Mode** - Theme switching with next-themes
- 🎯 **Type Safe** - Full TypeScript coverage
- ♿ **Accessible** - ARIA-compliant components from Radix UI
- 🔄 **React Router** - Client-side routing with protected routes
- 📝 **Form Validation** - React Hook Form + Zod schema validation
- 🎉 **Toast Notifications** - Beautiful notifications with Sonner
- 📊 **Charts** - Data visualization with Recharts

### UI Components Library
Over 50+ pre-built, customizable components including:
- Forms (Input, Select, Checkbox, Radio, Switch, Slider, etc.)
- Layout (Dialog, Sheet, Drawer, Tabs, Accordion, etc.)
- Feedback (Alert, Toast, Progress, Loading, etc.)
- Navigation (Menu, Dropdown, Breadcrumb, Navigation Menu, etc.)
- Data Display (Table, Card, Avatar, Badge, Calendar, etc.)
- And many more!

## Tech Stack

### Frontend Framework
- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 5.8.3** - Static type checking
- **Vite 7.1.2** - Next generation frontend tooling

### UI & Styling
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **shadcn/ui** - Re-usable components built with Radix UI
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful & consistent icon set
- **next-themes** - Perfect dark mode support

### Form & Validation
- **React Hook Form 7.62.0** - Performant form management
- **Zod 4.1.5** - TypeScript-first schema validation
- **@hookform/resolvers** - Zod integration for forms

### Routing & Navigation
- **React Router DOM 7.8.2** - Declarative routing

### Additional Libraries
- **date-fns** - Modern JavaScript date utility
- **Recharts** - Composable charting library
- **Sonner** - Beautiful toast notifications
- **Embla Carousel** - Lightweight carousel
- **class-variance-authority** - CSS-in-TS type-safe utility
- **cmdk** - Fast command menu component

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Vite Plugin React** - React Fast Refresh support

## Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**

### Installation

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

   Copy the `.env.example` to `.env` (or create a new `.env` file):
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure your backend API URL:
   ```env
   VITE_API_URL=http://localhost:3013
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## Project Structure

```
model-client-react/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, and other assets
│   ├── components/        # Reusable components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and helpers
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Layout.tsx
│   │   └── dahs/         # Dashboard pages
│   │       ├── Home.tsx
│   │       ├── Agout.tsx
│   │       └── Layout.tsx
│   ├── routes/           # Route definitions
│   │   └── index.tsx
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── .env                  # Environment variables (not in git)
├── .gitignore           # Git ignore rules
├── components.json      # shadcn/ui configuration
├── eslint.config.js     # ESLint configuration
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.ts       # Vite configuration
```

## Documentation

For detailed documentation, see the [docs](./docs) folder:

- [Architecture Guide](./docs/ARCHITECTURE.md) - Application structure and design patterns
- [Component Guide](./docs/COMPONENTS.md) - How to use and create components
- [Routing Guide](./docs/ROUTING.md) - Setting up routes and navigation
- [Styling Guide](./docs/STYLING.md) - Tailwind CSS best practices
- [Development Guide](./docs/DEVELOPMENT.md) - Development workflow and best practices
- [Deployment Guide](./docs/DEPLOYMENT.md) - How to build and deploy

## Routes

The application includes the following routes:

### Authentication Routes
- `/login` - User login page
- `/register` - User registration page

### Dashboard Routes
- `/dahs` or `/dahs/home` - Dashboard home page
- `/dahs/agout` - About page (dashboard)

### Special Routes
- `/` - Redirects to `/login`
- `*` - Catch-all redirects to `/login`

## Environment Variables

The following environment variables can be configured in `.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3013` |

**Note:** All environment variables must be prefixed with `VITE_` to be accessible in the client-side code.

## Adding New Components

This project uses [shadcn/ui](https://ui.shadcn.com) for components. To add a new component:

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add dialog
```

## Code Style & Linting

The project uses ESLint for code quality. Run the linter:

```bash
npm run lint
```

TypeScript is configured to be strict. Check for type errors:

```bash
npm run build
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- ⚡ Vite for instant HMR
- 📦 Code splitting by route
- 🎯 Tree shaking for smaller bundles
- 🗜️ Automatic minification in production
- 🖼️ Optimized asset loading

## Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Commit your changes: `git commit -am 'Add new feature'`
3. Push to the branch: `git push origin feature/new-feature`
4. Submit a pull request

## Troubleshooting

### Common Issues

**Problem:** `node_modules` appearing in git
```bash
# Remove from git tracking
git rm -r --cached node_modules
git commit -m "Remove node_modules from git"
```

**Problem:** Port 5173 already in use
```bash
# Use a different port
npm run dev -- --port 3000
```

**Problem:** Environment variables not working
- Ensure variables are prefixed with `VITE_`
- Restart the dev server after changing `.env`

## License

Private - All rights reserved

## Support

For issues and questions:
- Check the [documentation](./docs)
- Review existing GitHub issues
- Contact the development team

---

<div align="center">
Built with ❤️ using React + TypeScript + Vite + Tailwind CSS
</div>
