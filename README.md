# Manager Alerts – Take-Home Assessment

This project implements a small “Manager Alerts” slice using a Django backend and a React + TypeScript frontend.  
The solution follows the exact specification: traversal, filtering, optimistic updates, error handling, and required tests.

---

## Setup & Run

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py runserver

```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend runs on http://localhost:8000

Frontend runs on http://localhost:5173

### Test Commands
Backend (pytest)
```bash
cd backend
pytest
```

### Frontend (Vitest + Testing Library)
```bash
cd frontend
npm run test
```

### Time Spent

2.5–3 hours total

## What I focused on

I prioritized the core requirements of the assignment and made sure the fundamentals were correct and fully aligned with the spec:

- Implementing the **API exactly as described**, including shape, sorting, and validation rules  
- Getting **subtree traversal right**, with proper cycle prevention and clean handling of edge cases  
- Making filtering consistent with the expected behaviour (severity, status, text search)  
- Building a **correct optimistic UI** with proper rollback on failure  
- Writing the **required backend and frontend tests**  
- Keeping the codebase **clean, readable, and easy to follow**

## What I Intentionally Cut for Time

Because the exercise is scoped to 2–3 hours, I intentionally kept some areas minimal:

- No advanced UI styling or component polishing  
- No pagination, virtualization, or large-scale table optimizations  
- Only basic error states on the frontend (no detailed fallback UI)  
- Simplified backend data layer instead of full ORM models  
- No CI/CD setup or deployment automation  
- Test coverage limited to the required cases instead of full suite


## How I Used AI / LLMs

I used AI similarly to how I would use documentation, StackOverflow, or Google. It was mainly a support tool 

### What I used AI for

- To quickly confirm **basic Django, React Query, and pytest commands** so I didn’t lose time searching through docs
- To clarify parts of the assignment and ensure I fully understood:
  - expected API shapes  
  - filtering rules  
  - traversal behavior  
  - how optimistic updates + rollback should behave
- To think through **edge cases in subtree traversal**, especially:
  - breaking cycles in E6 → E7 → E8 → E6  
  - preventing infinite loops  
  - excluding the manager’s own alerts  
  - handling `manager_id` not found
- To validate my approach for **testing strategies**, not the test code:
  - how to assert optimistic rollback  
  - what to mock in the API layer  
  - when to use `findByText` vs `waitFor`  
  - how to ensure reliable asynchronous tests

### Where I was stuck and how AI helped me unblock

- I initially ran into a **flaky optimistic update test** where `"dismissed"` never appeared in the DOM  
  → AI helped me reason that the issue was with how the `queryKey` was structured and how React Query caches were invalidated.
- I was confused by a **test failing because URLSearchParams was mutating state during tests**  
  → AI helped me isolate that this was test-only behaviour and guided me to mock `window.location.href` properly.
- I hit a **React Query mutation timing issue** where rollback didn’t happen  
  → AI helped me realize my `onMutate` and `onError` weren’t returning the previous snapshot correctly.
- In Django, I ran into a **CORS misconfiguration**  
  → AI helped me identify that `localhost:*` is not valid and suggested explicit port whitelisting.


## Self-Review

Overall, I'm happy with the solution because the core logic works correctly, the API follows the exact spec, and both required tests pass. But the process also highlighted a few areas where I initially got stuck and had to slow down to reason through the bugs.

### What Went Well
- I implemented the assignment exactly according to the spec, including traversal rules, filtering, validation errors, and dismissal idempotency.
- The optimistic update logic works as intended and rolls back cleanly when the API fails.
- I wrote clear, readable React + Django code and kept the structure simple and maintainable.
- The required tests (filtering + optimistic rollback) now run reliably after fixing underlying issues.

### What I Struggled With
**1. React Query key structure (major cause of failing tests)**  
I originally used a query key like:
const key = ["alerts", managerId, scope, severity, q]
Then I switched to an object key ["alerts", params] in some places.
This inconsistency caused React Query not to recognize cached updates, so the UI never actually re-rendered with "dismissed" during the test.

It looked like a test failure, but the root cause was the key mismatch.

Fixing the key and using a stable object solved it.

**2. Optimistic update test failing (“dismissed” not found)**

This was the biggest struggle:

The UI did update, but the test couldn't see "dismissed" because React Query wasn't returning the updated state.
I debugged by printing the UI output, checking what was actually rendered, and validating that onMutate returned the right previous snapshot.
The fix was ensuring the query key was stable and the test waited properly using waitFor.

**3. Missing waitFor import**
At one point the test failed with:
vbnet
ReferenceError: waitFor is not defined
I simply forgotto import
import { waitFor } from "@testing-library/react"
A small mistake, but it shows where I need to pay closer attention to test utilities when debugging.

**4. Forgetting to add useQueryClient() before onMutate**
The optimistic update code initially threw internal errors because I didn’t instantiate the query client early enough.


