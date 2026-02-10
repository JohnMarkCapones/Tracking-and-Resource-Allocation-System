# Request to Borrow / Reservation – Testing & Debugging

## Run the tests

From the `ToolSync` project root:

```bash
php artisan test tests/Feature/RequestToBorrowAndReservationTest.php
```

Or run a single test by name:

```bash
php artisan test tests/Feature/RequestToBorrowAndReservationTest.php --filter="with auth and valid payload"
```

## What the tests cover

| Test | Purpose |
|------|--------|
| **401 without auth** | Both `POST /api/tool-allocations` and `POST /api/reservations` require login. Unauthenticated requests get 401; the frontend then redirects to `/profile/login`. |
| **201 with valid payload** | Authenticated user, valid tool_id and date range (and business hours open) → borrow or reservation is created. |
| **422 invalid tool_id** | `tool_id` that does not exist in `tools` table → validation error. |
| **409 tool not available** | Borrow request for a tool that is already BORROWED or has quantity 0 → conflict. |
| **Full flow** | Borrow an available tool, then create a reservation for the same tool (mirrors “Request to Borrow” then “Request a Reservation”). |

## Why “Request to Borrow” might not work in the app

1. **Not logged in**  
   The API uses `auth:sanctum`. If the user is not logged in, the request returns **401** and the frontend redirects to `/profile/login`.  
   **Check:** Log in, then try again.

2. **Wrong or missing tool ID**  
   The tool detail page at `/tools/{id}` is rendered by `ToolController::show`, which uses **static mock data** for `id` 1, 2, 3. If your real tools in the database have different IDs (e.g. from seeders), then:
   - Visiting `/tools/1` shows mock “MacBook Pro” with `id: 1`.
   - Submitting sends `tool_id: 1` to the API.
   - If there is no tool with `id = 1` in the database, the API returns **422** (“The selected tool id is invalid.”).  
   **Fix:** Either ensure you have tools with IDs 1–3 in the DB, or change the detail page to load the tool from the API by ID so it always uses a real tool ID.

3. **Date validation**  
   `DateValidationService` checks:
   - No holidays in the selected range.
   - No closed days (every day in the range must have at least one open business hour).  
   If the table `business_hours` is empty or all days are disabled, **all** dates are treated as closed and the API returns **422** (“Selected range includes closed days: …”).  
   **Fix:** In admin/settings, configure business hours so the requested dates are open, or seed `business_hours` (e.g. Mon–Fri 09:00–17:00).

4. **Tool not available**  
   For **Request to Borrow**, the tool must be `AVAILABLE` and `quantity >= 1`. Otherwise the API returns **409** (“Tool is not available for borrowing.”).  
   **Check:** Tool status and quantity in the database or admin.

5. **CSRF / session**  
   The frontend sends `X-XSRF-TOKEN` from the cookie. If the session or CSRF token is invalid or expired, you can get **419** or **401**.  
   **Check:** Log in again and ensure cookies are allowed for the app origin.

## Quick API check from the browser

When on the app (same origin, logged in), open DevTools → Console and run:

```javascript
// Replace with a real tool id and dates from your DB
fetch('/api/tool-allocations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ? decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)[1]) : ''
  },
  credentials: 'same-origin',
  body: JSON.stringify({
    tool_id: 1,
    user_id: 1,  // your user id
    borrow_date: '2026-02-15',
    expected_return_date: '2026-02-18',
    note: 'Test'
  })
})
  .then(r => r.json().then(d => ({ status: r.status, data: d })))
  .then(console.log)
  .catch(console.error);
```

Interpret the result:

- **401** → Not authenticated (or session/CSRF issue).
- **422** → Validation (e.g. invalid `tool_id`, or date validation message).
- **409** → Tool not available for borrowing.
- **201** → Borrow request created.
