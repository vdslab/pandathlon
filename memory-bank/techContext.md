# Technical Context

## Technology Stack

### Frontend

**Core Framework**

- **Next.js 16.0.0** - React framework with App Router
  - Server-side rendering (SSR)
  - Server components and client components
  - File-based routing
  - Server actions for mutations
  - Built-in optimization

**UI Library**

- **React 19.2.0** - UI component library
  - Hooks (useState, useEffect, etc.)
  - Client and server components
  - Concurrent features

**Styling**

- **Tailwind CSS 4.1.16** - Utility-first CSS framework
  - Configured via PostCSS
  - Custom design tokens
  - Responsive utilities
- **DaisyUI 5.3.9** - Tailwind component library
  - Pre-built UI components
  - Theme system
  - Semantic color classes

**Language**

- JavaScript/JSX (ES6+)
- No TypeScript (currently)

### Backend

**Primary Backend**

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & authorization
  - Real-time subscriptions
  - Storage (if needed)
  - Edge Functions

**Database**

- **PostgreSQL** (via Supabase)
  - Relational database
  - ACID compliance
  - JSON support
  - Full-text search capabilities

**Message Queue**

- **PGMQ** (PostgreSQL Message Queue)
  - PostgreSQL-based message queue
  - Schema: `pgmq_public`
  - Functions: `send()`, `pop()`
  - Queue name: `quiz_requests`

**Serverless Functions**

- **Supabase Edge Functions**
  - Deno runtime
  - TypeScript/JavaScript
  - Auto-scaling
  - Globally distributed

### Development Tools

**Package Manager**

- **npm** - Node package manager
  - Lockfile: package-lock.json
  - Scripts defined in package.json

**Linting**

- **ESLint** - JavaScript linter
  - Custom configuration (implicit)
  - Scripts: `npm run lint`, `npm run lint:fix`

**Version Control**

- **Git** - Source control
  - Repository: https://github.com/vdslab/pandathlon
  - .gitignore configured

**Development Server**

- **Next.js Dev Server** - `npm run dev`
  - Hot module replacement
  - Fast refresh
  - Error overlay

## Dependencies

### Production Dependencies (`dependencies`)

```json
{
  "@supabase/ssr": "^0.7.0", // Supabase SSR helpers
  "@tailwindcss/postcss": "^4.1.16", // Tailwind PostCSS plugin
  "daisyui": "^5.3.9", // DaisyUI components
  "next": "^16.0.0", // Next.js framework
  "react": "^19.2.0", // React library
  "react-dom": "^19.2.0", // React DOM
  "tailwindcss": "^4.1.16" // Tailwind CSS
}
```

### Development Dependencies (`devDependencies`)

```json
{
  "supabase": "^2.53.6" // Supabase CLI
}
```

### Edge Function Dependencies (Deno)

- `npm:@supabase/supabase-js@2` - Supabase client for Deno

## Development Setup

### Prerequisites

- Node.js (version compatible with React 19 and Next.js 16)
- npm (comes with Node.js)
- Supabase account and project
- Git

### Local Development

1. Clone repository
2. Navigate to `frontennd/` directory
3. Install dependencies: `npm install`
4. Configure Supabase:
   - Set up environment variables (likely `.env.local`)
   - Configure Supabase URL and anon key
5. Run development server: `npm run dev`
6. Access at http://localhost:3000 (default)

### Supabase Configuration

- **Config file**: `frontennd/supabase/config.toml`
- **Functions directory**: `frontennd/supabase/functions/`
- **Local Supabase**: Can run locally with Supabase CLI
- **Deployment**: Via Supabase CLI or dashboard

## Environment Configuration

### Required Environment Variables

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key for client-side
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for Edge Functions
- `NEXT_PUBLIC_SUPABASE_URL` - Public URL for client
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key for client

### Build Configuration

- **Next.js config**: Implicit (using defaults)
- **PostCSS config**: `postcss.config.mjs`
- **Tailwind config**: Implicit (using defaults + DaisyUI)

## API Integration

### Supabase Client Patterns

**Browser Client** (`utils/supabase/client.js`):

```javascript
import { createBrowserClient } from "@supabase/ssr";
// For client components
```

**Server Client** (`utils/supabase/server.js`):

```javascript
import { createServerClient } from "@supabase/ssr";
// For server components and actions
```

**Middleware Client** (`utils/supabase/middleware.js`):

```javascript
import { createServerClient } from "@supabase/ssr";
// For Next.js middleware
```

### Edge Function Invocation

```javascript
const supabase = createClient();
await supabase.functions.invoke("function-name", {
  body: { data },
});
```

### Database Operations

- Supabase client provides PostgreSQL query builder
- Server-side operations use service role key
- Client-side operations use anon key + RLS policies

## File Structure Conventions

### Directory Organization

```
frontennd/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.jsx      # Route pages
│   │   └── layout.jsx    # Layout components
│   ├── utils/            # Utility functions
│   │   └── supabase/     # Supabase client setup
│   └── middleware.js     # Next.js middleware
├── supabase/
│   ├── functions/        # Edge functions
│   └── config.toml       # Supabase config
├── package.json
└── postcss.config.mjs
```

### Naming Conventions

- **Components**: PascalCase (e.g., `RootLayout`, `MyQuizNewPage`)
- **Files**: kebab-case for directories, PascalCase for component files
- **Functions**: camelCase (e.g., `createQuiz`, `login`)
- **Routes**: Lowercase with hyphens (auto by Next.js structure)

## Browser Compatibility

- Modern browsers (ES6+ support)
- Next.js handles transpilation
- React 19 requires modern browser features

## Performance Considerations

### Next.js Optimizations

- Server components (reduced JS bundle)
- Automatic code splitting
- Image optimization (if using next/image)
- Static generation where possible

### Supabase Optimizations

- Connection pooling (built-in)
- CDN for Edge Functions
- Database indexes (should be configured)

### Tailwind Optimizations

- PurgeCSS built-in (removes unused CSS)
- Production build minification

## Development Workflow

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix linting issues

### Supabase Workflow

- Local development with Supabase CLI
- Function deployment: `supabase functions deploy <name>`
- Database migrations (if using)
- Environment variable management

## Technical Constraints

### Language Constraints

- **Japanese primary**: All UI text in Japanese
- Character encoding: UTF-8
- No i18n system currently implemented

### Authentication Constraints

- Supabase Auth required for user features
- Cookie-based sessions (HTTP-only)
- JWT tokens for API authorization

### Database Constraints

- PostgreSQL-specific features (PGMQ)
- Row Level Security (RLS) policies
- Connection limits (Supabase tier-dependent)

### Edge Function Constraints

- Deno runtime (not Node.js)
- npm packages via `npm:` specifier
- Execution time limits
- Memory limits

## Future Technical Considerations

### Planned Integrations

- **LLM API Integration** (TODO in dequeue function)
  - Expected: OpenAI, Anthropic, or similar
  - Quiz generation via prompts
  - Response parsing and validation

### Potential Upgrades

- TypeScript migration (currently pure JavaScript)
- State management library (if complexity grows)
- Testing framework (Jest, Vitest, Playwright)
- CI/CD pipeline
- Error tracking (Sentry, etc.)
- Analytics integration

### Scalability Paths

- Database read replicas
- Caching layer (Redis)
- CDN for static assets
- Horizontal scaling of Edge Functions
- Queue workers for dequeue processing
