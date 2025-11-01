# System Patterns

## Architecture Overview

### High-Level Structure

```
Frontend (Next.js App) ←→ Supabase (Backend Services)
                            ├── Authentication
                            ├── Database (PostgreSQL)
                            ├── Edge Functions
                            └── PGMQ (Message Queue)
```

### Key Components

1. **Next.js Frontend** (`frontennd/`)

   - React 19 with Next.js 16 (App Router)
   - Server and client components
   - Server actions for form handling

2. **Supabase Backend**

   - Authentication & user management
   - PostgreSQL database
   - Edge Functions (Deno runtime)
   - PGMQ for async job processing

3. **Queue-Based Processing**
   - Quiz generation is asynchronous
   - Uses PostgreSQL Message Queue (PGMQ)
   - Decoupled enqueue/dequeue operations

## Core Patterns

### 1. Queue-Based Quiz Generation

**Pattern**: Producer-Consumer with Message Queue

**Flow**:

```
User Request → enqueue-quiz-requests → PGMQ Queue → dequeue-quiz-requests → Database
```

**Components**:

- **Producer** (`enqueue-quiz-requests`):

  - Validates user authentication
  - Queues quiz creation request with user parameters
  - Returns immediately (non-blocking)

- **Consumer** (`dequeue-quiz-requests`):
  - Polls queue for new requests
  - Processes quiz generation (currently with hardcoded data, TODO: LLM integration)
  - Stores results in database tables

**Benefits**:

- Non-blocking user experience
- Handles spike in requests
- Allows time-intensive LLM processing
- Scalable processing

### 2. Authentication Pattern

**Supabase SSR Integration**:

- Uses `@supabase/ssr` for server-side auth
- Three client types:
  - Browser client (`utils/supabase/client.js`) - for client components
  - Server client (`utils/supabase/server.js`) - for server components/actions
  - Middleware client (`utils/supabase/middleware.js`) - for request interception

**Token Flow**:

```
Browser → Auth Request → Supabase → JWT Token → Stored in Cookies → Auto-refresh
```

### 3. Data Model

**Core Entities**:

```
users (Supabase Auth)
  ↓
quizzes
  ├── quiz_elements (questions)
  │     └── quiz_element_score (weights per result type)
  └── quiz_results (personality types)
```

**Relationships**:

- Quiz → Creator (user_id/creator_id)
- Quiz → Multiple Elements (questions)
- Quiz → Multiple Results (personality types)
- Element × Result → Score weight (many-to-many)

### 4. Component Organization

**Next.js App Router Structure**:

```
app/
├── page.jsx              # Root/home
├── layout.jsx            # Global layout with navigation
├── login/                # Auth pages
│   ├── page.jsx
│   └── actions.js        # Server actions
├── mypage/               # User dashboard
│   ├── page.jsx
│   ├── favorite/
│   └── quizzes/
│       ├── [quizId]/     # Dynamic route
│       └── new/          # Quiz creation
├── quizzes/              # Public quiz browsing
│   ├── page.jsx
│   ├── [quizId]/
│   │   ├── page.jsx      # Quiz taking
│   │   └── results/      # Results display
│   ├── hot/              # Trending
│   └── recent/           # Latest
└── private/              # Protected route example
```

**Pattern**: Feature-based routing with nested layouts

### 5. Form Handling Pattern

**Server Actions** (used in login):

```javascript
// actions.js - server-side
export async function login(formData) {
  // Server-side validation & processing
  // Direct Supabase interaction
  // Redirect on success
}

// page.jsx - client presentation
<form action={login}>{/* Form fields */}</form>;
```

**Client-Side Handling** (used in quiz creation):

```javascript
// page.jsx - client component
async function createQuiz(formData) {
  // Client-side processing
  // Call Supabase function
  // Update UI state
}

<form action={createQuiz}>{/* Form fields */}</form>;
```

### 6. Styling Pattern

**Tech Stack**: Tailwind CSS + DaisyUI

- Utility-first CSS with Tailwind
- Pre-built components from DaisyUI
- Consistent design system through DaisyUI themes

**Usage Pattern**:

```jsx
<button className="btn btn-accent">
  {/* DaisyUI component classes */}
</button>

<div className="drawer">
  {/* DaisyUI drawer component */}
</div>
```

## Critical Paths

### Quiz Creation Path

1. User fills form (`/mypage/quizzes/new`)
2. Client calls `createQuiz()` function
3. Function invokes `enqueue-quiz-requests` Edge Function
4. Edge Function authenticates user from JWT
5. Request added to PGMQ `quiz_requests` queue
6. User receives immediate confirmation
7. Background: `dequeue-quiz-requests` processes queue
8. Background: Quiz data inserted into database tables
9. Quiz appears in user's mypage (when ready)

### Authentication Path

1. User submits login form
2. Server action processes credentials
3. Supabase validates and returns JWT
4. JWT stored in HTTP-only cookies
5. Middleware validates token on protected routes
6. Auto-refresh handles token expiration

## Design Decisions

### 1. Why Queue-Based Processing?

- LLM quiz generation takes time (seconds to minutes)
- Prevents timeout on HTTP requests
- Better user experience (submit and check later)
- Scalable under load
- Allows retry logic for failures

### 2. Why Edge Functions?

- Serverless execution (auto-scaling)
- Close to database (low latency)
- Deno runtime (modern, secure)
- Integrated with Supabase auth

### 3. Why Next.js App Router?

- Server components reduce client JavaScript
- Built-in layouts and nested routing
- Server actions eliminate API routes for mutations
- Better SEO with server rendering

### 4. Why Separate Enqueue/Dequeue?

- Separation of concerns
- Different scaling requirements
- Dequeue can be scheduled/triggered differently
- Independent deployment and monitoring

## Component Relationships

### State Management

- **Client State**: React `useState` for form inputs
- **Server State**: Supabase database
- **Auth State**: Supabase Auth (global)
- **No global state library** (Redux, Zustand) currently used

### Data Flow

```
User Input → Form State → Server Action/Function → Supabase → Database
                                                             ↓
                                                        UI Update
```

## Integration Points

1. **Frontend ↔ Supabase Auth**

   - Cookie-based sessions
   - Client SDK for auth operations
   - Middleware for route protection

2. **Frontend ↔ Edge Functions**

   - Direct function invocation via Supabase client
   - JSON request/response
   - Bearer token authentication

3. **Edge Functions ↔ Database**

   - Supabase client with service role key
   - Direct PostgreSQL access
   - PGMQ schema for message queue

4. **Edge Functions ↔ Future LLM API**
   - TODO: Integration point for quiz generation
   - Expected: REST API call to LLM service
   - Transforms user params to LLM prompt
   - Processes LLM response to database schema
