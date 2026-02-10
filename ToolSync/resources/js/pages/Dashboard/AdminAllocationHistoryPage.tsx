import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Modal from '@/Components/Modal';
import AppLayout from '@/Layouts/AppLayout';
import { toast } from '@/Components/Toast';
import { apiRequest } from '@/lib/http';
import type {
    AllocationHistoryItem,
    AllocationHistoryPaginated,
    AllocationHistorySummary,
} from '@/lib/apiTypes';
import { mapAllocationStatusToUi } from '@/lib/apiTypes';

type AllocationStatus = 'Returned' | 'Active' | 'Overdue';

type Allocation = {
    id: number;
    tool: string;
    toolId: string;
    category: string;
    borrower: string;
    borrowDate: string;
    expectedReturn: string;
    status: AllocationStatus;
    statusDetail?: string;
};

function mapHistoryItemToAllocation(a: AllocationHistoryItem): Allocation {
    const status = mapAllocationStatusToUi(a) as AllocationStatus;
    const borrowDate = new Date(a.borrow_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const expectedReturn = new Date(a.expected_return_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    let statusDetail = '';
    if (a.status === 'RETURNED' && a.actual_return_date) {
        statusDetail = `Returned on ${new Date(a.actual_return_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    } else if (status === 'Overdue') {
        statusDetail = `Overdue since ${expectedReturn}`;
    } else {
        statusDetail = `Due on ${expectedReturn}`;
    }

    return {
        id: a.id,
        tool: a.tool?.name ?? 'Unknown',
        toolId: 'TL-' + a.tool_id,
        category: 'Other',
        borrower: a.user?.email ?? a.user?.name ?? 'Unknown',
        borrowDate,
        expectedReturn,
        status,
        statusDetail,
    };
}

type SortKey = 'tool' | 'borrowDate' | 'expectedReturn' | 'status';

function statusClasses(status: AllocationStatus): string {
    if (status === 'Returned') {
        return 'bg-emerald-50 text-emerald-700';
    }

    if (status === 'Active') {
        return 'bg-amber-50 text-amber-700';
    }

    return 'bg-rose-50 text-rose-700';
}

function statusIcon(status: AllocationStatus): ReactNode {
    if (status === 'Returned') {
        return (
            <svg className="mr-1.5 h-3 w-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8.5L6.5 11L12 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    if (status === 'Active') {
        return (
            <svg className="mr-1.5 h-3 w-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3.5V8L11 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        );
    }

    return (
        <svg className="mr-1.5 h-3 w-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 4.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="8" cy="10.5" r="0.8" fill="currentColor" />
            <circle cx="8" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
    );
}

const PAGE_SIZE = 20;

function buildHistoryParams(page: number, statusFilter: 'all' | AllocationStatus): string {
    const params = new URLSearchParams();
    params.set('per_page', String(PAGE_SIZE));
    params.set('page', String(page));
    if (statusFilter === 'Active') params.set('status', 'BORROWED');
    else if (statusFilter === 'Returned') params.set('status', 'RETURNED');
    else if (statusFilter === 'Overdue') {
        params.set('status', 'BORROWED');
        params.set('overdue', '1');
    }
    return params.toString();
}

export default function AdminAllocationHistoryPage() {
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [totalFromApi, setTotalFromApi] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summaryCounts, setSummaryCounts] = useState({ total: 0, returned: 0, active: 0, overdue: 0 });
    const [returningId, setReturningId] = useState<number | null>(null);

    const [statusFilter, setStatusFilter] = useState<'all' | AllocationStatus>(() => {
        if (typeof window === 'undefined') return 'all';
        return new URLSearchParams(window.location.search).get('overdue') === '1' ? 'Overdue' : 'all';
    });
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortKey>('borrowDate');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);

    const loadSummary = useCallback(async () => {
        try {
            const res = await apiRequest<AllocationHistorySummary>('/api/tool-allocations/history/summary');
            setSummaryCounts(res.data);
        } catch {
            setSummaryCounts({ total: 0, returned: 0, active: 0, overdue: 0 });
        }
    }, []);

    const loadHistory = useCallback(
        async (pageNum: number) => {
            setLoading(true);
            setError(null);
            try {
                const query = buildHistoryParams(pageNum, statusFilter);
                const res = await apiRequest<AllocationHistoryPaginated>(
                    `/api/tool-allocations/history?${query}`,
                );
                setAllocations((res.data ?? []).map(mapHistoryItemToAllocation));
                setTotalFromApi(res.total ?? 0);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load allocation history');
                setAllocations([]);
                setTotalFromApi(0);
            } finally {
                setLoading(false);
            }
        },
        [statusFilter],
    );

    const buildExportQuery = useCallback((): string => {
        const url = new URL('/api/tool-allocations/export', window.location.origin);
        if (statusFilter === 'Active') url.searchParams.set('status', 'BORROWED');
        else if (statusFilter === 'Returned') url.searchParams.set('status', 'RETURNED');
        else if (statusFilter === 'Overdue') {
            url.searchParams.set('status', 'BORROWED');
            url.searchParams.set('overdue', '1');
        }
        return url.toString();
    }, [statusFilter]);

    const handleExportCsv = useCallback(async () => {
        try {
            const response = await fetch(buildExportQuery(), {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) throw new Error(response.statusText || 'Failed to export CSV');
            const blob = await response.blob();
            const contentDisposition = response.headers.get('content-disposition') ?? '';
            const match = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
            const filename = match?.[1] ?? 'tool_allocations.csv';
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to export CSV');
        }
    }, [buildExportQuery]);

    const handleReturnTool = useCallback(
        async (row: Allocation) => {
            setReturningId(row.id);
            try {
                await apiRequest(`/api/tool-allocations/${row.id}`, {
                    method: 'PUT',
                    body: { status: 'RETURNED' },
                });
                toast.success(`Tool "${row.tool}" marked as returned.`);
                await loadSummary();
                await loadHistory(page);
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to mark as returned';
                toast.error(msg);
            } finally {
                setReturningId(null);
            }
        },
        [page, loadSummary, loadHistory],
    );

    // Load summary on mount; refetch history when page or statusFilter changes
    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    useEffect(() => {
        loadHistory(page);
    }, [page, statusFilter, loadHistory]);


    const summary = summaryCounts;

    const filteredAndSorted = useMemo(() => {
        const query = search.trim().toLowerCase();
        const base = query
            ? allocations.filter((a) =>
                  `${a.tool} ${a.borrower}`.toLowerCase().includes(query),
              )
            : allocations;
        const direction = sortDir === 'asc' ? 1 : -1;
        return [...base].sort((first, second) => {
            if (sortBy === 'tool') return first.tool.localeCompare(second.tool) * direction;
            if (sortBy === 'status') return first.status.localeCompare(second.status) * direction;
            if (sortBy === 'expectedReturn')
                return first.expectedReturn.localeCompare(second.expectedReturn) * direction;
            return first.borrowDate.localeCompare(second.borrowDate) * direction;
        });
    }, [allocations, search, sortBy, sortDir]);

    const totalPages = Math.max(1, Math.ceil(totalFromApi / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginated = filteredAndSorted;
    const endIndex = startIndex + paginated.length;

    const toggleSort = (key: SortKey): void => {
        setSortBy((previousKey) => {
            if (previousKey === key) {
                setSortDir((previousDir) => (previousDir === 'asc' ? 'desc' : 'asc'));
                return previousKey;
            }

            setSortDir('asc');
            return key;
        });
    };

    // Persist user preferences locally so they survive navigation.
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const payload = {
            statusFilter,
            search,
            sortBy,
            sortDir,
        };

        window.localStorage.setItem('admin-allocation-history-preferences', JSON.stringify(payload));
    }, [search, sortBy, sortDir, statusFilter]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const raw = window.localStorage.getItem('admin-allocation-history-preferences') ?? '';

        if (!raw) {
            return;
        }

        try {
            const parsed = JSON.parse(raw) as Partial<{
                statusFilter: 'all' | AllocationStatus;
                search: string;
                sortBy: SortKey;
                sortDir: 'asc' | 'desc';
            }>;

            if (parsed.statusFilter && new URLSearchParams(window.location.search).get('overdue') !== '1') {
                setStatusFilter(parsed.statusFilter);
            }

            if (typeof parsed.search === 'string') {
                setSearch(parsed.search);
            }

            if (parsed.sortBy) {
                setSortBy(parsed.sortBy);
            }

            if (parsed.sortDir) {
                setSortDir(parsed.sortDir);
            }
        } catch {
            // If parsing fails, ignore and fall back to defaults.
        }
    }, []);

    // Keyboard shortcut: press "/" to focus the search input (if not already typing).
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handler = (event: KeyboardEvent): void => {
            if (event.key !== '/') {
                return;
            }

            const target = event.target as HTMLElement | null;
            if (!target) {
                return;
            }

            const tagName = target.tagName.toLowerCase();
            if (tagName === 'input' || tagName === 'textarea') {
                return;
            }

            event.preventDefault();
            searchInputRef.current?.focus();
        };

        window.addEventListener('keydown', handler);

        return () => {
            window.removeEventListener('keydown', handler);
        };
    }, []);

    return (
        <AppLayout
            variant="admin"
            activeRoute="admin-allocation-history"
            header={
                <>
                    <p className="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">Allocation history</p>
                    <h1 className="text-2xl font-semibold text-gray-900">System-wide borrowing and return records</h1>
                </>
            }
        >
            <Head title="Allocation History" />

            {loading && (
                <div className="rounded-3xl bg-white px-5 py-12 text-center text-gray-500 shadow-sm">
                    Loading allocation history…
                </div>
            )}
            {error && (
                <div className="rounded-3xl bg-red-50 px-5 py-4 text-red-700 shadow-sm">
                    {error}
                </div>
            )}
            {!loading && !error && (
            <div className="space-y-6">
                {/* Summary + overdue risk strip */}
                <section className="flex flex-wrap gap-3 rounded-3xl bg-white px-5 py-3 text-[11px] text-gray-600 shadow-sm">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1">
                        <span className="font-semibold text-gray-900">{summary.total}</span>
                        <span>Total records</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                        <span className="font-semibold">{summary.returned}</span>
                        <span>Returned</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                        <span className="font-semibold">{summary.active}</span>
                        <span>Active</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-rose-700">
                        <span className="font-semibold">{summary.overdue}</span>
                        <span>Overdue</span>
                    </div>
                    {summary.overdue > 0 && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-rose-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span className="font-semibold">Attention needed</span>
                            <span>{summary.overdue} tools are currently overdue.</span>
                        </div>
                    )}
                </section>

                {/* Filters and search */}
                <section className="flex flex-col justify-between gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Filter by status</span>
                        <div className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-1 py-1 text-[11px] text-gray-600 shadow-sm">
                            {(['all', 'Active', 'Returned', 'Overdue'] as const).map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter(value);
                                        setPage(1);
                                    }}
                                    className={`rounded-full px-3 py-1 capitalize ${
                                        statusFilter === value ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {value === 'all' ? 'All' : value}
                                </button>
                            ))}
                        </div>
                        {(statusFilter !== 'all' || search.trim() !== '') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setStatusFilter('all');
                                    setSearch('');
                                    setPage(1);
                                }}
                                className="text-[11px] font-medium text-blue-600 underline-offset-2 hover:underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center rounded-full bg-gray-50 px-3 py-1.5 text-xs text-gray-500 shadow-sm">
                            <svg className="mr-2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="9" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.6" />
                                <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                            <input
                                type="search"
                                placeholder="Search by tool, user name or email..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                ref={searchInputRef}
                                className="w-56 border-none bg-transparent text-xs outline-none placeholder:text-gray-400"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleExportCsv}
                            className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-sm hover:bg-amber-300"
                        >
                            <span>Export CSV</span>
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 3V13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                <path
                                    d="M6 9.5L10 13.5L14 9.5"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path d="M5 15.5H15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm">
                    {paginated.length === 0 ? (
                        <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center">
                            <p className="text-xs font-medium text-gray-600">No records match your filters</p>
                            <p className="mt-1 text-[11px] text-gray-500">Try adjusting the status or search by a different tool or borrower.</p>
                        </div>
                    ) : (
                        <div className="max-h-[460px] overflow-x-auto overflow-y-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="sticky top-0 z-10 border-b bg-white/90 text-xs font-medium tracking-wide text-gray-500 uppercase backdrop-blur">
                                    <tr>
                                        <th className="py-3 pr-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleSort('tool')}
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                                aria-sort={sortBy === 'tool' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                                            >
                                                Tool
                                                {sortBy === 'tool' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                            </button>
                                        </th>
                                        <th className="py-3 pr-4">Borrower</th>
                                        <th className="py-3 pr-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleSort('borrowDate')}
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                                aria-sort={sortBy === 'borrowDate' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                                            >
                                                Borrow date
                                                {sortBy === 'borrowDate' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                            </button>
                                        </th>
                                        <th className="py-3 pr-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleSort('expectedReturn')}
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                                aria-sort={sortBy === 'expectedReturn' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                                            >
                                                Expected return
                                                {sortBy === 'expectedReturn' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                            </button>
                                        </th>
                                        <th className="py-3 pr-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleSort('status')}
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                                aria-sort={sortBy === 'status' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                                            >
                                                Status
                                                {sortBy === 'status' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                            </button>
                                        </th>
                                        <th className="py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="align-middle text-xs text-gray-700">
                                    {paginated.map((row, index) => {
                                        const isEven = index % 2 === 0;
                                        const isReturned = row.status === 'Returned';

                                        return (
                                            <tr
                                                key={row.id}
                                                className={`border-b last:border-0 ${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100/80`}
                                            >
                                                <td className="py-3 pr-4 font-medium">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedAllocation(row)}
                                                        className="text-left text-xs font-semibold text-gray-900 underline-offset-2 hover:underline"
                                                    >
                                                        {row.tool}
                                                    </button>
                                                </td>
                                                <td className="py-3 pr-4">{row.borrower}</td>
                                                <td className="py-3 pr-4">{row.borrowDate}</td>
                                                <td className="py-3 pr-4">{row.expectedReturn}</td>
                                                <td className="py-3 pr-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses(
                                                            row.status,
                                                        )}`}
                                                    >
                                                        {statusIcon(row.status)}
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    {isReturned ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedAllocation(row)}
                                                            className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                                                        >
                                                            View details
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReturnTool(row)}
                                                            disabled={returningId === row.id}
                                                            className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                                        >
                                                            {returningId === row.id ? 'Returning…' : 'Return Tool'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {(totalFromApi > 0 || paginated.length > 0) && (
                        <footer className="mt-4 flex items-center justify-between text-[11px] text-gray-500">
                            <p>
                                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                                <span className="font-semibold">{startIndex + paginated.length}</span> of{' '}
                                <span className="font-semibold">{totalFromApi}</span> records
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <span>
                                    Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </footer>
                    )}
                </section>
                <Modal show={selectedAllocation !== null} maxWidth="md" onClose={() => setSelectedAllocation(null)}>
                    {selectedAllocation && (
                        <div className="overflow-hidden rounded-lg">
                            <div className="bg-gradient-to-r from-slate-900 to-sky-600 px-6 py-4 text-white">
                                <h2 className="text-sm font-semibold">View Borrow Details</h2>
                            </div>
                            <div className="space-y-4 bg-white px-6 py-5 text-sm text-gray-800">
                                <div className="border-b border-gray-200 pb-3">
                                    <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Name of Tool</p>
                                    <p className="mt-1 text-sm font-medium text-gray-900">{selectedAllocation.tool}</p>
                                </div>
                                <div className="border-b border-gray-200 pb-3">
                                    <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Tool ID</p>
                                    <p className="mt-1 text-sm font-medium text-gray-900">{selectedAllocation.toolId}</p>
                                </div>
                                <div className="border-b border-gray-200 pb-3">
                                    <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Category</p>
                                    <p className="mt-1 text-sm font-medium text-gray-900">{selectedAllocation.category}</p>
                                </div>
                                <div className="border-b border-gray-200 pb-3">
                                    <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Borrower</p>
                                    <p className="mt-1 text-sm font-medium text-gray-900">{selectedAllocation.borrower}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Borrow date</p>
                                    <p className="mt-1 text-sm font-medium text-gray-900">{selectedAllocation.borrowDate}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Expected return</p>
                                    <p className="mt-1 text-sm font-medium text-gray-900">{selectedAllocation.expectedReturn}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Status</p>
                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        {selectedAllocation.status}{' '}
                                        {selectedAllocation.statusDetail && (
                                            <span className="block text-[11px] font-normal text-gray-600">{selectedAllocation.statusDetail}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="border-t bg-gray-50 px-6 py-3 text-right">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAllocation(null)}
                                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-black"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
            )}
        </AppLayout>
    );
}
