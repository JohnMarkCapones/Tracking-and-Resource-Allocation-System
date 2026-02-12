import { Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BorrowingHistoryItem } from '@/Components/Dashboard/BorrowingHistoryTable';
import { BorrowingHistoryTable } from '@/Components/Dashboard/BorrowingHistoryTable';
import type { SummaryData } from '@/Components/Dashboard/SummaryDonutChart';
import { SummaryDonutChart } from '@/Components/Dashboard/SummaryDonutChart';
import { WelcomeBanner } from '@/Components/Dashboard/WelcomeBanner';
import AppLayout from '@/Layouts/AppLayout';
import type { DashboardApiResponse } from '@/lib/apiTypes';
import { apiRequest } from '@/lib/http';

type SharedProps = { auth?: { user?: { name?: string } } };

const NEXT_7_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isDueWithinNext7Days(expectedReturnDate: string): boolean {
    const due = new Date(expectedReturnDate).getTime();
    const now = Date.now();
    return due >= now && due <= now + NEXT_7_DAYS_MS;
}

export type UpcomingReturnItem = {
    id: number;
    toolId: string;
    toolName: string;
    dueDateFormatted: string;
};

function mapRecentToHistoryItem(
    a: DashboardApiResponse['data']['recent_activity'][number],
): BorrowingHistoryItem {
    const status =
        a.status === 'RETURNED'
            ? ('Returned' as const)
            : a.is_overdue
              ? ('Overdue' as const)
              : ('Borrowed' as const);
    return {
        equipment: a.tool_name ?? `Tool #${a.tool_id}`,
        toolId: 'TL-' + a.tool_id,
        expectedReturnDate: new Date(a.expected_return_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }),
        status,
    };
}

function formatActivityDate(value?: string): string {
    if (!value) return 'Date unavailable';
    const normalized = value.length === 10 ? `${value}T12:00:00` : value;
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return 'Date unavailable';
    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function UserDashboardPage() {
    const { auth } = usePage<SharedProps>().props;
    const [userName] = useState(auth?.user?.name ?? 'User');
    const [totalTools, setTotalTools] = useState(0);
    const [toolsUnderMaintenance, setToolsUnderMaintenance] = useState(0);
    const [borrowedItemsCount, setBorrowedItemsCount] = useState(0);
    const [availableTools, setAvailableTools] = useState(0);
    const [borrowingHistory, setBorrowingHistory] = useState<BorrowingHistoryItem[]>([]);
    const [recentActivityRaw, setRecentActivityRaw] = useState<DashboardApiResponse['data']['recent_activity']>([]);
    const [summary, setSummary] = useState<SummaryData>({
        returned: 0,
        borrowed: 0,
        underMaintenance: 0,
        available: 0,
        overdue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = useCallback(async (silent = false) => {
        if (!silent) {
            setLoading(true);
            setError(null);
        }
        try {
            const res = await apiRequest<DashboardApiResponse>('/api/dashboard');
            const d = res.data;
            const counts = d.counts;
            setAvailableTools(counts.tools_available_quantity);
            setToolsUnderMaintenance(counts.tools_maintenance_quantity);
            setBorrowedItemsCount(counts.borrowed_active_count);
            setTotalTools(
                counts.tools_total_quantity ??
                    (counts.tools_available_quantity +
                        counts.tools_maintenance_quantity +
                        counts.borrowed_active_count),
            );
            const recent = d.recent_activity ?? [];
            setBorrowingHistory(recent.map(mapRecentToHistoryItem));
            setRecentActivityRaw(recent);
            setSummary({
                returned: d.summary.returned_count,
                borrowed: d.summary.not_returned_count,
                underMaintenance: counts.tools_maintenance_quantity,
                available: counts.tools_available_quantity,
                overdue: counts.overdue_count,
            });
        } catch (err) {
            if (!silent) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard(false);
    }, [loadDashboard]);

    // Refetch when page gains focus so tool status (borrowed / available) stays up to date.
    useEffect(() => {
        const onFocus = () => loadDashboard(true);
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [loadDashboard]);

    const upcomingReturns = useMemo((): UpcomingReturnItem[] => {
        return recentActivityRaw
            .filter((a) => a.status !== 'RETURNED' && isDueWithinNext7Days(a.expected_return_date))
            .map((a) => ({
                id: a.id,
                toolId: 'TL-' + a.tool_id,
                toolName: a.tool_name ?? `Tool #${a.tool_id}`,
                dueDateFormatted: new Date(a.expected_return_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                }),
            }));
    }, [recentActivityRaw]);

    return (
        <AppLayout
            activeRoute="dashboard"
            header={
                <>
                    <p className="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">Dashboard</p>
                    <h1 className="text-2xl font-semibold text-gray-900">System-wide overview and analytics</h1>
                </>
            }
        >
            <Head title="Dashboard" />

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
                <WelcomeBanner
                    userName={userName}
                    totalTools={totalTools}
                    toolsUnderMaintenance={toolsUnderMaintenance}
                    borrowedItemsCount={borrowedItemsCount}
                    availableTools={availableTools}
                />

                <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                        <div className="space-y-6">
                            <BorrowingHistoryTable items={borrowingHistory} />

                            <section className="rounded-3xl bg-white p-6 shadow-sm">
                                <header className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">Upcoming returns</h3>
                                        <p className="text-[11px] text-gray-500">Tools that are due in the next 7 days.</p>
                                    </div>
                                    {upcomingReturns.length > 0 && (
                                        <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
                                            {upcomingReturns.length} due soon
                                        </span>
                                    )}
                                </header>
                                <ul className="space-y-3 text-xs text-gray-700">
                                    {upcomingReturns.length === 0 ? (
                                        <li className="rounded-2xl bg-gray-50 px-3 py-4 text-center text-[11px] text-gray-500">
                                            No tools due in the next 7 days.
                                        </li>
                                    ) : (
                                        upcomingReturns.map((item) => (
                                            <li key={item.id} className="flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-2">
                                                <div>
                                                    <p className="font-semibold">{item.toolId} · {item.toolName}</p>
                                                    <p className="text-[11px] text-gray-500">Due {item.dueDateFormatted}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link
                                                        href="/borrowings"
                                                        className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                                                    >
                                                        Return now
                                                    </Link>
                                                    <Link
                                                        href="/borrowings"
                                                        className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
                                                    >
                                                        View details
                                                    </Link>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <SummaryDonutChart data={summary} />

                            <section className="rounded-3xl bg-white p-6 shadow-sm">
                                <header className="mb-4 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900">Recent activity</h3>
                                    <span className="text-[11px] text-gray-500">Latest</span>
                                </header>
                                <ol className="space-y-4 text-xs text-gray-700">
                                    {recentActivityRaw.length === 0 ? (
                                        <li className="rounded-2xl bg-gray-50 px-3 py-4 text-center text-[11px] text-gray-500">
                                            No recent activity yet.
                                        </li>
                                    ) : (
                                        recentActivityRaw.slice(0, 5).map((activity) => {
                                            const dotClass =
                                                activity.status === 'RETURNED'
                                                    ? 'bg-emerald-500'
                                                    : activity.is_overdue
                                                      ? 'bg-amber-500'
                                                      : 'bg-sky-500';
                                            const title =
                                                activity.status === 'RETURNED'
                                                    ? `${activity.tool_name ?? 'Tool'} returned`
                                                    : activity.is_overdue
                                                      ? `${activity.tool_name ?? 'Tool'} overdue`
                                                      : `${activity.tool_name ?? 'Tool'} borrowed`;
                                            const details =
                                                activity.status === 'RETURNED'
                                                    ? `${activity.user_name ?? 'A user'} returned this tool.`
                                                    : `${activity.user_name ?? 'A user'} borrowed this tool.`;

                                            return (
                                                <li key={activity.id} className="flex items-start gap-3">
                                                    <span className={`mt-1 h-2 w-2 rounded-full ${dotClass}`} />
                                                    <div>
                                                        <p className="font-medium">{title}</p>
                                                        <p className="text-[11px] text-gray-500">{details}</p>
                                                        <p className="mt-1 text-[10px] text-gray-400">
                                                            {formatActivityDate(activity.borrow_date)}
                                                        </p>
                                                    </div>
                                                </li>
                                            );
                                        })
                                    )}
                                </ol>
                            </section>

                            <section className="rounded-3xl bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-sm font-semibold text-gray-900">Quick actions</h3>
                                <div className="grid gap-3 text-xs text-gray-700 sm:grid-cols-2">
                                    <Link
                                        href="/tools"
                                        className="flex flex-col items-start rounded-2xl bg-blue-50 px-4 py-3 text-left hover:bg-blue-100"
                                    >
                                        <span className="mb-1 text-xs font-semibold text-blue-800">Request tool</span>
                                        <span className="text-[11px] text-blue-900/80">Browse available tools and submit a reservation.</span>
                                    </Link>
                                    <Link
                                        href="/borrowings"
                                        className="flex flex-col items-start rounded-2xl bg-rose-50 px-4 py-3 text-left hover:bg-rose-100"
                                    >
                                        <span className="mb-1 text-xs font-semibold text-rose-800">Manage borrowings</span>
                                        <span className="text-[11px] text-rose-900/80">Return tools, track due dates, and review borrowing history.</span>
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </div>
                </section>
            </div>
            )}
        </AppLayout>
    );
}
