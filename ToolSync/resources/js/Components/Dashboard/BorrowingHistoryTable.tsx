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

export function BorrowingHistoryTable({ items }: BorrowingHistoryTableProps) {
    return (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                    Overview of Borrowing History
                </h3>
            </header>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b text-xs font-medium uppercase tracking-wide text-gray-500">
                        <tr>
                            <th className="py-3 pr-4">Equipment</th>
                            <th className="py-3 pr-4">Tool ID</th>
                            <th className="py-3 pr-4">Expected Return Date</th>
                            <th className="py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="align-middle text-xs text-gray-700">
                        {items.map((item) => (
                            <tr key={item.toolId} className="border-b last:border-0">
                                <td className="py-3 pr-4 font-medium">
                                    {item.equipment}
                                </td>
                                <td className="py-3 pr-4">{item.toolId}</td>
                                <td className="py-3 pr-4">
                                    {item.expectedReturnDate}
                                </td>
                                <td className="py-3">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses(
                                            item.status,
                                        )}`}
                                    >
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

