# Refined Fix Plan — TA-004, TA-006, DB-003

Based on the current ToolSync codebase (Laravel + Inertia + React/TypeScript). Exact files and behavior are referenced so implementation can follow step-by-step.

---

## 1. DB-003 — Display "None" instead of "0" for borrowed tools count

**Current behavior:** When there are no borrowed tools, the dashboard shows `0`. The requirement is to show **"None"** (or equivalent) so the test passes.

**Locations to change:**

| Where | File | What to do |
|-------|------|------------|
| **User Dashboard** | `ToolSync/resources/js/Components/Dashboard/WelcomeBanner.tsx` | Line 77: today it renders `{borrowedItemsCount}`. Render `borrowedItemsCount === 0 ? 'None' : borrowedItemsCount`. |
| **Admin Dashboard** | `ToolSync/resources/js/Components/Dashboard/AdminStatBar.tsx` | Line 68 (Borrowed card): same rule — show "None" when `metrics.borrowedTools === 0`, otherwise the number. Line 124 (Active borrowings card): same for `metrics.activeBorrowings === 0`. |

**No backend change:** The API (`Api\DashboardController.php`) correctly returns `borrowed_active_count` (can be 0). The fix is display-only on the frontend.

**Verification:** With 0 borrowed tools, both User and Admin dashboards show "None" for borrowed/active counts. With 1+ borrowed tools, the numeric count is shown.

---

## 2. TA-006 — "Unknown tools" / placeholder when clicking tools in borrowing history

**Root cause:** The **tool detail page** is still using **static mock data** in the web controller. Only IDs 1–3 have mock entries; any other ID (e.g. from real allocations) falls back to a placeholder:

- **File:** `ToolSync/app/Http/Controllers/ToolController.php`
- **Method:** `show(int $id)`
- **Current logic:** `$tool = $tools[$id] ?? ['id' => $id, 'name' => 'Unknown Tool', 'toolId' => 'XX-0000', ...]`

So when a user opens "My Borrowings" or "Overview of Borrowing History" and clicks a tool (e.g. link to `/tools/5` from a real allocation), the page shows "Unknown Tool" because the web `show` action never loads from the database.

**Additional context:**

- **User Dashboard** — "Overview of Borrowing History" (`BorrowingHistoryTable.tsx`): data comes from `recent_activity` in the dashboard API. Items are mapped in `UserDashboardPage.tsx` with `equipment: a.tool_name ?? 'Unknown'` and `toolId: 'TL-' + a.tool_id`. The table has a "View" button but it does **not** navigate anywhere (no link). So either the table should get a `tool_id` per row and "View" should link to `/tools/{tool_id}`, or the main place users "click" a tool is **My Borrowings**.
- **My Borrowings** (`Borrowings/IndexPage.tsx`): cards link to `/tools/${borrowing.tool.id}` (`BorrowingCard.tsx` line 64). Allocation API returns `tool: { id, name }`. So the link uses the real tool id; the failure happens when the **detail page** is loaded with that id and the web controller returns the placeholder.

**Plan:**

1. **Backend — Tool detail from DB (fixes "Unknown Tool" when clicking from history/borrowings)**  
   - **File:** `ToolSync/app/Http/Controllers/ToolController.php`  
   - In `show(int $id)`: load the tool from the database (e.g. `Tool::with('category')->find($id)`).  
   - Map the model to the same shape expected by the Inertia page (id, name, toolId, category, status, condition, description, specifications, lastMaintenance, totalBorrowings, imageUrl).  
   - If the tool is not found (e.g. deleted), either return 404 and handle it in the frontend, or pass a minimal "Tool no longer available" object and show a message on the detail page. Prefer 404 + a simple "Tool not found" page or redirect.

2. **Frontend — Safe handling of missing tool**  
   - **File:** `ToolSync/resources/js/pages/Tools/DetailPage.tsx`  
   - Ensure the page handles the case when `tool` is missing or has a "not found" flag (if you go the minimal-object route). Show a clear message like "This tool is no longer available" and a link back to catalog or borrowings, instead of a generic "Unknown Tool" placeholder.

3. **Optional — Borrowing history "View" links**  
   - **Files:**  
     - `ToolSync/resources/js/Components/Dashboard/BorrowingHistoryTable.tsx`  
     - `ToolSync/resources/js/pages/Dashboard/UserDashboardPage.tsx`  
   - Extend `BorrowingHistoryItem` to include `toolId: number` (numeric id for the link). In `UserDashboardPage`, when mapping `recent_activity` to history items, set `toolId: a.tool_id`.  
   - In `BorrowingHistoryTable`, make the "View" button a link to `/tools/${item.toolId}` (and optionally the equipment name as well).  
   - This gives a direct path from "Overview of Borrowing History" to the correct tool detail page once the controller loads from DB.

**Verification:** From My Borrowings and (if implemented) from the dashboard borrowing history table, clicking a tool opens the detail page with the **real** tool name and data, not "Unknown Tool" or a placeholder. For a non-existent tool id, show a clear "not found" or "no longer available" state.

---

## 3. TA-004 — Admin notification when user returns a tool (pending approval)

**Current behavior:**

- **Frontend:** In `Borrowings/IndexPage.tsx`, when the user confirms return in `ReturnModal`, `handleReturnSubmit` only:
  - Adds the allocation id to `returnRequestedIds`
  - Shows a toast: "return is pending admin verification"
  - Closes the modal  
  **No API call is made** — the return is never sent to the backend.
- **Backend:** `Api\ToolAllocationController::update()` supports setting allocation `status` to `RETURNED` (immediate return). There is no "pending return" status and no notification to admins when a user requests to return a tool.
- **Admin:** Dashboard `pending_approvals` comes from **reservations** (borrow requests), not from tool returns. So admins never see "who returned what" or any return-approval list.

**Required behavior:** When a user submits a return, the allocation should enter a "pending admin approval" state, and admins should see a notification (and ideally a list) showing **who** returned and **which tool**, so they can approve and then history updates.

**Plan:**

1. **Backend — Status and return-request API**  
   - **Model/DB:**  
     - Add a status (e.g. `PENDING_RETURN`) to the allocation workflow, or reuse a generic "pending" concept. If the schema currently only has `BORROWED` | `RETURNED`, add a migration to allow `PENDING_RETURN` (or equivalent) and ensure `tool_allocations.status` and any enums are updated.  
   - **API:**  
     - **Option A — New endpoint:** e.g. `POST /api/tool-allocations/{id}/request-return` (or `submit-return`). Allowed for the allocation’s borrower. Request body can include condition/notes (from `ReturnModal`). Action: set allocation status to `PENDING_RETURN`, store condition/notes if you have columns, and create admin notifications (see below).  
     - **Option B — Use existing update:** If you prefer not to add a status, you could have the frontend call `PATCH /api/tool-allocations/{id}` with a body like `{ "status": "PENDING_RETURN" }` and have the backend accept that only for the borrower and then create notifications. Either way, the backend must persist "user X requested return of allocation Y (tool Z)" and notify admins.  
   - **File:** `ToolSync/app/Http/Controllers/Api/ToolAllocationController.php` (and possibly a new FormRequest for the return-request payload).

2. **Backend — Notify admins**  
   - **File:** `ToolSync/app/Http/Controllers/Api/NotificationController.php` (and existing `notifications` table / Laravel notification system).  
   - When a return is requested (in the new or updated endpoint): create a notification targeting **admins**. Options:  
     - Use Laravel’s `notifications` table and a notifiable (e.g. all admin users, or an "admin" role).  
     - Or a dedicated "pending_returns" or "admin_notifications" concept.  
   - Notification payload should include: allocation id, tool id, tool name, user who returned (name/id), and optionally condition/notes. So admins see "who returned and what tool".

3. **Backend — Admin list of pending returns**  
   - Expose an API for the admin dashboard to fetch "pending returns" (allocations with status `PENDING_RETURN`), e.g. `GET /api/tool-allocations?status=PENDING_RETURN` (admin only), or a dedicated `GET /api/admin/pending-returns`. Return at least: allocation id, tool id, tool name, user name, requested at, condition/notes.  
   - **File:** Either extend `Api\ToolAllocationController::index()` with admin + status filter, or add a small `Api\Admin\PendingReturnsController` (or similar).

4. **Backend — Admin approve return**  
   - When admin approves, the allocation should move from `PENDING_RETURN` to `RETURNED` (same logic as current `update()` that sets status to RETURNED and updates tool quantity/status). Endpoint can be `PATCH /api/tool-allocations/{id}` with `status: RETURNED` (admin-only for this transition), or a dedicated `POST /api/tool-allocations/{id}/approve-return`. Reuse the existing tool-status and allocation update logic where possible.

5. **Frontend — Submit return request**  
   - **File:** `ToolSync/resources/js/pages/Borrowings/IndexPage.tsx`  
   - In `handleReturnSubmit`, call the new (or updated) API with the allocation id and modal data (condition, notes). On success, update local state (e.g. add to `returnRequestedIds`, show toast, close modal). Optionally refetch borrowings so the card can show "Pending" if the API returns that status.

6. **Frontend — Admin: show pending returns and notifications**  
   - **Files:**  
     - `ToolSync/resources/js/pages/Dashboard/AdminDashboardPage.tsx`  
     - Shared layout/notification component (e.g. `AppLayout.tsx`), which already reads `notifications` and `notifications_unread_count`.  
   - Ensure when a "return requested" notification is created, it appears in the existing notifications list (and unread count). Notification title/body should include user name and tool name.  
   - On the admin dashboard, add a "Pending returns" (or "Return approvals") section similar to "Pending approvals" (reservations): list pending return requests with who returned, which tool, and an "Approve" (and optionally "Reject") action. Data can come from the new pending-returns API.  
   - Optional: add a link from the notification to the pending-returns list or to the specific allocation.

7. **Frontend — BorrowingCard "Pending" state**  
   - **File:** `ToolSync/resources/js/Components/Borrowings/BorrowingCard.tsx`  
   - If the API returns allocations with status `PENDING_RETURN`, map it in `mapAllocationStatusToUi` (in `apiTypes.ts`) to a UI status like "Pending", and show it on the card (you already have a "Pending" label at line 80). Ensure the allocations list API returns the new status and the card doesn’t offer "Return" again when status is Pending.

**Verification:** User submits return from My Borrowings → allocation becomes pending; admin sees a notification and a "Pending returns" list with user and tool; admin approves → allocation and history update; user no longer sees that tool as active and sees it as returned in history.

---

## Suggested order of implementation

| Order | Task    | Rationale |
|-------|---------|-----------|
| 1     | **DB-003** | One-line display change in two components; quick win. |
| 2     | **TA-006** | Tool detail from DB (+ optional history View link) unblocks correct tool display everywhere. |
| 3     | **TA-004** | Larger: migration, return-request API, notifications, admin list and approve, frontend submit and admin UI. |

---

## File reference summary

| Task   | Main files to touch |
|--------|----------------------|
| DB-003 | `resources/js/Components/Dashboard/WelcomeBanner.tsx`, `resources/js/Components/Dashboard/AdminStatBar.tsx` |
| TA-006 | `app/Http/Controllers/ToolController.php`, `resources/js/pages/Tools/DetailPage.tsx`; optionally `BorrowingHistoryTable.tsx`, `UserDashboardPage.tsx` |
| TA-004 | `app/Http/Controllers/Api/ToolAllocationController.php`, notifications (e.g. `NotificationController` + model), new or extended API for pending returns and approve; `resources/js/pages/Borrowings/IndexPage.tsx`, `AdminDashboardPage.tsx`, `apiTypes.ts` (status mapping), `BorrowingCard.tsx` / layout for notifications |

This plan is implementation-ready: you can start with DB-003, then TA-006, then TA-004, following the file and behavior details above.
