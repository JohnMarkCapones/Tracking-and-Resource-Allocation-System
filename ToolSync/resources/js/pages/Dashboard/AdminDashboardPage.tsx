import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AdminStatBar } from '@/Components/Dashboard/AdminStatBar';
import type { BorrowingStatusSegment } from '@/Components/Dashboard/BorrowingStatusDonut';
import { BorrowingStatusDonut } from '@/Components/Dashboard/BorrowingStatusDonut';
import type { MostBorrowedTool } from '@/Components/Dashboard/MostBorrowedBarChart';
import { MostBorrowedBarChart } from '@/Components/Dashboard/MostBorrowedBarChart';
import AppLayout from '@/Layouts/AppLayout';
import { toast } from '@/Components/Toast';
import { CreateEditModal, type ToolFormData } from '@/pages/Admin/Tools/CreateEditModal';
import { apiRequest } from '@/lib/http';
import type { DashboardApiResponse } from '@/lib/apiTypes';

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

// Static sample data to make the admin dashboard feel richer and more realistic.
// Replace these with live data from the backend once those endpoints are ready.
const RECENT_ACTIVITY: RecentActivityItem[] = [
    {
        id: 1,
        title: 'Laptop LP-0009 returned',
        description: 'John Miller from Design returned their borrowed laptop.',
        timeAgo: '5 minutes ago',
        tone: 'borrowing',
    },
    {
        id: 2,
        title: 'New tool added: DSLR Camera',
        description: 'Inventory team registered CM-0032 in the equipment pool.',
        timeAgo: '1 hour ago',
        tone: 'user',
    },
    {
        id: 3,
        title: 'Maintenance completed',
        description: 'Projector PR-0010 passed functional testing.',
        timeAgo: '2 hours ago',
        tone: 'maintenance',
    },
    {
        id: 4,
        title: 'Overdue reminder sent',
        description: 'System notified owners of 2 overdue borrowings.',
        timeAgo: 'Yesterday',
        tone: 'borrowing',
    },
];

function activityToneClasses(tone: ActivityTone): string {
    if (tone === 'borrowing') {
        return 'bg-blue-500';
    }

    if (tone === 'maintenance') {
        return 'bg-amber-500';
    }

    return 'bg-emerald-500';
}

// Mock most-borrowed tools until the API provides this aggregate.
const MOCK_MOST_BORROWED: MostBorrowedTool[] = [
    { name: 'Laptop', count: 24 },
    { name: 'Projector', count: 18 },
    { name: 'Camera', count: 12 },
    { name: 'Tablet', count: 8 },
];

export default function AdminDashboardPage() {
    const fallbackProps = usePage<AdminDashboardPageProps>().props;
    const [metrics, setMetrics] = useState<AdminMetrics>(fallbackProps.metrics);
    const [mostBorrowedTools] = useState<MostBorrowedTool[]>(
        fallbackProps.mostBorrowedTools?.length ? fallbackProps.mostBorrowedTools : MOCK_MOST_BORROWED,
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

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await apiRequest<DashboardApiResponse>('/api/dashboard');
                if (cancelled) return;
                const d = res.data;
                const c = d.counts;
                const total =
                    c.tools_available_quantity + c.tools_maintenance_quantity + c.borrowed_active_count;
                setMetrics({
                    totalTools: total,
                    availableTools: c.tools_available_quantity,
                    borrowedTools: c.borrowed_active_count,
                    toolsUnderMaintenance: c.tools_maintenance_quantity,
                    totalUsers: 0,
                    activeBorrowings: c.borrowed_active_count,
                });
                setBorrowingStatus([
                    { label: 'Returned', value: d.summary.returned_count },
                    { label: 'Active', value: d.summary.not_returned_count },
                ]);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load dashboard');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleAddToolSave = (data: ToolFormData) => {
        setIsAddToolModalOpen(false);
        toast.success(`${data.name} has been added. Go to Tool Management to see it.`);
        router.visit('/admin/tools');
    };

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
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <div className="flex flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500">
                            <svg className="h-3 w-3 text-gray-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="7" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
                                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                            <input
                                type="search"
                                placeholder="Search tools, users, borrowings..."
                                className="w-full border-none bg-transparent text-xs outline-none placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
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
                                className="hidden items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 sm:inline-flex"
                            >
                                <span className="h-1 w-1 rounded-full bg-slate-400" />
                                Manage users
                            </button>
                        </div>
                    </div>
                </section>

                <AdminStatBar metrics={metrics} />

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
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">3 requests</span>
                            </header>
                            <ul className="space-y-3 text-xs text-gray-700">
                                <li className="flex items-start justify-between rounded-2xl bg-gray-50 px-3 py-2">
                                    <div>
                                        <p className="font-semibold">Laptop · LP-0009</p>
                                        <p className="text-[11px] text-gray-500">Requested by Jane Doe · Design team</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </li>
                                <li className="flex items-start justify-between rounded-2xl bg-gray-50 px-3 py-2">
                                    <div>
                                        <p className="font-semibold">Projector · PR-0020</p>
                                        <p className="text-[11px] text-gray-500">Requested by Mark Lee · Marketing</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </li>
                            </ul>
                        </section>

                        <section className="rounded-3xl bg-white p-6 shadow-sm">
                            <header className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">System alerts</h3>
                                    <p className="text-[11px] text-gray-500">Issues that may need your attention.</p>
                                </div>
                                <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-700">2 open</span>
                            </header>
                            <ul className="space-y-3 text-xs text-gray-700">
                                <li className="flex items-start gap-3 rounded-2xl bg-rose-50 px-3 py-2">
                                    <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                                    <div>
                                        <p className="font-semibold">Overdue borrowings</p>
                                        <p className="text-[11px] text-rose-800">2 tools are overdue by more than 7 days.</p>
                                        <button
                                            type="button"
                                            className="mt-2 text-[11px] font-semibold text-rose-700 underline-offset-2 hover:underline"
                                        >
                                            View affected tools
                                        </button>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 rounded-2xl bg-amber-50 px-3 py-2">
                                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                                    <div>
                                        <p className="font-semibold">Upcoming maintenance</p>
                                        <p className="text-[11px] text-amber-800">4 tools require maintenance within the next 14 days.</p>
                                        <button
                                            type="button"
                                            className="mt-2 text-[11px] font-semibold text-amber-700 underline-offset-2 hover:underline"
                                        >
                                            Open maintenance schedule
                                        </button>
                                    </div>
                                </li>
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
                                {RECENT_ACTIVITY.map((item, index) => (
                                    <li key={item.id} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <span className={`mt-1 h-2 w-2 rounded-full ${activityToneClasses(item.tone)}`} />
                                            {index !== RECENT_ACTIVITY.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-gray-200" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">{item.timeAgo}</p>
                                            </div>
                                            <p className="mt-0.5 text-sm font-medium text-gray-900">{item.title}</p>
                                            <p className="mt-0.5 text-[11px] text-gray-600">{item.description}</p>
                                        </div>
                                    </li>
                                ))}
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
                onClose={() => setIsAddToolModalOpen(false)}
                onSave={handleAddToolSave}
            />
        </AppLayout>
    );
}
