import { Head, usePage, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { BorrowingCard, type Borrowing } from '@/Components/Borrowings/BorrowingCard';
import { ReturnModal } from '@/Components/Borrowings/ReturnModal';
import { EmptyState } from '@/Components/EmptyState';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import { apiRequest } from '@/lib/http';
import type { AllocationDto } from '@/lib/apiTypes';

type BorrowingsPageProps = {
    borrowings: Borrowing[];
};

type FilterStatus = 'all' | 'Active' | 'Overdue' | 'Returned';

export default function IndexPage() {
    const { borrowings: initialBorrowings } = usePage<BorrowingsPageProps>().props;

    const [borrowings, setBorrowings] = useState<Borrowing[]>(initialBorrowings);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [returnModalBorrowing, setReturnModalBorrowing] = useState<Borrowing | null>(null);

    const filteredBorrowings = useMemo(() => {
        if (filterStatus === 'all') return borrowings;
        return borrowings.filter((b) => b.status === filterStatus);
    }, [borrowings, filterStatus]);

    const summary = useMemo(() => {
        const active = borrowings.filter((b) => b.status === 'Active').length;
        const overdue = borrowings.filter((b) => b.status === 'Overdue').length;
        const returned = borrowings.filter((b) => b.status === 'Returned').length;
        return { active, overdue, returned, total: borrowings.length };
    }, [borrowings]);

    const handleReturn = (borrowing: Borrowing) => {
        setReturnModalBorrowing(borrowing);
    };

    const handleReturnSubmit = async () => {
        if (!returnModalBorrowing) return;

        try {
            const response = await apiRequest<{ message: string; data: AllocationDto }>(
                `/api/tool-allocations/${returnModalBorrowing.id}`,
                {
                    method: 'PUT',
                    body: {
                        status: 'RETURNED',
                    },
                },
            );

            const updated = response.data;

            const formattedReturnDate =
                updated.actual_return_date !== null
                    ? new Date(updated.actual_return_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                      })
                    : undefined;

            setBorrowings((prev) =>
                prev.map((borrowing) =>
                    borrowing.id === returnModalBorrowing.id
                        ? {
                              ...borrowing,
                              status: 'Returned' as const,
                              returnDate: formattedReturnDate,
                          }
                        : borrowing,
                ),
            );

            toast.success(`${returnModalBorrowing.tool.name} has been returned successfully!`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to mark tool as returned.';
            toast.error(message);
        } finally {
            setReturnModalBorrowing(null);
        }
    };

    return (
        <AppLayout
            activeRoute="borrowings"
            header={
                <>
                    <p className="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">My borrowings</p>
                    <h1 className="text-2xl font-semibold text-gray-900">Track your borrowed equipment</h1>
                </>
            }
        >
            <Head title="My Borrowings" />

            <div className="space-y-6">
                <section className="flex flex-wrap gap-3 rounded-3xl bg-white px-5 py-3 text-[11px] text-gray-600 shadow-sm">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1">
                        <span className="font-semibold text-gray-900">{summary.total}</span>
                        <span>Total borrowings</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                        <span className="font-semibold">{summary.active}</span>
                        <span>Active</span>
                    </div>
                    {summary.overdue > 0 && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-rose-700">
                            <span className="font-semibold">{summary.overdue}</span>
                            <span>Overdue</span>
                        </div>
                    )}
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                        <span className="font-semibold">{summary.returned}</span>
                        <span>Returned</span>
                    </div>
                </section>

                <section className="flex flex-col justify-between gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Filter</span>
                        <div className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-1 py-1 text-[11px] text-gray-600 shadow-sm">
                            {(['all', 'Active', 'Overdue', 'Returned'] as const).map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFilterStatus(status)}
                                    className={`rounded-full px-3 py-1 capitalize ${
                                        filterStatus === status ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {status === 'all' ? 'All' : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Link
                        href="/tools"
                        className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        Borrow New Tool
                    </Link>
                </section>

                {filteredBorrowings.length === 0 ? (
                    <EmptyState
                        icon={
                            <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M20 14V20L24 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        }
                        title={filterStatus === 'all' ? "You haven't borrowed any tools yet" : `No ${filterStatus.toLowerCase()} borrowings`}
                        description={
                            filterStatus === 'all'
                                ? 'Browse our tool catalog and request to borrow equipment for your projects.'
                                : 'Try changing the filter to see other borrowings.'
                        }
                        action={
                            filterStatus === 'all'
                                ? {
                                      label: 'Browse Tools',
                                      onClick: () => {},
                                  }
                                : undefined
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {filteredBorrowings.map((borrowing) => (
                            <BorrowingCard key={borrowing.id} borrowing={borrowing} onReturn={handleReturn} />
                        ))}
                    </div>
                )}
            </div>

            {returnModalBorrowing && (
                <ReturnModal
                    show={true}
                    toolName={returnModalBorrowing.tool.name}
                    toolId={returnModalBorrowing.tool.toolId}
                    onClose={() => setReturnModalBorrowing(null)}
                    onSubmit={handleReturnSubmit}
                />
            )}
        </AppLayout>
    );
}
