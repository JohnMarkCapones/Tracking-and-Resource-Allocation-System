import { useState, type ReactElement } from 'react';

export type BorrowingHistoryStatus = 'Returned' | 'Borrowed' | 'Overdue';

export type BorrowingHistoryItem = {
    equipment: string;
    toolId: string;
    expectedReturnDate: string;
    status: BorrowingHistoryStatus;
};

type BorrowingHistoryTableProps = {
    items: BorrowingHistoryItem[];
};

function statusClasses(status: BorrowingHistoryStatus): string {
    if (status === 'Returned') {
        return 'bg-emerald-50 text-emerald-700';
    }

    if (status === 'Borrowed') {
        return 'bg-amber-50 text-amber-700';
    }

    return 'bg-rose-50 text-rose-700';
}

function statusIcon(status: BorrowingHistoryStatus): ReactElement {
    if (status === 'Returned') {
        return (
            <svg
                className="mr-1.5 h-3 w-3"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M4 8.5L6.5 11L12 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    if (status === 'Borrowed') {
        return (
            <svg
                className="mr-1.5 h-3 w-3"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M8 3.5V8L11 9.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle
                    cx="8"
                    cy="8"
                    r="4.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                />
            </svg>
        );
    }

    return (
        <svg
            className="mr-1.5 h-3 w-3"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M8 4.5V8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <circle
                cx="8"
                cy="10.5"
                r="0.8"
                fill="currentColor"
            />
            <circle
                cx="8"
                cy="8"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.4"
            />
        </svg>
    );
}

export function BorrowingHistoryTable({ items }: BorrowingHistoryTableProps) {
    // For now this component manages client-side filtering and sorting only.
    // Once real data is wired in, this state will map to query params.
    const [query, setQuery] = useState('');
    const [sortBy, setSortBy] = useState<'equipment' | 'expectedReturnDate'>(
        'expectedReturnDate',
    );
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    if (!items.length && !query) {
        return (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
                <header className="mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Overview of Borrowing History
                    </h3>
                </header>
                <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center">
                    <p className="text-xs font-medium text-gray-600">
                        You haven&apos;t borrowed any tools yet
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">
                        Once you start borrowing, your recent history will
                        appear here.
                    </p>
                </div>
            </section>
        );
    }

    const filtered = items.filter((item) => {
        if (!query.trim()) {
            return true;
        }

        const value = `${item.equipment} ${item.toolId}`.toLowerCase();
        return value.includes(query.toLowerCase());
    });

    const sorted = [...filtered].sort((a, b) => {
        const direction = sortDir === 'asc' ? 1 : -1;

        if (sortBy === 'equipment') {
            return a.equipment.localeCompare(b.equipment) * direction;
        }

        return a.expectedReturnDate.localeCompare(b.expectedReturnDate) * direction;
    });

    const total = sorted.length;
    const pageSize = 5;
    const currentPage = 1;
    const paged = sorted.slice(0, pageSize);

    const toggleSort = (field: 'equipment' | 'expectedReturnDate'): void => {
        if (sortBy === field) {
            setSortDir((previous) => (previous === 'asc' ? 'desc' : 'asc'));
            return;
        }

        setSortBy(field);
        setSortDir('asc');
    };

    return (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                        Overview of Borrowing History
                    </h3>
                    <p className="text-[11px] text-gray-500">
                        Track active and past borrowings at a glance.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden items-center rounded-full border border-gray-200 bg-gray-50 px-2 text-xs text-gray-500 sm:flex">
                        <svg
                            className="mr-1.5 h-3 w-3 text-gray-400"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                cx="7"
                                cy="7"
                                r="3.5"
                                stroke="currentColor"
                                strokeWidth="1.4"
                            />
                            <path
                                d="M9.5 9.5L12 12"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                            />
                        </svg>
                        <input
                            type="search"
                            placeholder="Search equipment"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className="w-32 border-none bg-transparent text-xs outline-none placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        type="button"
                        className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Filter
                    </button>
                </div>
            </header>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b text-xs font-medium uppercase tracking-wide text-gray-500">
                        <tr>
                            <th
                                className="cursor-pointer py-3 pr-4 hover:text-gray-700"
                                onClick={() => toggleSort('equipment')}
                            >
                                Equipment
                            </th>
                            <th className="py-3 pr-4">Tool ID</th>
                            <th
                                className="cursor-pointer py-3 pr-4 hover:text-gray-700"
                                onClick={() => toggleSort('expectedReturnDate')}
                            >
                                Expected Return Date
                            </th>
                            <th className="py-3 pr-4">Status</th>
                            <th className="py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="align-middle text-xs text-gray-700">
                        {paged.map((item) => (
                            <tr
                                key={item.toolId}
                                className="border-b last:border-0 hover:bg-gray-50"
                            >
                                <td className="py-3 pr-4 font-medium">
                                    {item.equipment}
                                </td>
                                <td className="py-3 pr-4">{item.toolId}</td>
                                <td className="py-3 pr-4">
                                    {item.expectedReturnDate}
                                </td>
                                <td className="py-3">
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses(
                                            item.status,
                                        )}`}
                                    >
                                        {statusIcon(item.status)}
                                        {item.status}
                                    </span>
                                </td>
                                <td className="py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
                                        >
                                            View
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                                        >
                                            Return
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className="mt-4 flex items-center justify-between text-[11px] text-gray-500">
                <p>
                    Showing <span className="font-semibold">{paged.length}</span>{' '}
                    of <span className="font-semibold">{total}</span> records
                </p>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className="rounded-full border border-gray-200 px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        disabled
                    >
                        Prev
                    </button>
                    <button
                        type="button"
                        className="rounded-full border border-gray-200 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        disabled={total <= pageSize}
                    >
                        Next
                    </button>
                </div>
            </footer>
        </section>
    );
}

