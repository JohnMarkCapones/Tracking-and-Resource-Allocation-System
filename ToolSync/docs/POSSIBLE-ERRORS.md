# Possible Errors Reference

This document lists errors you can encounter in the ToolSync app, especially in the **Browse Tools → Request to Borrow / Request a Reservation** flow, plus login, API, and infrastructure.

---

## 1. Request to Borrow (`POST /api/tool-allocations`)

| Cause | HTTP | Message / behavior | Fix |
|-------|------|--------------------|-----|
| Not logged in | **401** | Unauthorized. Frontend redirects to `/profile/login`. | Log in and try again. |
| Invalid or missing CSRF token | **419** or **401** | Page Expired / Unauthorized. | Refresh the page, log in again; ensure cookies are allowed. |
| `tool_id` does not exist in DB | **422** | Validation error: "The selected tool id is invalid." | Use a tool ID that exists in `tools` (e.g. from catalog that loads from API). If detail page uses mock data, ensure DB has matching tool IDs or load tool from API. |
| `user_id` does not exist | **422** | "The selected user id is invalid." | Frontend sends `auth.user.id`; ensure the authenticated user exists in `users`. |
| Missing/invalid dates | **422** | Validation: "borrow_date" / "expected_return_date" required or invalid. | Send valid `borrow_date` and `expected_return_date` (YYYY-MM-DD), with return ≥ borrow. |
| **Closed days** (business hours) | **422** | "Selected range includes closed days: YYYY-MM-DD, ..." | Configure **business hours** so every day in the range is open (Admin → Settings or seed `business_hours`). Run `php artisan db:seed --class=BusinessHourSeeder` to seed defaults. |
| **Holidays** in range | **422** | "Selected dates fall on holiday(s): ..." | Choose dates that don’t include configured holidays, or remove those holidays in Settings. |
| **Max concurrent borrowings** | **422** | "You have reached the maximum concurrent borrowings (N). Return a tool before borrowing another." | Return an active borrowing or increase `max_borrowings` in system settings. |
| **Max duration exceeded** | **422** | "Borrow duration cannot exceed N days. Requested: X days." | Shorten the date range or increase `max_duration` in system settings. |
| **Tool not available** | **409** | "Tool is not available for borrowing." | Tool status is not AVAILABLE or quantity is 0. Wait or choose another tool. |
| **Activity log table missing** | (was **500**) | "Table 'tracking_resource_system.activity_logs' doesn't exist" | **Fixed:** ActivityLogger now catches DB errors so the request still returns 201. To enable logging: run `php artisan migrate` (or run only the migration `2026_02_06_100008_create_activity_logs_table.php` if the rest are already applied). |
| **tool_status_logs missing column** | **500** | `Unknown column 'updated_at' in 'field list'` when inserting into `tool_status_logs` | **Fixed:** `ToolStatusLog` model now has `$timestamps = false` so it doesn't try to set `created_at`/`updated_at`. If your table was created without those columns, the borrow will now succeed. Alternatively, add the columns: `ALTER TABLE tool_status_logs ADD COLUMN updated_at TIMESTAMP NULL, ADD COLUMN created_at TIMESTAMP NULL;` |

---

## 2. Request a Reservation (`POST /api/reservations`)

| Cause | HTTP | Message / behavior | Fix |
|-------|------|--------------------|-----|
| Not logged in | **401** | Unauthorized; frontend may redirect to login. | Log in. |
| Invalid/missing CSRF | **419** / **401** | Same as above. | Refresh, re-login, check cookies. |
| `tool_id` invalid | **422** | "The selected tool id is invalid." | Use existing tool ID. |
| Invalid dates | **422** | Validation on `start_date` / `end_date`. | Send valid dates, `end_date` ≥ `start_date`. |
| **Closed days** in range | **422** | "Selected range includes closed days: ..." | Same as borrow: configure business hours or seed `BusinessHourSeeder`. |
| **Holidays** in range | **422** | "Selected dates fall on holiday(s): ..." | Avoid those dates or adjust holidays in Settings. |
| **Activity log table missing** | (was **500**) | Same as above. | ActivityLogger is resilient; request still succeeds. Run migration for `activity_logs` to enable logging. |

---

## 3. Update Reservation (`PUT /api/reservations/{id}`)

| Cause | HTTP | Message | Fix |
|-------|------|--------|-----|
| Not the reservation owner | **403** | "You are not allowed to modify this reservation." | Only the user who created the reservation can update it. |
| Invalid `status` | **422** | Validation error. | Allowed: `UPCOMING`, `ACTIVE`, `COMPLETED`, `CANCELLED`. |

---

## 4. Login (`POST /login`)

| Cause | HTTP | Message / behavior | Fix |
|-------|------|--------------------|-----|
| Wrong email or password | **422** | "These credentials do not match our records." (or `auth.failed` translation) | Use correct credentials. |
| Rate limited (too many attempts) | **422** | Throttle message (e.g. "Too many login attempts. Please try again in X seconds/minutes.") | Wait and retry; limit is 5 attempts per key. |
| Missing email/password | **422** | Validation errors on email/password. | Fill both fields; email must be valid format. |

---

## 5. Other API / App

| Area | Cause | HTTP | Message / behavior | Fix |
|------|--------|------|--------------------|-----|
| **Tool allocation update** (e.g. return) | Non-admin | **403** | "Only admins can update tool allocations." | Use an admin user. |
| **Favorites** | `tool_id` invalid | **422** | Validation. | Use existing tool ID. |
| **Dashboard / Analytics** | Not authenticated | **401** | Unauthorized. | Log in. |
| **Admin routes** | Not admin | **403** | Forbidden. | Use an admin account. |
| **Catalog / tools list** | API or DB down | **500** / network error | Frontend shows "Failed to load tools" or similar. | Check API, DB, and network. |
| **Tool availability** `GET /api/tools/{id}/availability` | Tool missing | **404** | Not found. | Use valid tool ID. |
| **General** | Missing table (e.g. `tool_allocations`, `reservations`, `business_hours`) | **500** | "Table '...' doesn't exist" | Run migrations: `php artisan migrate`. See **§8 Missing tables** below. |
| **General** | Missing column (e.g. `updated_at` in `tool_status_logs`) | **500** | "Unknown column 'X' in 'field list'" | Align DB with migrations, or (if fixed in code) ensure the model doesn't reference the missing column (e.g. `$timestamps = false`). |
| **General** | PHP/Laravel exception | **500** | Error page or JSON with message. | Check `storage/logs/laravel.log` and fix code or config. |

---

## 6. Frontend behavior

- **401** from API → `http.ts` redirects to `/profile/login`.
- **4xx/5xx** → Response body `message` (if JSON) is shown in toast; otherwise generic "Request failed" or similar.
- **Network / CORS** → Request fails; user may see a generic error or nothing. Check console and network tab.

---

## 7. Quick fixes

1. **"Selected range includes closed days"** → Seed business hours:  
   `php artisan db:seed --class=BusinessHourSeeder`
2. **"Table 'activity_logs' doesn't exist"** → ActivityLogger no longer breaks the request. To create the table:  
   `php artisan migrate` (or run only the `create_activity_logs_table` migration if needed).
3. **401 on borrow/reservation** → Log in and ensure session/CSRF cookies are sent (same-origin, no blocking).
4. **422 "tool id invalid"** on detail page → Ensure the tool detail page uses a tool ID that exists in the database (e.g. load tool from API by ID instead of static mock).
5. **"Table 'departments' doesn't exist"** on Analytics → Analytics now works without `departments` (top users show without department). To enable departments: run `php artisan migrate` (includes `create_departments_table` and `add_department_id_to_users_table`).
6. **"Table 'maintenance_schedules' doesn't exist"** on Maintenance → The Maintenance page now loads and shows an empty list plus a setup hint. Run `php artisan migrate` to create the table; then you can add and manage schedules.
7. **"Unknown column 'updated_at' in 'field list'"** when adding a category → The `tool_categories` table may have been created without `created_at`/`updated_at`. The `ToolCategory` model now has `$timestamps = false` so inserts work without those columns. To add the columns: `ALTER TABLE tool_categories ADD COLUMN created_at TIMESTAMP NULL, ADD COLUMN updated_at TIMESTAMP NULL;`

---

## 8. Missing tables (what breaks if a table is absent)

Run `php artisan migrate` to create all tables. If you cannot run some migrations, this table shows which features depend on which tables and what is already guarded in code.

| Table | Used by | If missing | Guarded in code? |
|-------|--------|------------|------------------|
| **users** | Auth, dashboard, allocations, admin | Login and most features fail (500). | No – core. |
| **tools** | Catalog, tool management, allocations | Tool list and tool ops fail. | No. |
| **tool_categories** | Tools, catalog, analytics category distribution | Tool CRUD and category filter fail; analytics category chart empty. | **Yes** – Analytics overview returns empty `category_distribution` if missing. |
| **tool_allocations** | Borrowings, allocation history, analytics, dashboard | Borrow/return and related APIs fail. | No. |
| **departments** | User management (department), analytics top users | Department API and admin user department fail; analytics top users failed. | **Yes** – Analytics overview skips department join and returns `department: null`; Department API still needs table. |
| **reservations** | Reservations page, tool availability, dashboard pending approvals | Reservation API and tool availability reservations fail; dashboard pending. | **Yes** – Dashboard skips pending approvals; Tool availability returns empty `reservations`; ReservationController still needs table. |
| **maintenance_schedules** | Maintenance page, dashboard maintenance due | Maintenance API and dashboard count fail. | **Yes** – Dashboard skips maintenance_due_count if missing; Maintenance index returns empty data and `meta.table_missing` when table absent; store returns 503 with message. Page shows setup hint. |
| **activity_logs** | Activity logging (department/tool etc. actions) | Logging fails; request continues. | **Yes** – ActivityLogger catches DB errors. |
| **business_hours** | Borrow/reservation validation (closed days) | Validation may allow closed days. | No – validation uses table if present. |
| **holidays** | Borrow/reservation validation (holidays) | Validation may allow holidays. | No. |
| **system_settings** | Max borrowings, max duration, etc. | Defaults or 500 if code assumes table. | Depends on controller. |
| **tool_status_logs** | Status change logging | Log insert can 500 (e.g. timestamps). | Model uses `$timestamps = false` to avoid missing column. |
| **sessions** | Session driver (database) | Session-based auth fails if driver is `database`. | N/A. |
| **cache**, **jobs**, **personal_access_tokens**, **tool_deprecations**, **auto_approval_rules**, **favorites** | Various features | Related feature fails. | No. |
