import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@/Components/EmptyState';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import type {
    ApprovalBorrowRequest,
    ApprovalReturnRequest,
    ApprovalsApiResponse,
} from '@/lib/apiTypes';
import { apiRequest } from '@/lib/http';

type Tab = 'borrow' | 'return';

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
}

export default function IndexPage() {
    const [tab, setTab] = useState<Tab>('borrow');
    const [borrowRequests, setBorrowRequests] = useState<ApprovalBorrowRequest[]>([]);
    const [returnRequests, setReturnRequests] = useState<ApprovalReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionId, setActionId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const loadApprovals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiRequest<ApprovalsApiResponse>('/api/admin/approvals');
            setBorrowRequests(res.data.borrow_requests);
            setReturnRequests(res.data.return_requests);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load approvals');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadApprovals();
    }, [loadApprovals]);

    const handleApproveBorrow = useCallback(
        async (id: number) => {
            setActionId(`borrow-${id}`);
            try {
                await apiRequest(`/api/reservations/${id}/approve`, { method: 'POST' });
                toast.success('Borrow request approved.');
                await loadApprovals();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to approve');
            } finally {
                setActionId(null);
            }
        },
        [loadApprovals],
    );

    const handleDeclineBorrow = useCallback(
        async (id: number) => {
            setActionId(`borrow-${id}`);
            try {
                await apiRequest(`/api/reservations/${id}/decline`, { method: 'POST' });
                toast.success('Borrow request declined.');
                await loadApprovals();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to decline');
            } finally {
                setActionId(null);
            }
        },
        [loadApprovals],
    );

    const handleApproveReturn = useCallback(
        async (id: number) => {
            setActionId(`return-${id}`);
            try {
                await apiRequest(`/api/tool-allocations/${id}`, {
                    method: 'PUT',
                    body: { status: 'RETURNED' },
                });
                toast.success('Return approved. Tool marked as returned.');
                await loadApprovals();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to approve return');
            } finally {
                setActionId(null);
            }
        },
        [loadApprovals],
    );

    const handleDeclineReturn = useCallback(
        async (id: number) => {
            setActionId(`return-${id}`);
            try {
                await apiRequest(`/api/tool-allocations/${id}`, {
                    method: 'PUT',
                    body: { status: 'BORROWED' },
                });
                toast.success('Return request declined. Tool stays on borrower.');
                await loadApprovals();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to decline return');
            } finally {
                setActionId(null);
            }
        },
        [loadApprovals],
    );

    const query = search.toLowerCase().trim();

    const filteredBorrow = useMemo(
        () =>
            query
                ? borrowRequests.filter(
                      (r) =>
                          r.tool_name.toLowerCase().includes(query) ||
                          r.user_name.toLowerCase().includes(query) ||
                          (r.user_email?.toLowerCase().includes(query) ?? false),
                  )
                : borrowRequests,
        [borrowRequests, query],
    );

    const filteredReturn = useMemo(
        () =>
            query
                ? returnRequests.filter(
                      (r) =>
                          r.tool_name.toLowerCase().includes(query) ||
                          r.user_name.toLowerCase().includes(query) ||
                          (r.user_email?.toLowerCase().includes(query) ?? false),
                  )
                : returnRequests,
        [returnRequests, query],
    );

    const totalPending = borrowRequests.length + returnRequests.length;

    return (
        <AppLayout
            variant="admin"
            activeRoute="admin-approvals"
            header={
                <>
                    <p className="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">Approval center</p>
                    <h1 className="text-2xl font-semibold text-gray-900">Review and manage pending requests</h1>
                </>
            }
        >
            <Head title="Approvals" />

            <div className="space-y-6">
                {/* Summary strip */}
                <section className="flex flex-col gap-3 rounded-3xl bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500">Pending requests</p>
                        <p className="text-sm text-gray-700">
                            {totalPending === 0
                                ? 'No pending requests at this time.'
                                : `${totalPending} request${totalPending !== 1 ? 's' : ''} awaiting your review.`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500">
                            <svg className="h-3 w-3 shrink-0 text-gray-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="7" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
                                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                            <input
                                type="search"
                                placeholder="Search by tool or user..."
                                className="w-40 border-none bg-transparent text-xs outline-none placeholder:text-gray-400 sm:w-56"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={loadApprovals}
                            disabled={loading}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                            <svg className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M14 8A6 6 0 1 1 8 2"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        Loading approvals...
                    </div>
                )}

                {!loading && (
                    <>
                        {/* Tab switcher */}
                        <div className="flex items-center gap-1 rounded-full bg-white px-1 py-1 text-[11px] text-gray-600 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setTab('borrow')}
                                className={`rounded-full px-4 py-1.5 font-medium ${
                                    tab === 'borrow' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Borrow requests
                                {borrowRequests.length > 0 && (
                                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-100 px-1 text-[10px] font-semibold text-blue-700">
                                        {borrowRequests.length}
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab('return')}
                                className={`rounded-full px-4 py-1.5 font-medium ${
                                    tab === 'return' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Return requests
                                {returnRequests.length > 0 && (
                                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">
                                        {returnRequests.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Borrow requests tab */}
                        {tab === 'borrow' && (
                            <section className="space-y-3">
                                {filteredBorrow.length === 0 ? (
                                    <EmptyState
                                        icon={
                                            <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M10 6H30V28L20 34L10 28V6Z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path d="M15 19L19 23L26 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        }
                                        title={query ? 'No matching borrow requests' : 'No pending borrow requests'}
                                        description={query ? 'Try adjusting your search.' : 'When users request to borrow tools, their requests will appear here.'}
                                    />
                                ) : (
                                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                                    <th className="px-4 py-3">Tool</th>
                                                    <th className="px-4 py-3">Requested by</th>
                                                    <th className="hidden px-4 py-3 md:table-cell">Date range</th>
                                                    <th className="hidden px-4 py-3 sm:table-cell">Submitted</th>
                                                    <th className="px-4 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredBorrow.map((req) => (
                                                    <BorrowRow
                                                        key={req.id}
                                                        request={req}
                                                        isActing={actionId === `borrow-${req.id}`}
                                                        onApprove={() => handleApproveBorrow(req.id)}
                                                        onDecline={() => handleDeclineBorrow(req.id)}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Return requests tab */}
                        {tab === 'return' && (
                            <section className="space-y-3">
                                {filteredReturn.length === 0 ? (
                                    <EmptyState
                                        icon={
                                            <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M28 12L12 28M12 12L28 28"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                                <rect x="6" y="6" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                        }
                                        title={query ? 'No matching return requests' : 'No pending return requests'}
                                        description={query ? 'Try adjusting your search.' : 'When users request to return tools, their requests will appear here.'}
                                    />
                                ) : (
                                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                                    <th className="px-4 py-3">Tool</th>
                                                    <th className="px-4 py-3">Borrower</th>
                                                    <th className="hidden px-4 py-3 md:table-cell">Borrow period</th>
                                                    <th className="hidden px-4 py-3 sm:table-cell">Note</th>
                                                    <th className="px-4 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredReturn.map((req) => (
                                                    <ReturnRow
                                                        key={req.id}
                                                        request={req}
                                                        isActing={actionId === `return-${req.id}`}
                                                        onApprove={() => handleApproveReturn(req.id)}
                                                        onDecline={() => handleDeclineReturn(req.id)}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function BorrowRow({
    request,
    isActing,
    onApprove,
    onDecline,
}: {
    request: ApprovalBorrowRequest;
    isActing: boolean;
    onApprove: () => void;
    onDecline: () => void;
}) {
    const toolCode = request.tool_code?.trim() ? request.tool_code : `TL-${request.tool_id}`;

    return (
        <tr className="hover:bg-gray-50/50">
            <td className="px-4 py-3">
                <p className="font-semibold text-gray-900">{request.tool_name}</p>
                <p className="text-[11px] text-gray-500">{toolCode}</p>
            </td>
            <td className="px-4 py-3">
                <p className="font-medium text-gray-800">{request.user_name}</p>
                {request.user_email && (
                    <p className="text-[11px] text-gray-500">{request.user_email}</p>
                )}
            </td>
            <td className="hidden px-4 py-3 md:table-cell">
                <p className="text-gray-700">
                    {formatDate(request.start_date)} — {formatDate(request.end_date)}
                </p>
            </td>
            <td className="hidden px-4 py-3 sm:table-cell">
                <p className="text-gray-500">{timeAgo(request.created_at)}</p>
            </td>
            <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={onApprove}
                        disabled={isActing}
                        className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                        {isActing ? '...' : 'Approve'}
                    </button>
                    <button
                        type="button"
                        onClick={onDecline}
                        disabled={isActing}
                        className="rounded-full border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                    >
                        Decline
                    </button>
                </div>
            </td>
        </tr>
    );
}

function ReturnRow({
    request,
    isActing,
    onApprove,
    onDecline,
}: {
    request: ApprovalReturnRequest;
    isActing: boolean;
    onApprove: () => void;
    onDecline: () => void;
}) {
    const toolCode = request.tool_code?.trim() ? request.tool_code : `TL-${request.tool_id}`;

    return (
        <tr className="hover:bg-gray-50/50">
            <td className="px-4 py-3">
                <p className="font-semibold text-gray-900">{request.tool_name}</p>
                <p className="text-[11px] text-gray-500">{toolCode}</p>
            </td>
            <td className="px-4 py-3">
                <p className="font-medium text-gray-800">{request.user_name}</p>
                {request.user_email && (
                    <p className="text-[11px] text-gray-500">{request.user_email}</p>
                )}
            </td>
            <td className="hidden px-4 py-3 md:table-cell">
                <p className="text-gray-700">
                    {formatDate(request.borrow_date)} — {formatDate(request.expected_return_date)}
                </p>
            </td>
            <td className="hidden px-4 py-3 sm:table-cell">
                <p className="max-w-[180px] truncate text-gray-500" title={request.note ?? undefined}>
                    {request.note || '—'}
                </p>
            </td>
            <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={onApprove}
                        disabled={isActing}
                        className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                        {isActing ? '...' : 'Approve'}
                    </button>
                    <button
                        type="button"
                        onClick={onDecline}
                        disabled={isActing}
                        className="rounded-full border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                    >
                        Decline
                    </button>
                </div>
            </td>
        </tr>
    );
}
