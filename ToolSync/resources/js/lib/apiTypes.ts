export type ToolStatusApi = 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE';

export type BaseToolStatusUi = 'Available' | 'Borrowed' | 'Maintenance';

export type ToolStatusUi = 'Available' | 'Borrowed' | 'Maintenance' | 'Partially Available' | 'Fully Reserved' | 'Unavailable';

export type AvailabilityStatus = 'available' | 'partially_available' | 'fully_reserved' | 'unavailable';

export type ToolCategoryDto = {
    id: number;
    name: string;
};

export type ToolDto = {
    id: number;
    code?: string | null;
    name: string;
    /** URL-safe slug from tool name (e.g. "macbook-pro-14") for /tools/{slug} */
    slug?: string | null;
    description: string | null;
    image_path: string | null;
    category_id: number;
    status: ToolStatusApi;
    condition?: string | null;
    quantity: number;
    created_at: string;
    updated_at: string;
    category?: ToolCategoryDto;
    /** Number of times this tool has been allocated (borrowed). */
    allocations_count?: number;
    /** Number of currently borrowed allocations for this tool. */
    borrowed_count?: number;
    /** Number of pending borrow requests for this tool. */
    reserved_count?: number;
    /** Number of condition history records for this tool. */
    condition_histories_count?: number;
    /** Calculated available count (quantity - borrowed - reserved). */
    calculated_available_count?: number;
    /** Optional alias used by some endpoints for calculated availability. */
    calculated_availability?: number;
    /** Calculated reserved count (pending borrow requests from service). */
    calculated_reserved_count?: number;
    /** Real-time availability status from backend service. */
    availability_status?: AvailabilityStatus;
    /** Human-readable availability message from backend service. */
    availability_message?: string;
    /** Optional day-by-day availability map for date-range responses. */
    available_for_dates?: Record<string, number>;
    /** Latest admin-verified condition from history. */
    latest_admin_condition?: string | null;
    /** Key-value specs (e.g. Processor, Memory) shown on tool detail. */
    specifications?: Record<string, string> | null;
};

export type ToolCardData = {
    id: number;
    name: string;
    toolId: string;
    category: string;
    status: ToolStatusUi;
    condition: string;
    latestAdminCondition?: string | null;
    hasConditionHistory?: boolean;
    imageUrl?: string;
};

export type ToolDetail = {
    id: number;
    name: string;
    toolId: string;
    category: string;
    status: ToolStatusUi;
    condition: string;
    description: string;
    specifications: Record<string, string>;
    lastMaintenance: string;
    totalBorrowings: number;
    imageUrl?: string;
};

export function mapToolStatusToUi(status: ToolStatusApi): BaseToolStatusUi {
    if (status === 'BORROWED') {
        return 'Borrowed';
    }

    if (status === 'MAINTENANCE') {
        return 'Maintenance';
    }

    return 'Available';
}

export function mapAvailabilityStatusToUi(availabilityStatus: AvailabilityStatus): ToolStatusUi {
    switch (availabilityStatus) {
        case 'available':
            return 'Available';
        case 'partially_available':
            return 'Partially Available';
        case 'fully_reserved':
            return 'Fully Reserved';
        case 'unavailable':
            return 'Unavailable';
        default:
            return 'Available';
    }
}

export type AllocationStatusApi = 'SCHEDULED' | 'BORROWED' | 'PENDING_RETURN' | 'RETURNED';

export type AllocationDto = {
    id: number;
    tool_id: number;
    user_id: number;
    borrow_date: string;
    expected_return_date: string;
    claimed_at?: string | null;
    claimed_by?: number | null;
    actual_return_date: string | null;
    status: AllocationStatusApi;
    note: string | null;
    condition: string | null;
    created_at: string;
    updated_at: string;
    tool: {
        id: number;
        name: string;
        slug?: string | null;
        category?: {
            id: number;
            name: string;
        };
    } | null;
    user: {
        id: number;
        name: string;
        email?: string;
    };
};

export type BorrowingStatusUi = 'Upcoming' | 'Active' | 'Pending' | 'Returned' | 'Overdue';

export type BorrowingCardTool = {
    id: number;
    name: string;
    slug?: string | null;
    toolId: string;
    category: string;
};

export type BorrowingCardData = {
    id: number;
    tool: BorrowingCardTool;
    borrowDate: string;
    dueDate: string;
    returnDate?: string;
    status: BorrowingStatusUi;
};

export function mapAllocationStatusToUi(allocation: AllocationDto, now: Date = new Date()): BorrowingStatusUi {
    if (allocation.status === 'SCHEDULED') {
        return 'Upcoming';
    }

    if (allocation.status === 'RETURNED') {
        return 'Returned';
    }

    if (allocation.status === 'PENDING_RETURN') {
        return 'Pending';
    }

    // Parse the due date as a local calendar date (Y-m-d) and set to end-of-day (23:59:59)
    // so a tool due on Feb 11 is only overdue starting Feb 12, not during Feb 11.
    const dueYmd = allocation.expected_return_date.slice(0, 10);
    const endOfDueDay = new Date(`${dueYmd}T23:59:59`);

    if (endOfDueDay < now) {
        return 'Overdue';
    }

    return 'Active';
}

// --- API response types (match backend JSON) ---

export type DashboardCounts = {
    tools_total_quantity?: number;
    tools_available_quantity: number;
    tools_maintenance_quantity: number;
    borrowed_active_count: number;
    scheduled_active_count?: number;
    reserved_active_count?: number;
    overdue_count: number;
    returned_today_count?: number;
};

export type DashboardRecentActivityItem = {
    id: number;
    tool_id: number;
    tool_name: string | null;
    user_id: number;
    user_name: string | null;
    borrow_date?: string;
    expected_return_date: string;
    status: string;
    status_display: string;
    is_overdue: boolean;
};

export type DashboardSummary = {
    returned_count: number;
    not_returned_count: number;
    overdue_in_period_count: number;
    returned_percent: number;
    not_returned_percent: number;
    range_days: number;
};

export type DashboardPendingApproval = {
    id: number;
    tool_id: number;
    tool_name: string;
    user_name: string;
    user_email: string | null;
    start_date: string | null;
    end_date: string | null;
};

export type DashboardApiResponse = {
    data: {
        scope: { user_id: number | null };
        /** Max concurrent borrow/request slots (from system settings). Used by catalog for "Borrowing limit reached". */
        max_borrowings?: number;
        counts: DashboardCounts;
        total_users?: number;
        pending_approvals_count?: number;
        pending_approvals?: DashboardPendingApproval[];
        maintenance_due_count?: number;
        recent_activity: DashboardRecentActivityItem[];
        summary: DashboardSummary;
    };
};

export type AllocationHistoryItem = AllocationDto & { is_overdue?: boolean; status_display?: string };

export type AllocationHistoryPaginated = {
    current_page: number;
    data: AllocationHistoryItem[];
    per_page: number;
    total: number;
};

export type AllocationHistorySummary = {
    data: {
        total: number;
        returned: number;
        active: number;
        overdue: number;
    };
};

export type ReservationApiItem = {
    id: number;
    toolName: string;
    toolId: string;
    startDate: string;
    endDate: string;
    status: string;
    recurring: boolean;
    recurrencePattern: string | null;
};

export type SettingsGeneral = Record<string, string>;

export type SettingsBusinessHour = {
    day_of_week: number;
    enabled: boolean;
    open: string;
    close: string;
};

export type SettingsHoliday = {
    id: number;
    name: string;
    date: string;
};

export type SettingsAutoApprovalRule = {
    id: number;
    name: string;
    condition: string;
    enabled: boolean;
};

export type SettingsApiResponse = {
    data: {
        general: SettingsGeneral;
        business_hours: SettingsBusinessHour[];
        holidays: SettingsHoliday[];
        auto_approval_rules: SettingsAutoApprovalRule[];
    };
};

export type MaintenanceScheduleApiItem = {
    id: number;
    tool_id: number;
    toolName: string;
    toolId: string;
    type: string;
    scheduledDate: string;
    completedDate: string | null;
    assignee: string;
    status: string;
    notes: string | null;
    usageCount: number;
    triggerThreshold: number;
};

export type ToolDeprecationApiItem = {
    id: number;
    tool_id: number;
    toolName: string;
    toolId: string;
    reason: string;
    retireDate: string;
    replacement_tool_id: number | null;
    replacementId: string | null;
    status: string;
};

export type ApprovalBorrowRequest = {
    id: number;
    type: 'borrow';
    tool_id: number;
    tool_name: string;
    tool_code: string | null;
    user_id: number;
    user_name: string;
    user_email: string | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
    created_at: string | null;
};

export type ApprovalReturnRequest = {
    id: number;
    type: 'return';
    tool_id: number;
    tool_name: string;
    tool_code: string | null;
    user_id: number;
    user_name: string;
    user_email: string | null;
    borrow_date: string;
    expected_return_date: string;
    note: string | null;
    reported_condition: string | null;
    admin_condition: string | null;
    admin_review_note: string | null;
    return_proof_image_url: string | null;
    borrower_image_urls: string[];
    admin_image_urls: string[];
    status: string;
    created_at: string | null;
};

export type ApprovalsApiResponse = {
    data: {
        borrow_requests: ApprovalBorrowRequest[];
        return_requests: ApprovalReturnRequest[];
    };
};

export type ApprovalsCountApiResponse = {
    data: {
        borrow_requests_count: number;
        return_requests_count: number;
        total: number;
    };
};

export type DepartmentApiItem = { id: number; name: string };

export type ActivityLogApiItem = {
    id: number;
    user_id: number | null;
    user_name: string | null;
    action: string;
    subject_type: string | null;
    subject_id: number | null;
    description: string | null;
    properties: Record<string, unknown> | null;
    created_at: string;
};

export type AnalyticsOverviewApiResponse = {
    data: {
        scope: { user_id: number | null };
        range: { from: string; to: string };
        timeseries: {
            borrowed: Array<{ date: string; count: number }>;
            returned: Array<{ date: string; count: number }>;
        };
        top_tools: Array<{ tool_id: number; tool_name: string; borrow_count: number }>;
        status_breakdown: { borrowed: number; returned: number; overdue: number };
        tool_utilization?: Array<{ tool_id: number; tool_name: string; days_used: number }>;
        category_distribution?: Array<{ name: string; value: number }>;
        top_users?: Array<{ user_id: number; user_name: string; department: string | null; borrow_count: number }>;
        avg_return_days?: number | null;
        new_users_count?: number;
    };
};

export type UsageHeatmapCellApi = { date: string; count: number };

export type UsageHeatmapApiResponse = {
    data: {
        from: string;
        to: string;
        cells: UsageHeatmapCellApi[];
    };
};

export type FavoriteApiItem = {
    id: number;
    name: string;
    slug?: string | null;
    toolId: string;
    category: string;
    imageUrl?: string | null;
};

export type ReportType = 'borrowing_summary' | 'tool_utilization' | 'user_activity' | 'overdue_report' | 'maintenance_log' | 'custom';

export type ReportRow = Record<string, string | number>;

export type ReportDataApiResponse = {
    data: ReportRow[];
    meta: {
        report_type: ReportType;
        columns: string[];
        from: string;
        to: string;
        count: number;
    };
};
