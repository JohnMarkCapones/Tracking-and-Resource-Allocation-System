import { Link } from '@inertiajs/react';
import { differenceInDays, parseISO } from 'date-fns';

export type BorrowingStatus = 'Upcoming' | 'Active' | 'Pending' | 'Returned' | 'Overdue' | 'Unclaimed' | 'Cancelled';

export type Borrowing = {
    id: number;
    tool: {
        id: number;
        name: string;
        slug?: string | null;
        toolId: string;
        category: string;
    };
    borrowDateValue: string;
    borrowDate: string;
    dueDate: string;
    returnDate?: string;
    status: BorrowingStatus;
    canRequestReturn?: boolean;
};

type BorrowingCardProps = {
    borrowing: Borrowing;
    onReturn: (borrowing: Borrowing) => void;
    onCancel: (borrowing: Borrowing) => void;
    /** True when the user requested a return and it's awaiting admin verification. */
    returnRequested?: boolean;
};

function statusClasses(status: BorrowingStatus): string {
    if (status === 'Returned') {
        return 'bg-emerald-50 text-emerald-700';
    }

    if (status === 'Pending') {
        return 'bg-amber-50 text-amber-700';
    }

    if (status === 'Active') {
        return 'bg-blue-50 text-blue-700';
    }

    if (status === 'Upcoming') {
        return 'bg-sky-50 text-sky-700';
    }

    if (status === 'Cancelled') {
        return 'bg-gray-100 text-gray-700';
    }

    if (status === 'Unclaimed') {
        return 'bg-orange-50 text-orange-700';
    }

    return 'bg-rose-50 text-rose-700';
}

export function BorrowingCard({ borrowing, onReturn, onCancel, returnRequested = false }: BorrowingCardProps) {
    const isActive = borrowing.status === 'Active';
    const isOverdue = borrowing.status === 'Overdue';
    const isUnclaimed = borrowing.status === 'Unclaimed';
    const isUpcoming = borrowing.status === 'Upcoming';
    const canRequestReturn = borrowing.canRequestReturn ?? (isActive || isOverdue);

    // Treat dueDate as date-only (YYYY-MM-DD) to avoid timezone shifting (e.g. 2026-02-11Z showing as Feb 10 locally).
    const dueYmd = borrowing.dueDate.slice(0, 10);
    const dueDisplay = new Date(`${dueYmd}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    let daysRemaining: number | null = null;
    if (isActive) {
        const today = new Date();
        const due = parseISO(dueYmd);
        daysRemaining = differenceInDays(due, today);
    }

    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/tools/${borrowing.tool.slug ?? borrowing.tool.id}`}
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                        >
                            {borrowing.tool.name}
                        </Link>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses(borrowing.status)}`}>
                            {borrowing.status === 'Active'
                                ? 'Borrowed'
                                : borrowing.status === 'Upcoming'
                                  ? 'Upcoming Pickup'
                                  : borrowing.status === 'Unclaimed'
                                    ? 'Unclaimed Pickup'
                                  : borrowing.status}
                        </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500">
                        {borrowing.tool.category} - {borrowing.tool.toolId}
                    </p>
                </div>

                {returnRequested ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700">
                        Pending
                    </span>
                ) : isUpcoming ? (
                    <button
                        type="button"
                        onClick={() => onCancel(borrowing)}
                        className="rounded-full bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700"
                        title="Cancel scheduled pickup"
                    >
                        Cancel reservation
                    </button>
                ) : canRequestReturn ? (
                    <button
                        type="button"
                        onClick={() => onReturn(borrowing)}
                        className="rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700"
                        title="Request return (requires admin approval)"
                    >
                        Request return
                    </button>
                ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-[11px]">
                <div>
                    <p className="text-gray-500">{isUpcoming ? 'Pickup starts' : 'Borrowed'}</p>
                    <p className="font-medium text-gray-900">{borrowing.borrowDate}</p>
                </div>
                <div>
                    <p className="text-gray-500">
                        {borrowing.status === 'Returned'
                            ? 'Returned'
                            : borrowing.status === 'Cancelled' || borrowing.status === 'Unclaimed'
                              ? 'Cancelled'
                              : 'Due'}
                    </p>
                    <p className="font-medium text-gray-900">{borrowing.returnDate ?? dueDisplay}</p>
                </div>
                {daysRemaining !== null && (
                    <div className="ml-auto">
                        {daysRemaining > 0 ? (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">
                                {daysRemaining} days remaining
                            </span>
                        ) : daysRemaining === 0 ? (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">Due today</span>
                        ) : (
                            <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-700">
                                {Math.abs(daysRemaining)} days overdue
                            </span>
                        )}
                    </div>
                )}
                {isOverdue && (
                    <div className="ml-auto">
                        <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-700">Overdue</span>
                    </div>
                )}
                {isUnclaimed && (
                    <div className="ml-auto">
                        <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-semibold text-orange-700">Unclaimed</span>
                    </div>
                )}
            </div>
        </div>
    );
}
