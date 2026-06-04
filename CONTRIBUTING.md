# Contributing to EimemesChat AI

Thank you for your interest in contributing to **EimemesChat AI**! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

---

## Code of Conduct

Be respectful, inclusive, and professional in all interactions. We're committed to providing a welcoming and inspiring community for all.

---

## How to Contribute

### Types of Contributions

- **Bug Reports**: Report issues you've encountered
- **Feature Requests**: Suggest new features or improvements
- **Code Fixes**: Submit pull requests to fix bugs
- **Documentation**: Improve README, comments, or guides
- **Performance**: Optimize code and reduce bundle size

---

## Development Setup

### Prerequisites

- **Node.js**: 18 or higher
- **npm**: 9 or higher
- **Git**: Latest version
- **Firebase Account**: For local development
- **Groq API Key**: [Get it here](https://console.groq.com)

### Local Installation

1. **Fork the repository**
   ```bash
   # Navigate to https://github.com/michaelkilong/EimemesChat-React
   # Click "Fork" in the top right
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/EimemesChat-React.git
   cd EimemesChat-React
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/michaelkilong/EimemesChat-React.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local with your credentials
   nano .env.local
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

---

## Commit Guidelines

### Branch Naming

Use descriptive branch names following this pattern:

```
feature/short-description
bugfix/short-description
docs/short-description
refactor/short-description
```

**Examples:**
- `feature/voice-input-support`
- `bugfix/firestore-sync-issue`
- `docs/api-endpoint-guide`
- `refactor/component-hooks`

### Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, etc.

**Examples:**
```bash
git commit -m "feat(chat): add voice input support"
git commit -m "fix(firestore): resolve sync timeout issue"
git commit -m "docs: add API endpoint documentation"
```

---

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest changes
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test your changes**
   ```bash
   npm run build
   npm run preview
   ```

3. **Check for console errors** and lint issues

### Submitting a PR

1. **Push to your fork**
   ```bash
   git push origin your-branch-name
   ```

2. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch as the source
   - Fill in the PR template with:
     - **Description**: What changes you made
     - **Motivation**: Why this change is needed
     - **Testing**: How you tested it
     - **Related Issues**: Link any related issues (e.g., `Fixes #123`)

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of the changes.
   
   ## Related Issues
   Fixes #(issue number)
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement
   
   ## Testing
   Describe how you tested these changes.
   
   ## Screenshots (if applicable)
   Add screenshots for UI changes.
   ```

### PR Requirements

- ✅ TypeScript types are properly defined
- ✅ No console errors or warnings
- ✅ Follows code style guidelines
- ✅ Commit messages are clear and descriptive
- ✅ Documentation is updated if needed

---

## Code Style

### TypeScript Best Practices

- Use strict TypeScript settings (`tsconfig.json`)
- Define types for all function parameters
- Avoid `any` type; use specific types instead
- Use interfaces for object structures

**Example:**
```typescript
interface ChatMessage {
  id: string;
  content: string;
  timestamp: number;
  role: 'user' | 'assistant';
}

function processMessage(msg: ChatMessage): void {
  // implementation
}
```

### React Best Practices

- Use functional components with hooks
- Extract reusable components
- Use meaningful component names
- Props should be typed with interfaces

**Example:**
```typescript
interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  // component logic
}
```

### File Organization

```
src/
├── components/      # React components
│   ├── Chat/
│   ├── Sidebar/
│   └── Settings/
├── hooks/           # Custom React hooks
├── context/         # Context providers
├── lib/             # Utility functions
├── types.ts         # TypeScript type definitions
└── styles/          # Global styles
```

### Naming Conventions

- **Components**: PascalCase (e.g., `ChatMessage.tsx`)
- **Functions/Variables**: camelCase (e.g., `formatMessage()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_MESSAGE_LENGTH`)
- **Interfaces**: PascalCase with `I` prefix (e.g., `IChatState`)

### CSS/Tailwind

- Use Tailwind CSS classes for styling
- Keep custom CSS minimal in `styles/`
- Use semantic color and spacing scales

---

## Reporting Bugs

### Before Reporting

1. Check if the bug already exists in [Issues](https://github.com/michaelkilong/EimemesChat-React/issues)
2. Try reproducing with latest code
3. Collect relevant information:
   - Browser and version
   - OS and version
   - Steps to reproduce
   - Expected vs actual behavior

### Bug Report Template

```markdown
## Description
Brief description of the bug.

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: [e.g., Ubuntu 20.04, macOS 12]
- Browser: [e.g., Chrome 120, Safari 17]
- Node version: [e.g., 18.16.0]

## Screenshots
Attach any relevant screenshots.

## Additional Context
Any other context about the problem.
```

---

## Suggesting Enhancements

### Enhancement Request Template

```markdown
## Description
Describe the enhancement you're suggesting.

## Motivation
Explain why this feature would be useful.

## Proposed Solution
Describe how you envision this working.

## Alternatives
Describe alternative solutions or features you've considered.

## Additional Context
Any other context about the enhancement.
```

---

## Questions or Need Help?

- **Documentation**: Check the [README.md](README.md)
- **Issues**: Search existing [GitHub Issues](https://github.com/michaelkilong/EimemesChat-React/issues)
- **Contact**: Reach out to [@michaelkilong](https://github.com/michaelkilong)

---

## License

By contributing to this project, you agree that your contributions will be licensed under its MIT License.

---

**Thank you for contributing! 🎉**

We appreciate your efforts in making EimemesChat AI better for everyone.
