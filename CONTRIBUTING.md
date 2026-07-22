# Contributing to Nexus OS

## Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Standards

- TypeScript strict mode enabled
- ESLint + Prettier for consistent formatting
- Follow existing code patterns and conventions
- Write meaningful commit messages
- Keep PRs focused and concise

## Development Setup

```bash
git clone https://github.com/KOWSHIK-4/Nexus-os.git
cd Nexus-os
cp .env.example .env
cd server && npm install && npx prisma generate && npx prisma db push
cd ../client && npm install
cd .. && npm run dev
```

## Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tested locally
- [ ] Updated documentation if needed
- [ ] Added meaningful commit messages

## Commit Convention

- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code refactoring
- `docs:` — Documentation
- `style:` — Formatting
- `test:` — Tests
- `chore:` — Maintenance
