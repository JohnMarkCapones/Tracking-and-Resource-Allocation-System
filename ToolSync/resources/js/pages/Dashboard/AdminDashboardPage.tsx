import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminStatBar } from '@/Components/Dashboard/AdminStatBar';
import type { BorrowingStatusSegment } from '@/Components/Dashboard/BorrowingStatusDonut';
import { BorrowingStatusDonut } from '@/Components/Dashboard/BorrowingStatusDonut';
import type { MostBorrowedTool } from '@/Components/Dashboard/MostBorrowedBarChart';
import { MostBorrowedBarChart } from '@/Components/Dashboard/MostBorrowedBarChart';
import AppLayout from '@/Layouts/AppLayout';
import { toast } from '@/Components/Toast';
import { CreateEditModal, type ToolFormData } from '@/pages/Admin/Tools/CreateEditModal';
import { apiRequest } from '@/lib/http';
import type {
    DashboardApiResponse,
    DashboardPendingApproval,
    DashboardRecentActivityItem,
} from '@/lib/apiTypes';
import type { AnalyticsOverviewApiResponse } from '@/lib/apiTypes';

type AdminMetrics = {
    totalTools: number;
    availableTools: number;
    borrowedTools: number;
    toolsUnderMaintenance: number;
    totalUsers: number;
    activeBorrowings: number;
};

type AdminDashboardPageProps = {
    metrics: AdminMetrics;
    mostBorrowedTools: MostBorrowedTool[];
    borrowingStatus: BorrowingStatusSegment[];
};

type ActivityTone = 'borrowing' | 'maintenance' | 'user';

type RecentActivityItem = {
    id: number;
    title: string;
    description: string;
    timeAgo: string;
    tone: ActivityTone;
};

function activityToneClasses(tone: ActivityTone): string {
    if (tone === 'borrowing') return 'bg-blue-500';
    if (tone === 'maintenance') return 'bg-amber-500';
    return 'bg-emerald-500';
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

function mapRecentActivityToItem(a: DashboardRecentActivityItem): RecentActivityItem {
    const date = new Date(a.borrow_date ?? a.expected_return_date ?? 0);
    const tone: ActivityTone = a.is_overdue ? 'maintenance' : a.status === 'RETURNED' ? 'borrowing' : 'borrowing';
    const title =
        a.status === 'RETURNED'
            ? `${a.tool_name ?? 'Tool'} returned`
            : a.is_overdue
              ? `${a.tool_name ?? 'Tool'} overdue`
              : `${a.tool_name ?? 'Tool'} borrowed`;
    const description =
        a.user_name ? `${a.user_name}` : 'System';
    return {
        id: a.id,
        title,
        description,
        timeAgo: formatTimeAgo(date),
        tone,
    };
}

function getRangeParams(range: '7d' | '30d' | '90d'): { from: string; to: string } {
    const to = new Date();
    const from = new Date();
    if (range === '7d') from.setDate(to.getDate() - 7);
    else if (range === '30d') from.setDate(to.getDate() - 30);
    else from.setDate(to.getDate() - 90);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export default function AdminDashboardPage() {
    const fallbackProps = usePage<AdminDashboardPageProps>().props;
    const [metrics, setMetrics] = useState<AdminMetrics>(fallbackProps.metrics);
    const [mostBorrowedTools, setMostBorrowedTools] = useState<MostBorrowedTool[]>(
        fallbackProps.mostBorrowedTools?.length ? fallbackProps.mostBorrowedTools : [],
    );
    const [borrowingStatus, setBorrowingStatus] = useState<BorrowingStatusSegment[]>(
        fallbackProps.borrowingStatus ?? [
            { label: 'Returned', value: 0 },
            { label: 'Active', value: 0 },
        ],
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
    const [isAddToolModalOpen, setIsAddToolModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingApprovals, setPendingApprovals] = useState<DashboardPendingApproval[]>([]);
    const [overdueCount, setOverdueCount] = useState(0);
    const [maintenanceDueCount, setMaintenanceDueCount] = useState(0);
    const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
    const [addToolCategories, setAddToolCategories] = useState<Array<{ id: number; name: string }>>([]);

    const { from, to } = useMemo(() => getRangeParams(timeRange), [timeRange]);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiRequest<DashboardApiResponse>('/api/dashboard?recent_limit=15');
            const d = res.data;
            const c = d.counts;
            const total =
                c.tools_available_quantity + c.tools_maintenance_quantity + c.borrowed_active_count;
            setMetrics({
                totalTools: total,
                availableTools: c.tools_available_quantity,
                borrowedTools: c.borrowed_active_count,
                toolsUnderMaintenance: c.tools_maintenance_quantity,
                totalUsers: d.total_users ?? 0,
                activeBorrowings: c.borrowed_active_count,
            });
            setBorrowingStatus([
                { label: 'Returned', value: d.summary.returned_count },
                { label: 'Active', value: d.summary.not_returned_count },
            ]);
            setPendingApprovals(d.pending_approvals ?? []);
            setOverdueCount(c.overdue_count);
            setMaintenanceDueCount(d.maintenance_due_count ?? 0);
            setRecentActivity((d.recent_activity ?? []).map(mapRecentActivityToItem));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadAnalytics = useCallback(async () => {
        try {
            const res = await apiRequest<AnalyticsOverviewApiResponse>(
                `/api/analytics/overview?from=${from}&to=${to}`,
            );
            const data = res.data;
            setMostBorrowedTools(
                (data.top_tools ?? []).map((t) => ({ name: t.tool_name, count: t.borrow_count })),
            );
            const b = data.status_breakdown;
            if (b) {
                setBorrowingStatus([
                    { label: 'Returned', value: b.returned },
                    { label: 'Active', value: b.borrowed },
                ]);
            }
        } catch {
            setMostBorrowedTools([]);
        }
    }, [from, to]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        loadAnalytics();
    }, [from, to]);

    const handleExportCsv = useCallback(async () => {
        try {
            const response = await fetch('/api/tool-allocations/export', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(response.statusText || 'Failed to export CSV');
            }

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
            const message = err instanceof Error ? err.message : 'Failed to export CSV';
            toast.error(message);
        }
    }, []);

    const handleSearchSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const q = searchQuery.trim();
            if (q) router.visit(`/admin/tools?search=${encodeURIComponent(q)}`);
            else router.visit('/admin/tools');
        },
        [searchQuery],
    );

    const handleAddToolSave = useCallback(
        async (data: ToolFormData) => {
            const id = addToolCategories.find((c) => c.name === data.category)?.id;
            if (id === undefined) {
                toast.error('Please select a valid category');
                return;
            }
            try {
                await apiRequest('/api/tools', {
                    method: 'POST',
                    body: {
                        name: data.name,
                        description: data.description || null,
                        category_id: id,
                        status:
                            data.status === 'Borrowed'
                                ? 'BORROWED'
                                : data.status === 'Maintenance'
                                  ? 'MAINTENANCE'
                                  : 'AVAILABLE',
                        quantity: data.quantity,
                    },
                });
                setIsAddToolModalOpen(false);
                toast.success(`${data.name} has been added.`);
                router.visit('/admin/tools');
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to add tool');
            }
        },
        [addToolCategories],
    );

    useEffect(() => {
        if (!isAddToolModalOpen) return;
        apiRequest<{ data: Array<{ id: number; name: string }> }>('/api/tool-categories').then((res) =>
            setAddToolCategories(res.data ?? []),
        );
    }, [isAddToolModalOpen]);

    const displayTools = mostBorrowedTools;
    const displayBorrowingStatus = borrowingStatus;

    return (
        <AppLayout
            variant="admin"
            activeRoute="admin-dashboard"
            header={
                <>
                    <p className="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">Admin dashboard</p>
                    <h1 className="text-2xl font-semibold text-gray-900">System-wide overview and analytics</h1>
                </>
            }
        >
            <Head title="Admin Dashboard" />

            {loading && (
                <div className="rounded-3xl bg-white px-5 py-12 text-center text-gray-500 shadow-sm">
                    Loading dashboard…
                </div>
            )}
            {error && (
                <div className="rounded-3xl bg-red-50 px-5 py-4 text-red-700 shadow-sm">
                    {error}
                </div>
            )}
            {!loading && !error && (
            <div className="space-y-8">
                <section className="flex flex-col gap-3 rounded-3xl bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500">Command center</p>
                        <p className="text-sm text-gray-700">Search across tools, users and borrowings or jump to common admin tasks.</p>
                    </div>
                    <form
                        className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end"
                        onSubmit={handleSearchSubmit}
                    >
                        <div className="flex flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500">
                            <svg className="h-3 w-3 shrink-0 text-gray-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="7" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
                                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                            <input
                                type="search"
                                placeholder="Search tools, users, borrowings..."
                                className="w-full border-none bg-transparent text-xs outline-none placeholder:text-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => router.visit('/tools')}
                                className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                New borrowing
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddToolModalOpen(true)}
                                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                +<span>Add tool</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/users')}
                                className="hidden items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 sm:inline-flex"
                            >
                                <span className="h-1 w-1 rounded-full bg-slate-400" />
                                Manage users
                            </button>
                        </div>
                    </form>
                </section>

                <AdminStatBar metrics={metrics} onExportCsv={handleExportCsv} />

                <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Utilization insights</h2>
                            <p className="text-[11px] text-gray-500">How your fleet is being used over time.</p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-white px-1 py-1 text-[11px] text-gray-600 shadow-sm">
                            {(['7d', '30d', '90d'] as const).map((range) => (
                                <button
                                    key={range}
                                    type="button"
                                    onClick={() => setTimeRange(range)}
                                    className={`rounded-full px-3 py-1 capitalize ${
                                        timeRange === range ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                        <MostBorrowedBarChart tools={displayTools} />
                        <BorrowingStatusDonut segments={displayBorrowingStatus} />
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold text-gray-900">Operations overview</h2>
                        <p className="text-[11px] text-gray-500">What needs your attention right now.</p>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="rounded-3xl bg-white p-6 shadow-sm">
                            <header className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Pending approvals</h3>
                                    <p className="text-[11px] text-gray-500">Requests waiting for admin review.</p>
                                </div>
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">
                                    {pendingApprovals.length} request{pendingApprovals.length !== 1 ? 's' : ''}
                                </span>
                            </header>
                            {pendingApprovals.length === 0 ? (
                                <p className="rounded-2xl bg-gray-50 px-3 py-4 text-[11px] text-gray-500">
                                    No pending requests. Reservations and approval requests will appear here.
                                </p>
                            ) : (
                                <ul className="space-y-3 text-xs text-gray-700">
                                    {pendingApprovals.slice(0, 5).map((item) => (
                                        <li key={item.id} className="flex items-start justify-between rounded-2xl bg-gray-50 px-3 py-2">
                                            <div>
                                                <p className="font-semibold">{item.tool_name} · TL-{item.tool_id}</p>
                                                <p className="text-[11px] text-gray-500">
                                                    Requested by {item.user_name}
                                                    {item.user_email ? ` · ${item.user_email}` : ''}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => router.visit('/admin/allocation-history')}
                                                className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
                                            >
                                                Review
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {pendingApprovals.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => router.visit('/admin/allocation-history')}
                                    className="mt-3 text-[11px] font-semibold text-blue-600 underline-offset-2 hover:underline"
                                >
                                    View all
                                </button>
                            )}
                        </section>

                        <section className="rounded-3xl bg-white p-6 shadow-sm">
                            <header className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">System alerts</h3>
                                    <p className="text-[11px] text-gray-500">Issues that may need your attention.</p>
                                </div>
                                <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-700">
                                    {(overdueCount > 0 ? 1 : 0) + (maintenanceDueCount > 0 ? 1 : 0)} open
                                </span>
                            </header>
                            <ul className="space-y-3 text-xs text-gray-700">
                                {overdueCount > 0 && (
                                    <li className="flex items-start gap-3 rounded-2xl bg-rose-50 px-3 py-2">
                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                                        <div>
                                            <p className="font-semibold">Overdue borrowings</p>
                                            <p className="text-[11px] text-rose-800">
                                                {overdueCount} tool{overdueCount !== 1 ? 's' : ''} overdue.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => router.visit('/admin/allocation-history?overdue=1')}
                                                className="mt-2 text-[11px] font-semibold text-rose-700 underline-offset-2 hover:underline"
                                            >
                                                View affected tools
                                            </button>
                                        </div>
                                    </li>
                                )}
                                {maintenanceDueCount > 0 && (
                                    <li className="flex items-start gap-3 rounded-2xl bg-amber-50 px-3 py-2">
                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                                        <div>
                                            <p className="font-semibold">Upcoming maintenance</p>
                                            <p className="text-[11px] text-amber-800">
                                                {maintenanceDueCount} tool{maintenanceDueCount !== 1 ? 's' : ''} require maintenance within 14 days.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => router.visit('/admin/maintenance')}
                                                className="mt-2 text-[11px] font-semibold text-amber-700 underline-offset-2 hover:underline"
                                            >
                                                Open maintenance schedule
                                            </button>
                                        </div>
                                    </li>
                                )}
                                {overdueCount === 0 && maintenanceDueCount === 0 && (
                                    <li className="rounded-2xl bg-gray-50 px-3 py-4 text-[11px] text-gray-500">
                                        No open alerts. Overdue borrowings and upcoming maintenance will appear here.
                                    </li>
                                )}
                            </ul>
                        </section>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold text-gray-900">Activity &amp; health</h2>
                        <p className="text-[11px] text-gray-500">Recent events and the overall condition of your tools.</p>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                        <section className="rounded-3xl bg-white p-6 shadow-sm">
                            <header className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Recent activity</h3>
                                    <p className="text-[11px] text-gray-500">A quick timeline of the latest movements in the system.</p>
                                </div>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">Last 24 hours</span>
                            </header>
                            <ol className="space-y-4 text-xs text-gray-700">
                                {recentActivity.length === 0 ? (
                                    <li className="rounded-2xl bg-gray-50 px-3 py-4 text-[11px] text-gray-500">
                                        No recent activity. Borrowing and returns will appear here.
                                    </li>
                                ) : (
                                    recentActivity.map((item, index) => (
                                        <li key={item.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${activityToneClasses(item.tone)}`} />
                                                {index !== recentActivity.length - 1 && (
                                                    <span className="mt-1 h-full w-px flex-1 bg-gray-200" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                                    {item.timeAgo}
                                                </p>
                                                <p className="mt-0.5 text-sm font-medium text-gray-900">{item.title}</p>
                                                <p className="mt-0.5 text-[11px] text-gray-600">{item.description}</p>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ol>
                        </section>

                        <section className="rounded-3xl bg-slate-950 p-6 text-slate-50 shadow-sm">
                            <header className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-50">Maintenance &amp; health</h3>
                                    <p className="text-[11px] text-slate-300">Keep an eye on incidents and upcoming work.</p>
                                </div>
                                <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-medium text-slate-200">Fleet health</span>
                            </header>
                            <dl className="space-y-3 text-xs">
                                <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-3 py-2">
                                    <dt className="text-slate-200">Under maintenance</dt>
                                    <dd className="text-sm font-semibold text-amber-300">{metrics.toolsUnderMaintenance}</dd>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-3 py-2">
                                    <dt className="text-slate-200">Available and healthy</dt>
                                    <dd className="text-sm font-semibold text-emerald-300">{metrics.availableTools}</dd>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-3 py-2">
                                    <dt className="text-slate-200">Active borrowings</dt>
                                    <dd className="text-sm font-semibold text-sky-300">{metrics.activeBorrowings}</dd>
                                </div>
                            </dl>
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/maintenance')}
                                className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-300 underline-offset-2 hover:text-sky-200 hover:underline"
                            >
                                Open maintenance schedule
                            </button>
                        </section>
                    </div>
                </section>
            </div>
            )}

            <CreateEditModal
                show={isAddToolModalOpen}
                tool={null}
                categories={addToolCategories.map((c) => c.name)}
                onClose={() => setIsAddToolModalOpen(false)}
                onSave={handleAddToolSave}
            />
        </AppLayout>
    );
}
