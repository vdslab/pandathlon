# Active Context

## Current Work Focus

### Immediate Status

**Latest Update (2025/11/02)**: Results page URL structure improved and SNS metadata enhanced. Changed from query parameters (`?answerId=123`) to path parameters (`/results/[resultId]`) for cleaner URLs. Enriched OGP/Twitter Card metadata to include actual quiz result information (result type title and content) for better SNS sharing previews.

**Previous Update (2025/11/02)**: Queue processing error handling improved. Fixed critical issue where PGMQ messages were deleted immediately on read, causing data loss on errors. Implemented proper read-archive pattern with quiz_requests_id tracking for reliable queue management and error recovery.

**Previous Update (2025/11/02)**: PWA manifest integration completed. Added manifest.json and icon files to frontend/public, integrated into layout.jsx using Next.js Metadata API for Progressive Web App capabilities.

**Previous Update (2025/11/02)**: Mypage functionality enhancement completed. Implemented user's created quiz management, pending quiz tracking via quiz_requests table, quiz edit page with publish toggle, and improved navigation/homepage.

The project has achieved significant progress with most core features implemented:

- Frontend scaffolding is complete
- Authentication flow is fully implemented with separated signup/login pages
- Quiz creation form is functional
- Queue-based processing infrastructure is in place
- **Quiz taking flow is fully implemented** (NEW)
- **Quiz results display with SNS sharing** (NEW)
- **Hot/Recent quiz discovery pages** (NEW)
- **User quiz history tracking** (NEW)
- **Bookmark/Favorite functionality** (NEW)
- **Shared quiz display components** (NEW)
- Dynamic navigation with all quiz-related features
- **Primary remaining gap**: LLM integration for quiz generation

### Active Task Area

The main TODO identified in the codebase is the LLM integration in the dequeue function:

```javascript
// TODO dataの内容からLLMにリクエストを行いresponseを取得する
```

Currently, the `dequeue-quiz-requests` function uses hardcoded mock data to demonstrate the flow. All other user-facing features are complete and ready for LLM integration.

## Recent Changes

### What's Been Built

1. **Authentication System** (Recently Improved)

   - Separated signup page (`/signup`) from login page (`/login`)
   - Login page: Email/password only, link to signup
   - Signup page: Email/password/nickname, link to login
   - Logout functionality in `login/actions.js`
   - Dynamic navigation: shows login button when logged out, logout button when logged in
   - Layout.jsx now async server component that checks auth state

2. **Quiz Creation Interface** (`/mypage/quizzes/new`)

   - Dynamic form for quiz parameters
   - User can add/remove result types
   - Form validation in place
   - Calls enqueue function on submit

3. **Queue Infrastructure**

   - PGMQ integration working
   - Enqueue function receives and queues requests
   - Dequeue function processes queue (with mock data)

4. **Data Model**

   - Database schema defined with proper relationships
   - Quiz → Elements → Scores → Results structure
   - Many-to-many relationship through quiz_element_score table

5. **Page Structure**

   - All major routes defined
   - Navigation and layout implemented with auth state awareness
   - Japanese UI throughout

6. **Quiz Taking System** (NEWLY IMPLEMENTED)

   - Quiz display page (`/quizzes/[quizId]`)
     - Fetches quiz and questions from database
     - 7-point scale (-3 to +3) for answers
     - Progress bar showing completion percentage
     - Question-by-question navigation
     - Server action for answer submission
   - Quiz results page (`/quizzes/[quizId]/results`)
     - Score calculation based on weighted responses
     - Displays winning result type
     - SNS sharing (X/Twitter)
     - URL copy functionality (Client Component)
     - OGP metadata for social sharing
   - Server action pattern for form submission
     - `actions.js` handles answer submission
     - Records user_id if logged in, null otherwise
     - Inserts to `answers` and `answer_details` tables

7. **Quiz Discovery Pages** (NEWLY IMPLEMENTED)

   - Hot quizzes page (`/quizzes/hot`)
     - Ranks by answer count from `answers` table
     - Shows top 50 most answered quizzes
   - Recent quizzes page (`/quizzes/recent`)
     - Orders by latest answer timestamp
     - Shows recently answered quizzes
   - All quizzes page (`/quizzes`)
     - Lists all published quizzes
     - Shows answer counts and creation dates
     - Quick links to hot/recent pages

8. **User Quiz History** (NEWLY IMPLEMENTED)

   - History page (`/mypage/history`)
     - Login required
     - Lists all quizzes user has taken
     - Links to view results or retake quiz
     - Shows answer timestamps

9. **Enhanced Navigation**

   - Sidebar menu with categorized links
   - Quiz discovery section (all/hot/recent)
   - User section (dashboard/create/history/favorites)
   - Account section (login/logout)
   - Auth-aware display

10. **Improved Home Page**

    - Hero section with CTA
    - Feature showcase cards
    - Quick links to hot/recent quizzes
    - Featured quizzes display
    - User-specific quick actions

11. **Bookmark/Favorite System** (NEWLY IMPLEMENTED)

    - Server actions for bookmark management (`/app/components/bookmarkActions.js`)
      - `toggleBookmark()` - Add/remove bookmarks
      - `getBookmarkStatus()` - Check bookmark state
      - `getUserBookmarks()` - Get user's bookmarked quiz IDs
    - BookmarkButton component (`/app/components/BookmarkButton.jsx`)
      - Client component with optimistic updates
      - Heart icon (filled when bookmarked)
      - useTransition for smooth UX
      - Variants: "icon" or "button"
    - Favorite page (`/mypage/favorite`)
      - Lists user's bookmarked quizzes
      - Sorted by bookmark date (descending)
      - Uses QuizCard component
    - Quiz detail page bookmark button
      - Shows in quiz title area
      - Only visible to logged-in users
      - Integrated with quiz taking flow

12. **Shared Quiz Display Components** (NEWLY IMPLEMENTED)

    - QuizCard component (`/app/components/QuizCard.jsx`)
      - Server component for quiz display
      - Reusable across all quiz list pages
      - Integrated bookmark button
      - Flexible additional info display
      - Props: quiz, showBookmark, additionalInfo, href, actions
    - Applied to all quiz listing pages:
      - `/quizzes` - All quizzes with answer counts and dates
      - `/quizzes/hot` - Hot quizzes with rankings
      - `/quizzes/recent` - Recent quizzes with latest answer times
      - `/mypage/favorite` - Favorite quizzes with bookmark dates
    - Benefits:
      - Consistent UI across all quiz lists
      - Bookmark functionality everywhere
      - Easier maintenance
      - Type-safe quiz display

13. **User Dashboard Portal** (NEWLY IMPLEMENTED - 2025/11/02)

    - Dashboard page (`/mypage`)
      - Server component with authentication check
      - User information display (nickname from user_metadata, email)
      - Three statistics cards using DaisyUI stats component:
        - Created quizzes count (from quizzes table)
        - Taken quizzes count (from answers table)
        - Bookmarks count (from bookmarks table)
      - Four quick access cards with hover effects:
        - Create new quiz → `/mypage/quizzes/new`
        - Quiz history → `/mypage/history`
        - Favorites → `/mypage/favorite`
        - Browse quizzes → `/quizzes`
      - Recent activity section (2 columns):
        - Recent answers (latest 3 with links to results)
        - Recent bookmarks (latest 3 with links to quizzes)
      - Responsive grid layout (1 col mobile, 2 col tablet, 3/4 cols desktop)
      - Hover scale effect on quick access cards
      - "View all" links for recent activity sections

14. **Authentication Middleware Fix** (2025/11/02)

    - Fixed overly restrictive middleware that was redirecting all unauthenticated users to `/login`
    - Modified `utils/supabase/middleware.js` to only protect `/mypage/*` routes
    - Public routes now accessible without authentication:
      - `/` - Home page
      - `/signup` - User registration
      - `/quizzes/*` - All quiz browsing and taking pages
    - Protected routes (require authentication):
      - `/mypage/*` - All user-specific pages
    - Implementation: Simple path check `request.nextUrl.pathname.startsWith("/mypage")`
    - Allows anonymous users to browse and take quizzes
    - Only redirects to login when accessing personal user data

15. **Database Schema Migration - user_answers Separation** (2025/11/02)

    - Separated `user_id` from `answers` table into new `user_answers` junction table
    - **Purpose**:
      - Enable public viewing of all quiz results (answers table)
      - Protect logged-in users' personal quiz history (user_answers table)
      - Support anonymous quiz taking (answers without user linkage)
    - **Schema Changes**:
      - `answers` table: Removed `user_id` column
      - `user_answers` table: New table with `answer_id`, `user_id`, `created_at`
    - **Frontend Adaptations**:
      1. `/quizzes/[quizId]/actions.js` - Answer submission:
         - Inserts to `answers` table without `user_id`
         - If user logged in, additionally inserts to `user_answers` to link answer to user
         - Continues to redirect even if user_answers insert fails (answer already saved)
      2. `/mypage/history/page.jsx` - User quiz history:
         - Changed from direct `answers` query to `user_answers` join
         - Uses `user_answers.answer_id → answers → quizzes` relationship
         - Transforms data structure to maintain UI compatibility
      3. `/mypage/page.jsx` - User dashboard statistics:
         - Changed "Taken quizzes count" to query `user_answers` table
         - Changed "Recent answers" to query through `user_answers` with joins
         - Maintains same data structure through transformation
    - **Benefits**:
      - Anonymous users can take quizzes and view any results
      - Logged-in users have protected history in `/mypage/history`
      - Quiz result pages remain publicly accessible via answerId
      - Separation of concerns: public data vs. user-specific data

16. **Mypage Functionality Enhancement** (NEWLY COMPLETED - 2025/11/02)

    - **Login Redirect Update**:

      - `login/actions.js` now redirects to `/mypage` instead of `/` after successful login

    - **Quiz Requests Table Integration**:

      - Modified `enqueue-quiz-requests` function to save requests to both PGMQ and `quiz_requests` table
      - Modified `dequeue-quiz-requests` function to delete from `quiz_requests` table after processing
      - Enables UI display of pending quizzes

    - **User's Created Quizzes Page** (`/mypage/quizzes`):

      - New page listing all user's quizzes
      - Displays pending quizzes (from quiz_requests table) with processing status
      - Displays completed quizzes with published/unpublished badges
      - Shows statistics: answer count, creation date
      - Links to edit page and preview (for published quizzes)

    - **Quiz Edit Page** (`/mypage/quizzes/[quizId]`):

      - New edit page for managing individual quizzes
      - Displays quiz information and statistics (questions, result types, answers, bookmarks)
      - PublishedToggle component for managing quiz visibility
      - Breadcrumb navigation
      - Security: creator_id validation ensures users can only edit their own quizzes
      - Links to preview published quizzes in new tab

    - **Publish Toggle Feature**:

      - `PublishedToggle.jsx`: Client component with optimistic UI updates
      - `actions.js`: Server action for updating published status
      - Uses useTransition for smooth UX
      - Instant feedback with loading spinner
      - Error handling with state reversion

    - **Dashboard Updates** (`/mypage`):

      - Added pending quizzes alert when quiz_requests exist
      - Added "Processing Quizzes" section showing latest 3 pending quizzes
      - Each pending quiz card shows title, question count, result types, creation time
      - Links to full quiz list for details

    - **Navigation Enhancement**:

      - Added "作成した診断" (Created Quizzes) link to sidebar menu
      - Placed between "診断を作る" and "診断履歴"

    - **Homepage Improvement** (`/`):

      - Removed redundant "マイページ" section
      - Added conditional link card:
        - Logged in users: Link to マイページダッシュボード (green gradient)
        - Not logged in: Link to ログイン page (purple/pink gradient)
      - Improved user flow and visual hierarchy

17. **PWA Manifest Integration** (NEWLY COMPLETED - 2025/11/02)

    - **Manifest File** (`frontennd/public/manifest.json`):

      - Name: "カスタム診断メーカー"
      - Short name: "カス診断"
      - Description: "あなただけの性格診断を作成・共有しよう"
      - Theme color: #000000 (black)
      - Background color: #ffffff (white)
      - Display: standalone (for app-like experience)
      - 14 icon sizes included (48x48 to 512x512)

    - **Icon Files** (`frontennd/public/icons/`):

      - Comprehensive icon set for all devices and platforms
      - Sizes: 48, 70, 72, 76, 96, 120, 144, 150, 152, 167, 180, 192, 310, 512
      - PNG format for universal compatibility
      - Optimized for PWA installation

    - **Layout Metadata Integration** (`frontennd/src/app/layout.jsx`):

      - Added Next.js Metadata API configuration
      - manifest.json link
      - Favicon references (192x192, 512x512)
      - Apple touch icons (180x180, 152x152, 120x120)
      - Theme color meta tag
      - Apple Web App configuration

    - **Benefits**:
      - PWA installability on all platforms
      - App-like experience when installed
      - Proper icons on home screen and app switcher
      - Theme color in mobile browser address bar
      - Better user experience and engagement

18. **Queue Processing Error Handling** (NEWLY COMPLETED - 2025/11/02)

    - **Problem Identified**:

      - Previous implementation used PGMQ `pop` which immediately deleted messages
      - If processing failed after message was popped, the request was lost forever
      - No way to retry failed quiz generation requests
      - quiz_requests table deletion used ambiguous criteria (creator_id + title)

    - **enqueue-quiz-requests improvements**:

      - Now inserts to quiz_requests table FIRST to get auto-generated ID
      - Includes quiz_requests_id in PGMQ message payload
      - Returns 500 error if quiz_requests insert fails
      - Ensures every queued message has a corresponding database record

    - **dequeue-quiz-requests improvements**:

      - Changed from `pop` to `read` (non-destructive message retrieval)
      - Parameters: vt=30 (visibility timeout), qty=1 (one message at a time)
      - Added empty queue check - returns success if no messages available
      - Wrapped all processing in try-catch block
      - On success:
        - Deletes quiz_requests record by ID (precise deletion)
        - Archives PGMQ message (removes from queue)
        - Returns quiz_id in response
      - On error:
        - Message remains in queue
        - Automatically becomes available after visibility timeout (30s)
        - Enables automatic retry without manual intervention

    - **Benefits**:

      - **Data integrity**: No data loss on processing errors
      - **Automatic retry**: Failed requests retry after timeout
      - **Precise tracking**: quiz_requests_id enables exact record matching
      - **Graceful degradation**: Empty queue doesn't cause errors
      - **Better debugging**: Detailed error logs at each step
      - **Idempotency ready**: Foundation for preventing duplicate processing

    - **Error Recovery Flow**:

      ```
      1. Message read from queue (30s visibility timeout)
      2. Processing begins
      3a. Success path:
          - All DB operations complete
          - quiz_requests deleted by ID
          - Message archived from PGMQ
      3b. Error path:
          - Error caught and logged
          - Message stays in queue
          - After 30s, message visible again
          - Automatic retry on next dequeue
      ```

    - **Implementation Details**:
      - Uses PGMQ `read` RPC function instead of `pop`
      - Uses PGMQ `archive` RPC function for successful completion
      - Visibility timeout prevents concurrent processing of same message
      - Comprehensive logging for monitoring and debugging

## Next Steps

### Immediate Priorities

1. **LLM Integration** (PRIMARY REMAINING TASK)

   - Select LLM provider (OpenAI, Anthropic, Google, etc.)
   - Design prompt template for quiz generation
   - Implement API call in dequeue function
   - Parse and validate LLM responses
   - Handle errors and edge cases

2. **User Dashboard Completion**

   - My quizzes listing (`/mypage/quizzes`)
   - Quiz status tracking (pending/ready)
   - Edit/delete functionality
   - Dashboard overview page (`/mypage`)

3. **Additional Features**
   - Search/filter functionality for quizzes
   - Pagination for quiz lists
   - Quiz categories/tags
   - User profiles and stats

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

**Improved Pattern**:

- Separate pages for login (`/login`) and signup (`/signup`)
- Both use server actions for auth operations
- Logout functionality implemented as server action
- Navigation dynamically shows login/logout based on auth state
- Quiz creation uses client-side function
- Layout is async server component that checks auth state

### Bookmark/Favorite Pattern

**Implementation Design**:

- Server actions for all database operations
- Client component for UI interactions
- Optimistic updates with useTransition
- Revalidates paths after bookmark changes
- Uses existing `bookmarks` table (quiz_id, user_id, created_at)
- All Supabase operations use JavaScript API (no raw SQL)

### Component Reusability Pattern

**QuizCard Component**:

- Server component that can be used anywhere
- Accepts flexible props for different contexts
- Automatically fetches bookmark status
- Supports custom additional info (rank, dates, counts)
- Maintains consistent UI across all quiz lists

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

- **Authentication**:
  - Login page: `frontennd/src/app/login/page.jsx`
  - Login actions: `frontennd/src/app/login/actions.js` (login, logout)
  - Signup page: `frontennd/src/app/signup/page.jsx`
  - Signup actions: `frontennd/src/app/signup/actions.js`
- **Quiz Creation**:
  - Creation form: `frontennd/src/app/mypage/quizzes/new/page.jsx`
  - Enqueue function: `frontennd/supabase/functions/enqueue-quiz-requests/index.js`
  - Dequeue function (needs LLM): `frontennd/supabase/functions/dequeue-quiz-requests/index.js`
- **Quiz Taking** (NEW):
  - Quiz page: `frontennd/src/app/quizzes/[quizId]/page.jsx` (Client Component)
  - Submit action: `frontennd/src/app/quizzes/[quizId]/actions.js` (Server Action)
  - Results page: `frontennd/src/app/quizzes/[quizId]/results/page.jsx` (Server Component)
  - Share buttons: `frontennd/src/app/quizzes/[quizId]/results/ShareButtons.jsx` (Client Component)
- **Quiz Discovery** (NEW):
  - All quizzes: `frontennd/src/app/quizzes/page.jsx` (uses QuizCard)
  - Hot quizzes: `frontennd/src/app/quizzes/hot/page.jsx` (uses QuizCard)
  - Recent quizzes: `frontennd/src/app/quizzes/recent/page.jsx` (uses QuizCard)
  - User history: `frontennd/src/app/mypage/history/page.jsx`
- **Bookmark System** (NEW):
  - Server actions: `frontennd/src/app/components/bookmarkActions.js`
  - Bookmark button: `frontennd/src/app/components/BookmarkButton.jsx` (Client Component)
  - Quiz card: `frontennd/src/app/components/QuizCard.jsx` (Server Component)
  - Favorite page: `frontennd/src/app/mypage/favorite/page.jsx`
- **Layout & Navigation**: `frontennd/src/app/layout.jsx` (async server component with auth state)
- **Home Page**: `frontennd/src/app/page.jsx` (updated with feature showcase)
- **Supabase Clients**: `frontennd/src/utils/supabase/*.js`

- **User Dashboard** (NEW):
  - Dashboard page: `frontennd/src/app/mypage/page.jsx` (Server Component with pending quiz alerts)
- **Quiz Management** (NEW):
  - Created quizzes list: `frontennd/src/app/mypage/quizzes/page.jsx` (Server Component)
  - Quiz edit page: `frontennd/src/app/mypage/quizzes/[quizId]/page.jsx` (Server Component)
  - Publish toggle: `frontennd/src/app/mypage/quizzes/[quizId]/PublishedToggle.jsx` (Client Component)
  - Server actions: `frontennd/src/app/mypage/quizzes/[quizId]/actions.js`

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
