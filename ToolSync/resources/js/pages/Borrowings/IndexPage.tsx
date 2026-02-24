import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { BorrowingCard, type Borrowing } from '@/Components/Borrowings/BorrowingCard';
import { CancelReservationModal } from '@/Components/Borrowings/CancelReservationModal';
import { ReturnModal } from '@/Components/Borrowings/ReturnModal';
import { EmptyState } from '@/Components/EmptyState';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import type { AllocationDto } from '@/lib/apiTypes';
import { mapAllocationStatusToUi } from '@/lib/apiTypes';
import { apiRequest } from '@/lib/http';

type SharedProps = { auth?: { user?: { id: number } } };
type FilterStatus = 'all' | 'Upcoming' | 'Active' | 'Pending' | 'Overdue' | 'Returned' | 'Cancelled';

function formatUiDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function allocationToBorrowing(allocation: AllocationDto): Borrowing {
    const status = mapAllocationStatusToUi(allocation);
    const borrowDateValue = allocation.borrow_date.slice(0, 10);
    const borrowDate = formatUiDate(`${borrowDateValue}T00:00:00`);
    const dueDate = allocation.expected_return_date.slice(0, 10);
    const returnSource = status === 'Cancelled' ? allocation.cancelled_at : allocation.actual_return_date;
    const returnDate = returnSource ? formatUiDate(returnSource) : undefined;

    return {
        id: allocation.id,
        tool: {
            id: allocation.tool?.id ?? allocation.tool_id,
            name: allocation.tool?.name ?? `Tool #${allocation.tool_id}`,
            slug: allocation.tool?.slug ?? undefined,
            toolId: `TL-${allocation.tool?.id ?? allocation.tool_id}`,
            category: allocation.tool?.category?.name ?? 'Other',
        },
        borrowDateValue,
        borrowDate,
        dueDate,
        returnDate,
        status,
    };
}

export default function IndexPage() {
    const page = usePage<SharedProps>();
    const userId = page.props.auth?.user?.id;

    const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [returnModalBorrowing, setReturnModalBorrowing] = useState<Borrowing | null>(null);
    const [cancelModalBorrowing, setCancelModalBorrowing] = useState<Borrowing | null>(null);
    const [cancelSubmitting, setCancelSubmitting] = useState(false);
    const [returnRequestedIds, setReturnRequestedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (userId == null) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        apiRequest<{ data: AllocationDto[] }>(`/api/tool-allocations?user_id=${userId}`)
            .then((res) => {
                const items = (res.data ?? []).map(allocationToBorrowing);
                setBorrowings(items);

                const pendingIds = new Set<number>();
                for (const item of items) {
                    if (item.status === 'Pending') {
                        pendingIds.add(item.id);
                    }
                }
                setReturnRequestedIds(pendingIds);
            })
            .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load borrowings'))
            .finally(() => setLoading(false));
    }, [userId]);

    const filteredBorrowings = useMemo(() => {
        if (filterStatus === 'all') {
            return borrowings;
        }

        return borrowings.filter((b) => b.status === filterStatus);
    }, [borrowings, filterStatus]);

    const summary = useMemo(() => {
        const upcoming = borrowings.filter((b) => b.status === 'Upcoming').length;
        const active = borrowings.filter((b) => b.status === 'Active').length;
        const pending = borrowings.filter((b) => b.status === 'Pending').length;
        const overdue = borrowings.filter((b) => b.status === 'Overdue').length;
        const returned = borrowings.filter((b) => b.status === 'Returned').length;
        const cancelled = borrowings.filter((b) => b.status === 'Cancelled').length;

        return {
            upcoming,
            active,
            pending,
            overdue,
            returned,
            cancelled,
            total: borrowings.length,
        };
    }, [borrowings]);

    const handleReturn = (borrowing: Borrowing) => {
        setReturnModalBorrowing(borrowing);
    };

    const handleCancel = (borrowing: Borrowing) => {
        setCancelModalBorrowing(borrowing);
    };

    const handleReturnSubmit = async (data: { condition: string; notes: string; imageFiles: File[] }) => {
        if (!returnModalBorrowing) {
            return;
        }

        const noteParts = [`Condition: ${data.condition}`];
        if (data.notes.trim()) {
            noteParts.push(`Notes: ${data.notes.trim()}`);
        }

        try {
            const payload = new FormData();
            payload.append('_method', 'PUT');
            payload.append('status', 'PENDING_RETURN');
            payload.append('note', noteParts.join('\n'));
            payload.append('reported_condition', data.condition);
            for (const imageFile of data.imageFiles) {
                payload.append('return_proof_images[]', imageFile);
            }

            await apiRequest(`/api/tool-allocations/${returnModalBorrowing.id}`, {
                method: 'POST',
                body: payload,
            });

            setBorrowings((prev) =>
                prev.map((item) => (item.id === returnModalBorrowing.id ? { ...item, status: 'Pending' } : item)),
            );
            setReturnRequestedIds((prev) => new Set(prev).add(returnModalBorrowing.id));
            toast(`${returnModalBorrowing.tool.name} return is pending admin verification.`, { icon: 'i', duration: 6000 });
            setReturnModalBorrowing(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to submit return request.');
        }
    };

    const handleCancelSubmit = async (reason: string) => {
        if (!cancelModalBorrowing || cancelSubmitting) {
            return;
        }

        setCancelSubmitting(true);
        try {
            const response = await apiRequest<{ message: string; data: AllocationDto }>(
                `/api/tool-allocations/${cancelModalBorrowing.id}/cancel`,
                {
                    method: 'POST',
                    body: {
                        cancellation_reason: reason || null,
                    },
                },
            );

            const updatedBorrowing = allocationToBorrowing(response.data);
            setBorrowings((prev) => prev.map((item) => (item.id === updatedBorrowing.id ? updatedBorrowing : item)));
            setReturnRequestedIds((prev) => {
                const next = new Set(prev);
                next.delete(updatedBorrowing.id);
                return next;
            });
            toast.success(response.message || `${cancelModalBorrowing.tool.name} reservation was cancelled.`);
            setCancelModalBorrowing(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to cancel reservation.');
        } finally {
            setCancelSubmitting(false);
        }
    };

    return (
        <AppLayout
            activeRoute="borrowings"
            header={
                <>
                    <p className="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">My borrowings</p>
                    <h1 className="text-2xl font-semibold text-gray-900">Track your borrowed equipment</h1>
                    <p className="mt-1 text-xs text-gray-500">
                        Returns require admin approval. Upcoming pickups can be cancelled at least 3 days before pickup.
                    </p>
                </>
            }
        >
            <Head title="My Borrowings" />

            <div className="space-y-6">
                {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</div>}
                {loading && (
                    <div className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        Loading borrowings...
                    </div>
                )}
                {!loading && (
                    <>
                        <section className="flex flex-wrap gap-3 rounded-3xl bg-white px-5 py-3 text-[11px] text-gray-600 shadow-sm">
                            <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1">
                                <span className="font-semibold text-gray-900">{summary.total}</span>
                                <span>Total borrowings</span>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                                <span className="font-semibold">{summary.active}</span>
                                <span>Active</span>
                            </div>
                            {summary.upcoming > 0 && (
                                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                                    <span className="font-semibold">{summary.upcoming}</span>
                                    <span>Upcoming pickup</span>
                                </div>
                            )}
                            {summary.overdue > 0 && (
                                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-rose-700">
                                    <span className="font-semibold">{summary.overdue}</span>
                                    <span>Overdue</span>
                                </div>
                            )}
                            {summary.pending > 0 && (
                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                                    <span className="font-semibold">{summary.pending}</span>
                                    <span>Pending approval</span>
                                </div>
                            )}
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                                <span className="font-semibold">{summary.returned}</span>
                                <span>Returned</span>
                            </div>
                            {summary.cancelled > 0 && (
                                <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                                    <span className="font-semibold">{summary.cancelled}</span>
                                    <span>Cancelled</span>
                                </div>
                            )}
                        </section>

                        <section className="flex flex-col justify-between gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Filter</span>
                                <div className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-1 py-1 text-[11px] text-gray-600 shadow-sm">
                                    {(['all', 'Upcoming', 'Active', 'Pending', 'Overdue', 'Returned', 'Cancelled'] as const).map((status) => (
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
                                              onClick: () => router.visit('/tools'),
                                          }
                                        : undefined
                                }
                            />
                        ) : (
                            <div className="space-y-3">
                                {filteredBorrowings.map((borrowing) => (
                                    <BorrowingCard
                                        key={borrowing.id}
                                        borrowing={borrowing}
                                        onReturn={handleReturn}
                                        onCancel={handleCancel}
                                        returnRequested={returnRequestedIds.has(borrowing.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
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

            {cancelModalBorrowing && (
                <CancelReservationModal
                    show={true}
                    toolName={cancelModalBorrowing.tool.name}
                    pickupDate={cancelModalBorrowing.borrowDateValue}
                    submitting={cancelSubmitting}
                    onClose={() => setCancelModalBorrowing(null)}
                    onSubmit={handleCancelSubmit}
                />
            )}
        </AppLayout>
    );
}

