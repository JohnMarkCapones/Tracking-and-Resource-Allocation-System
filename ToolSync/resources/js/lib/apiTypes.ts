export type ToolStatusApi = 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE';

export type ToolStatusUi = 'Available' | 'Borrowed' | 'Maintenance';

export type ToolCategoryDto = {
    id: number;
    name: string;
};

export type ToolDto = {
    id: number;
    name: string;
    description: string | null;
    image_path: string | null;
    category_id: number;
    status: ToolStatusApi;
    quantity: number;
    created_at: string;
    updated_at: string;
    category?: ToolCategoryDto;
};

export type ToolCardData = {
    id: number;
    name: string;
    toolId: string;
    category: string;
    status: ToolStatusUi;
    condition: string;
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

export function mapToolStatusToUi(status: ToolStatusApi): ToolStatusUi {
    if (status === 'BORROWED') {
        return 'Borrowed';
    }

    if (status === 'MAINTENANCE') {
        return 'Maintenance';
    }

    return 'Available';
}

export type AllocationStatusApi = 'BORROWED' | 'RETURNED';

export type AllocationDto = {
    id: number;
    tool_id: number;
    user_id: number;
    borrow_date: string;
    expected_return_date: string;
    actual_return_date: string | null;
    status: AllocationStatusApi;
    note: string | null;
    created_at: string;
    updated_at: string;
    tool: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
        email?: string;
    };
};

export type BorrowingStatusUi = 'Active' | 'Returned' | 'Overdue';

export type BorrowingCardTool = {
    id: number;
    name: string;
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
    if (allocation.status === 'RETURNED') {
        return 'Returned';
    }

    const expected = new Date(allocation.expected_return_date);

    if (expected < now) {
        return 'Overdue';
    }

    return 'Active';
}

