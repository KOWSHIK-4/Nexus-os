# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (React)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Dashboard│ │ Projects │ │  Kanban  │ │   Chat   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │           TanStack Query + Zustand               │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/WebSocket
┌──────────────────────▼──────────────────────────────────┐
│              API Gateway (Express)                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ │
│  │  Auth  │ │Project │ │  Task  │ │  Chat  │ │  AI  │ │
│  └────────┘ └────────┘ └────────┘ └────────┘ └──────┘ │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ Middle │ │  Rate  │ │  CORS  │ │  JWT   │          │
│  │  ware  │ │  Limit │ │        │ │ Verify │          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
└──────┬──────────────────────────┬───────────────────────┘
       │                         │
┌──────▼──────────┐   ┌─────────▼──────────┐
│   PostgreSQL    │   │   Redis (Cache)     │
│     (Prisma)    │   │  + Socket.IO        │
└─────────────────┘   └────────────────────┘
```

## Data Flow

1. **Client** sends HTTP request or WebSocket message
2. **API Gateway** (Express) applies middleware (auth, rate limiting, CORS)
3. **Router** directs to appropriate controller
4. **Controller** processes request, validates input (Zod)
5. **Service Layer** handles business logic
6. **Prisma ORM** interacts with PostgreSQL
7. **Response** flows back through middleware chain
8. **Socket.IO** pushes real-time updates to connected clients

## Key Design Decisions

### Frontend
- **Component architecture**: Atomic design with reusable Shadcn UI primitives
- **State management**: Zustand for UI state, TanStack Query for server state
- **Routing**: React Router v6 with lazy loading for code splitting
- **Styling**: Tailwind CSS with CSS variables for theming
- **Animations**: Framer Motion for smooth transitions

### Backend
- **Modular routing**: Each feature has its own router file
- **Middleware chain**: Auth, validation, rate limiting, error handling
- **Prisma ORM**: Type-safe database queries with auto-generated types
- **JWT auth**: Access + refresh token pattern with HTTP-only cookies
- **Socket.IO**: Real-time bidirectional communication

### Database
- **PostgreSQL**: Relational data with JSON support for flexible fields
- **Prisma migrations**: Version-controlled schema changes
- **Indexed fields**: Optimized for common query patterns

## Security Architecture

- **Authentication**: JWT access tokens (15min) + refresh tokens (7 days)
- **Authorization**: Role-based access (SUPER_ADMIN, ADMIN, MEMBER, VIEWER)
- **Data protection**: Helmet headers, rate limiting, input validation
- **Session management**: Secure HTTP-only cookies, token rotation
- **Audit logging**: Track all sensitive operations

## Scaling Considerations

- **Horizontal scaling**: Stateless API server design
- **Database indexing**: Optimized queries for common access patterns
- **Caching**: Redis layer for rate limiting and session cache
- **CDN**: Static assets served via CDN in production
- **Code splitting**: Lazy-loaded routes for optimal bundle size
