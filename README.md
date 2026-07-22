# Nexus OS

## AI-Powered Digital Workspace

Nexus OS is a world-class, production-ready SaaS application that combines the best features of Notion, Trello, Jira, Linear, Slack, Google Drive, GitHub, ChatGPT, and Microsoft Teams into a single, unified AI-powered digital workspace.

## Tech Stack

### Frontend
- **React 19** — Latest React with concurrent features
- **TypeScript** — Type-safe development
- **Vite** — Lightning-fast build tool
- **Tailwind CSS** — Utility-first styling
- **Shadcn UI** — Beautiful, reusable components
- **React Router** — Declarative routing
- **TanStack Query** — Server state management
- **Zustand** — Lightweight client state
- **Framer Motion** — Smooth animations
- **Recharts** — Composable charts
- **React Hook Form + Zod** — Form validation

### Backend
- **Node.js + Express.js** — Scalable API server
- **PostgreSQL** — Reliable relational database
- **Prisma** — Type-safe ORM
- **JWT + Refresh Tokens** — Secure authentication
- **Socket.IO** — Real-time communication
- **Helmet + Rate Limiting** — Security-first

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+ (optional)

### Installation

```bash
git clone https://github.com/KOWSHIK-4/Nexus-os.git
cd Nexus-os

cp .env.example .env
# Edit .env with your database credentials

cd server && npm install
npx prisma generate
npx prisma db push
cd ../client && npm install
cd ..

npm run dev
```

### Docker Deployment

```bash
docker compose -f docker/docker-compose.yml up -d
```

## Project Structure

```
NexusOS/
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── layouts/    # Layout components
│   │   ├── stores/     # Zustand stores
│   │   ├── services/   # API services
│   │   ├── hooks/      # Custom hooks
│   │   └── lib/        # Utilities
│   └── public/         # Static assets
├── server/             # Express backend
│   ├── src/
│   │   ├── config/     # Configuration
│   │   ├── controllers/# Route handlers
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── sockets/    # WebSocket handlers
├── prisma/             # Database schema
├── shared/             # Shared types
├── docker/             # Docker configuration
└── .github/            # CI/CD workflows
```

## Features

- **Dashboard** — Centralized workspace overview with analytics
- **Project Management** — Full project lifecycle management
- **Kanban Board** — Visual workflow management
- **Task Management** — Advanced task tracking with priorities
- **Calendar** — Schedule and deadline management
- **Notes** — Rich text note-taking
- **Documents** — Collaborative documentation
- **File Manager** — Cloud file storage and management
- **Team Collaboration** — Real-time team workspace
- **Chat** — Real-time messaging with channels
- **Notifications** — Smart notification system
- **Analytics** — Comprehensive workspace analytics
- **Reports** — Automated report generation
- **AI Assistant** — AI-powered productivity tools
- **Admin Dashboard** — System administration
- **Global Search** — Unified search across all entities
- **Role-Based Access** — Granular permission control

## AI Capabilities

- AI Chat Assistant
- Task Generator
- Meeting Summarizer
- Code Review Assistant
- Documentation Generator
- Email Composer
- Project Planner
- Knowledge Assistant

## Security

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Helmet security headers
- Rate limiting
- Input validation with Zod
- Password hashing with bcryptjs
- Secure HTTP-only cookies
- CORS configuration
- Audit logging

## License

MIT License — see LICENSE for details.

## Contributing

See CONTRIBUTING.md for contribution guidelines.
