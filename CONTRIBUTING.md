# Contributing to Model Client React

Thank you for considering contributing to Model Client React! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the project
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling, insulting comments, or personal attacks
- Publishing others' private information
- Any conduct that could be considered inappropriate

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- Git
- A code editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/your-username/model-client-react.git
   cd model-client-react
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/original-repo/model-client-react.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Start development server**

   ```bash
   npm run dev
   ```

## Development Process

### 1. Pick an Issue

- Check the [Issues](https://github.com/repo/issues) page
- Look for issues labeled `good-first-issue` if you're new
- Comment on the issue to let others know you're working on it

### 2. Create a Branch

Use descriptive branch names:

```bash
# Features
git checkout -b feature/add-user-profile

# Bug fixes
git checkout -b fix/login-redirect-issue

# Documentation
git checkout -b docs/update-readme

# Refactoring
git checkout -b refactor/simplify-auth-logic
```

### 3. Make Changes

- Write clean, readable code
- Follow the [Coding Standards](#coding-standards)
- Test your changes thoroughly
- Update documentation if needed

### 4. Commit Changes

- Follow [Commit Message Guidelines](#commit-messages)
- Make small, focused commits
- Each commit should represent a logical unit of work

### 5. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a pull request on GitHub.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Always define types for props, state, and function returns
- Avoid using `any` type
- Use interfaces for object shapes
- Use type aliases for unions and complex types

```tsx
// Good
interface UserProps {
  name: string
  age: number
  email?: string
}

function User({ name, age, email }: UserProps) {
  // ...
}

// Bad
function User(props: any) {
  // ...
}
```

### Components

- Use functional components with hooks
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks
- Use `memo` only when necessary for performance

```tsx
// Good
export function UserProfile({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div>
      {/* Component content */}
    </div>
  )
}

// Bad
export default (props) => {
  // Complex logic mixed with rendering
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utilities: `camelCase.ts` (e.g., `utils.ts`, `api.ts`)
- Types: `PascalCase.ts` or inline (e.g., `types.ts`)

### Folder Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   └── UserCard.tsx  # Custom components
├── hooks/            # Custom hooks
├── lib/              # Utilities
├── pages/            # Page components
└── types/            # Type definitions (optional)
```

### Imports

- Use absolute imports with `@/` alias
- Group imports: React → Third-party → Local
- Sort imports alphabetically within groups

```tsx
// Good
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { UserProfile } from './UserProfile'

// Bad
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { UserProfile } from './UserProfile'
```

### Styling

- Use Tailwind CSS utility classes
- Keep class names organized and readable
- Use `cn()` utility for conditional classes
- Follow mobile-first responsive design

```tsx
// Good
<div className="
  flex items-center justify-between
  p-4 gap-4
  bg-card rounded-lg shadow-md
  md:flex-row lg:p-6
">
  Content
</div>

// Bad
<div className="flex items-center justify-between p-4 gap-4 bg-card rounded-lg shadow-md md:flex-row lg:p-6">
  Content
</div>
```

### Code Quality

- Run linter before committing: `npm run lint`
- Fix linting issues: `npm run lint -- --fix`
- Check TypeScript errors: `npm run build`
- Remove unused imports and variables
- Avoid console.log in production code

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, etc.)
- `perf`: Performance improvements

### Examples

```bash
# Simple feature
feat: add user profile page

# Bug fix with scope
fix(auth): resolve login redirect issue

# Documentation update
docs: update installation instructions

# Refactoring with body
refactor(components): simplify button component

Remove unnecessary props and improve type safety.
The component is now more maintainable.

# Breaking change
feat(api)!: change authentication endpoint

BREAKING CHANGE: The auth endpoint has changed from /auth/login to /api/v2/auth/login
```

### Guidelines

- Use imperative mood ("add" not "added")
- Keep subject line under 72 characters
- Capitalize first letter
- No period at the end
- Separate subject from body with blank line
- Explain what and why, not how

## Pull Request Process

### Before Creating PR

1. **Update your branch**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run checks**

   ```bash
   npm run lint
   npm run build
   # npm run test (when available)
   ```

3. **Test thoroughly**
   - Test your changes manually
   - Test on different screen sizes
   - Test in different browsers if possible

### PR Title

Follow the same format as commit messages:

```
feat: add user profile page
fix: resolve login redirect issue
docs: update API documentation
```

### PR Description

Include:

1. **What** - What changes you made
2. **Why** - Why you made these changes
3. **How** - How to test these changes
4. **Screenshots** - If UI changes (before/after)
5. **Related Issues** - Link to related issues

Template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Changes Made
- Change 1
- Change 2
- Change 3

## How to Test
1. Step 1
2. Step 2
3. Expected result

## Screenshots (if applicable)
Before: [image]
After: [image]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Changes tested locally

## Related Issues
Closes #123
Related to #456
```

### Review Process

1. **Automated Checks**
   - Linting
   - Type checking
   - Build verification
   - Tests (when available)

2. **Code Review**
   - At least one approval required
   - Address all review comments
   - Request re-review after changes

3. **Merge**
   - Squash and merge (preferred)
   - Rebase and merge
   - Regular merge (for feature branches)

## Testing

### Manual Testing

Always test your changes:

1. **Functionality**
   - Does it work as expected?
   - Are there any edge cases?
   - Does it handle errors gracefully?

2. **UI/UX**
   - Is it visually correct?
   - Is it responsive?
   - Does it match the design?

3. **Accessibility**
   - Can you navigate with keyboard?
   - Are there proper ARIA labels?
   - Is it screen reader friendly?

4. **Browser Compatibility**
   - Test in Chrome, Firefox, Safari
   - Test on mobile devices

### Automated Testing (Future)

When tests are implemented:

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Documentation

### When to Update Documentation

- Adding new features
- Changing existing functionality
- Adding new components
- Modifying configuration
- Updating dependencies

### What to Document

1. **Code Comments**
   - Complex algorithms
   - Non-obvious decisions
   - TODOs and FIXMEs

2. **Component Documentation**
   - Props description
   - Usage examples
   - Edge cases

3. **README Updates**
   - New features
   - Changed commands
   - Updated requirements

4. **API Documentation**
   - Endpoint changes
   - Request/response formats
   - Authentication

### Documentation Style

- Use clear, concise language
- Provide code examples
- Include screenshots for UI features
- Keep documentation up-to-date

## Questions?

- Check the [documentation](./docs/README.md)
- Ask in GitHub Discussions
- Open an issue for bugs or feature requests
- Contact the maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Model Client React! Your efforts help make this project better for everyone.
