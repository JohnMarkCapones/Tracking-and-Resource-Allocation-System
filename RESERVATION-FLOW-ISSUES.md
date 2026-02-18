# 🚨 MAJOR ISSUES: Reservation to Borrowing Flow

## The Big Problem

**YES - Tools show as "AVAILABLE" even when fully reserved!** This is confusing and misleading.

---

## 🔴 Issue #1: Tool Status Doesn't Reflect Reservations

### Problem:
- When a user creates a reservation, `tool.quantity` **DOES NOT decrease**
- Tool status stays `AVAILABLE` even if all units are reserved
- Frontend shows "Request to Borrow" button even when tool is fully booked

### Example:
```
Tool: Laptop
Quantity: 1
Status: AVAILABLE ✅

User A reserves it for Feb 20-25
→ Reservation created (UPCOMING)
→ Tool quantity: STILL 1 ❌
→ Tool status: STILL AVAILABLE ❌
→ Frontend: Shows "Request to Borrow" button ❌

User B sees tool as "Available" and tries to reserve
→ System correctly rejects (good!)
→ But UI is misleading (bad!)
```

### Why This Happens:
- Reservations don't decrease `tool.quantity` until they activate
- Tool status is based on `quantity` and `status` field only
- No real-time calculation of "available = quantity - borrowed - reserved"

---

## 🔴 Issue #2: Reservation Status Confusion

### Current Flow:
1. User creates reservation → Status: `UPCOMING` or `PENDING`
2. Reservation activates → Status: `ACTIVE` + Creates `ToolAllocation`
3. Reservation stays `ACTIVE` forever ❌

### Problem:
- What does `ACTIVE` reservation mean?
- It already created an allocation, so why is it still `ACTIVE`?
- Should be `COMPLETED` after allocation is created

### Confusing States:
```
UPCOMING → Future reservation, not yet active
PENDING → Borrow request waiting admin approval
ACTIVE → ??? (Allocation already created, but reservation still active?)
COMPLETED → Used for approved borrow requests
CANCELLED → Cancelled reservation
```

---

## 🔴 Issue #3: Frontend Shows Wrong Availability

### Current Calculation:
```typescript
// In CatalogPage.tsx
const availableQuantity = Math.max(0, Number(dto.quantity ?? 0));
const borrowedQuantity = Math.max(0, Number(dto.borrowed_count ?? 0));
```

### Problem:
- Only subtracts `borrowed_count` (allocations)
- **Doesn't subtract reservations**
- Shows "5 available" when actually "2 available, 3 reserved"

### Example:
```
Tool: Drill
Total Quantity: 5
Borrowed: 1
Reserved: 3
Actually Available: 1

Frontend Shows:
- Quantity: 5
- Available: 4 ❌ (should be 1)
- Borrowed: 1
```

---

## 🔴 Issue #4: Reservation Activation Creates Duplicate Records

### Current Behavior:
When `reservations:activate` runs:
1. Finds UPCOMING reservation
2. Creates `ToolAllocation` (borrowing record)
3. Sets reservation status to `ACTIVE`
4. Decrements tool quantity

### Problem:
- Reservation becomes `ACTIVE` but allocation already exists
- Two records for same thing: Reservation (ACTIVE) + Allocation (BORROWED)
- Should reservation become `COMPLETED` instead?

---

## 🔴 Issue #5: No Real-Time Availability API

### Missing:
- API endpoint that calculates: `available = quantity - borrowed - reserved`
- Frontend has to calculate it manually
- Doesn't account for date ranges

### What's Needed:
```php
// Should return:
{
  "total_quantity": 5,
  "borrowed": 1,
  "reserved": 3,
  "available": 1,
  "available_for_date_range": {
    "2026-02-20": 0,  // Fully booked
    "2026-02-21": 0,  // Fully booked
    "2026-02-25": 1   // Available
  }
}
```

---

## 🔴 Issue #6: Reservation Doesn't Reserve Quantity

### The Core Problem:
**Reservations are "promises" but don't actually reserve inventory**

### What Should Happen:
```
User reserves tool for Feb 20-25
→ Tool quantity decreases by 1
→ Tool status might change if quantity reaches 0
→ Other users see it as "Reserved" or "Unavailable"
```

### What Actually Happens:
```
User reserves tool for Feb 20-25
→ Tool quantity stays the same ❌
→ Tool status stays AVAILABLE ❌
→ Other users see it as available ❌
→ System rejects them (but UI is confusing)
```

---

## 🔴 Issue #7: Calendar Shows Reservations But Status Doesn't

### Current:
- Calendar correctly shows unavailable dates (including reservations)
- But tool card shows "Available" status
- **Contradictory information!**

### User Experience:
```
User sees:
- Tool Card: "Available" ✅
- Calendar: "Unavailable Feb 20-25" ❌
- Tries to reserve: Gets rejected ❌

Confusing! Why show "Available" if calendar says unavailable?
```

---

## 📊 Summary of Problems

| Issue | Impact | Severity |
|-------|--------|----------|
| Tool shows AVAILABLE when reserved | Misleading UI | 🔴 HIGH |
| Reservation doesn't decrease quantity | Wrong availability | 🔴 HIGH |
| Frontend doesn't subtract reservations | Wrong numbers | 🔴 HIGH |
| Reservation status confusion | Developer confusion | 🟡 MEDIUM |
| No real-time availability API | Manual calculations | 🟡 MEDIUM |
| Calendar vs Status mismatch | User confusion | 🔴 HIGH |

---

## ✅ What Should Happen

### Option 1: Reservations Reserve Quantity (Recommended)
```
1. User creates reservation
   → Tool quantity decreases
   → Tool status updates if needed
   → Other users see correct availability

2. Reservation activates
   → Creates allocation
   → Reservation → COMPLETED
   → Quantity already decreased (no change)

3. User returns tool
   → Allocation → RETURNED
   → Tool quantity increases
```

### Option 2: Virtual Availability Calculation
```
1. Keep quantity unchanged
2. Calculate availability dynamically:
   available = quantity - borrowed - reserved_for_date_range
3. Show this in API and frontend
4. Update tool status based on calculated availability
```

---

## 🎯 Recommended Fixes

### Fix #1: Calculate Real Availability
- Add method to calculate: `available = quantity - borrowed - reserved`
- Use this in API responses
- Update frontend to use calculated value

### Fix #2: Update Reservation Status
- When reservation activates → Create allocation → Set status to `COMPLETED`
- `ACTIVE` status is confusing

### Fix #3: Show Reservation Count in API
- Add `reserved_count` to tool API response
- Frontend can display: "3 reserved, 2 available"

### Fix #4: Update Tool Status Based on Availability
- If `calculated_available = 0` → Status should reflect this
- Maybe add "RESERVED" status or show "Available (X reserved)"

### Fix #5: Fix Calendar vs Status Mismatch
- If calendar shows unavailable dates → Don't show "Available" status
- Or show "Partially Available" with calendar dates

---

## 🚨 Current State: **CONFUSING BUT FUNCTIONAL**

The system **works correctly** (rejects conflicts) but the **UI is misleading**:
- ✅ Backend correctly prevents conflicts
- ❌ Frontend shows wrong availability
- ❌ Users see "Available" when it's actually reserved
- ❌ Calendar and status contradict each other

**Users will be confused but won't break the system** (backend protects against conflicts).

---

**Status**: Needs UI/UX fixes for clarity, but core logic is correct.
