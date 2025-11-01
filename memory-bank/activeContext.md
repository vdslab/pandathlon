# Active Context

## Current Work Focus

### Immediate Status

The project has established its core infrastructure and basic functionality:

- Frontend scaffolding is complete
- Authentication flow is implemented
- Quiz creation form is functional
- Queue-based processing infrastructure is in place
- **Primary gap**: LLM integration for quiz generation

### Active Task Area

The main TODO identified in the codebase is the LLM integration in the dequeue function:

```javascript
// TODO dataの内容からLLMにリクエストを行いresponseを取得する
```

Currently, the `dequeue-quiz-requests` function uses hardcoded mock data to demonstrate the flow.

## Recent Changes

### What's Been Built

1. **Quiz Creation Interface** (`/mypage/quizzes/new`)

   - Dynamic form for quiz parameters
   - User can add/remove result types
   - Form validation in place
   - Calls enqueue function on submit

2. **Queue Infrastructure**

   - PGMQ integration working
   - Enqueue function receives and queues requests
   - Dequeue function processes queue (with mock data)

3. **Data Model**

   - Database schema defined with proper relationships
   - Quiz → Elements → Scores → Results structure
   - Many-to-many relationship through quiz_element_score table

4. **Page Structure**
   - All major routes defined
   - Navigation and layout implemented
   - Japanese UI throughout

## Next Steps

### Immediate Priorities

1. **LLM Integration**

   - Select LLM provider (OpenAI, Anthropic, Google, etc.)
   - Design prompt template for quiz generation
   - Implement API call in dequeue function
   - Parse and validate LLM responses
   - Handle errors and edge cases

2. **Quiz Taking Flow**

   - Implement quiz display page (`/quizzes/[quizId]`)
   - Create question answering interface
   - Score calculation logic
   - Results display page (`/quizzes/[quizId]/results`)

3. **Quiz Browsing**

   - Implement hot/trending logic (`/quizzes/hot`)
   - Recent quizzes listing (`/quizzes/recent`)
   - Search/filter functionality
   - Pagination

4. **User Dashboard**
   - My quizzes listing (`/mypage/quizzes`)
   - Quiz status tracking (pending/ready)
   - Edit/delete functionality
   - Favorites management (`/mypage/favorite`)

## Active Decisions & Considerations

### LLM Integration Design

**Decision Needed**: Which LLM provider to use?

- Considerations:
  - Cost per quiz generation
  - Response quality for personality quizzes
  - Japanese language support
  - API reliability and rate limits
  - Response time

**Prompt Engineering**:

- Must generate questions that differentiate between user-defined types
- Need consistent scoring weights (-3 to +3)
- Should create nuanced, thoughtful questions
- Output must be structured (JSON) for parsing

### Data Consistency

**Pattern Observed**: The mock data in dequeue function shows expected structure:

```javascript
{
  quizzes: { title, description, scale_type, theme, created_by },
  quiz_elements: [{ question_text, type_weights: {} }],
  quiz_results: [{ base_type, modifier, description, strengths, etc. }]
}
```

This structure should be maintained when implementing LLM integration.

### Error Handling

**Current Gap**: Limited error handling in queue processing

- What if LLM call fails?
- How to handle malformed responses?
- Should failed requests be retried?
- How to notify users of failures?

### Authentication Flow

**Working Pattern**:

- Login uses server actions
- Quiz creation uses client-side function
- Both patterns work but inconsistent
- May want to standardize on one approach

## Important Patterns & Preferences

### Code Style Observations

1. **Client vs Server Components**

   - Quiz creation page is client component ("use client")
   - Login uses server actions
   - Choose based on interactivity needs

2. **Form Handling**

   - FormData API used consistently
   - Server actions for auth
   - Client functions for Supabase Edge Function calls

3. **State Management**

   - Local useState for form inputs
   - No global state currently needed
   - Supabase handles auth state globally

4. **Japanese-First**

   - All UI text in Japanese
   - Variable names in English
   - Comments can be English or Japanese

5. **DaisyUI Components**
   - Heavy use of DaisyUI classes
   - Drawer navigation pattern
   - Consistent button styling with `btn` variants

### Database Patterns

1. **IDs**: Implicit use of Supabase auto-generated IDs
2. **Timestamps**: Likely using Supabase automatic timestamps
3. **Foreign Keys**: Proper relationships defined
4. **RLS**: Policies needed for security (not visible in current code)

## Learnings & Project Insights

### Queue-Based Design Success

The decision to use PGMQ for quiz generation is sound:

- Prevents HTTP timeout issues
- Enables async LLM processing
- Scales well with demand
- User gets immediate feedback

### Mock Data Strategy

The hardcoded response in dequeue function is valuable:

- Demonstrates expected data structure
- Can be used for testing UI
- Provides template for LLM prompt design
- Shows example of quality output

### Database Schema Design

The separation of quiz_elements and quiz_element_score is elegant:

- Allows flexible scoring per result type
- Enables complex personality typing
- Makes score calculation straightforward
- Supports future analytics

### Areas Needing Attention

1. **Loading States**: No visible loading indicators when quiz is being generated
2. **Notifications**: No system to notify users when quiz is ready
3. **Error States**: Limited error handling and user feedback
4. **Validation**: Client-side validation exists, need server-side too
5. **Security**: RLS policies need review/implementation

## Current Code Locations

### Key Files to Understand

- **Quiz Form**: `frontennd/src/app/mypage/quizzes/new/page.jsx`
- **Enqueue**: `frontennd/supabase/functions/enqueue-quiz-requests/index.js`
- **Dequeue (needs LLM)**: `frontennd/supabase/functions/dequeue-quiz-requests/index.js`
- **Layout**: `frontennd/src/app/layout.jsx`
- **Supabase Clients**: `frontennd/src/utils/supabase/*.js`

### Unimplemented Pages (shells exist)

- `/quizzes/[quizId]` - Quiz taking interface
- `/quizzes/[quizId]/results` - Results display
- `/quizzes` - Main quiz browser
- `/quizzes/hot` - Trending quizzes
- `/quizzes/recent` - Recent quizzes
- `/mypage` - User dashboard
- `/mypage/quizzes/[quizId]` - User's quiz detail
- `/mypage/favorite` - Favorited quizzes

## Environment & Configuration

### Known Configuration

- Supabase project configured
- CORS headers in Edge Functions
- PostCSS with Tailwind setup
- DaisyUI theme system

### Unknown/To Verify

- Database RLS policies
- Environment variables setup
- Supabase storage configuration (if using)
- Rate limiting on Edge Functions
- Queue worker scheduling (dequeue trigger)

## Development Context

### Current State

- Development environment functional
- Can run `npm run dev` in `frontennd/` directory
- Edge Functions deployed to Supabase
- Database schema in place

### Next Session Starting Point

When resuming work, the logical next step is implementing the LLM integration:

1. Choose LLM provider
2. Design prompt template
3. Implement API call
4. Test with real quiz generation
5. Then move to implementing quiz-taking flow

This represents the critical path to a working MVP.
