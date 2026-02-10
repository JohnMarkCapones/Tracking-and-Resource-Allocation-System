import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ToolUtilizationChart, TrendAnalysisChart, CategoryDistributionChart, UserActivityMetrics } from '@/Components/Admin/AnalyticsCharts';
import { UsageHeatmap } from '@/Components/Admin/UsageHeatmap';
import { Breadcrumb } from '@/Components/Breadcrumb';
import AppLayout from '@/Layouts/AppLayout';
import { apiRequest } from '@/lib/http';
import type { AnalyticsOverviewApiResponse, UsageHeatmapApiResponse } from '@/lib/apiTypes';

type Period = '7d' | '30d' | '90d' | '1y';

type MetricCard = { label: string; value: string; change: string; positive: boolean };

function getPeriodRange(period: Period): { from: string; to: string } {
    const to = new Date();
    const from = new Date();
    if (period === '7d') from.setDate(to.getDate() - 7);
    else if (period === '30d') from.setDate(to.getDate() - 30);
    else if (period === '90d') from.setDate(to.getDate() - 90);
    else from.setFullYear(to.getFullYear() - 1);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

/** Convert API heatmap cells (date + count per day) to day/hour grid. API has no hour, so we put daily count in hour 12 for that day of week and aggregate. */
function heatmapApiToCells(cells: Array<{ date: string; count: number }>): Array<{ day: number; hour: number; value: number }> {
    const map = new Map<string, number>();
    for (const c of cells) {
        const day = new Date(c.date).getDay();
        const key = `${day}-12`;
        map.set(key, (map.get(key) ?? 0) + c.count);
    }
    return Array.from(map.entries()).map(([key, value]) => {
        const [day, hour] = key.split('-').map(Number);
        return { day, hour, value };
    });
}

export default function IndexPage() {
    const [period, setPeriod] = useState<Period>('30d');
    const [overview, setOverview] = useState<AnalyticsOverviewApiResponse['data'] | null>(null);
    const [heatmapCells, setHeatmapCells] = useState<Array<{ day: number; hour: number; value: number }> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { from, to } = useMemo(() => getPeriodRange(period), [period]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [overviewRes, heatmapRes] = await Promise.all([
                    apiRequest<AnalyticsOverviewApiResponse>(`/api/analytics/overview?from=${from}&to=${to}`),
                    apiRequest<UsageHeatmapApiResponse>(`/api/analytics/usage-heatmap?from=${from}&to=${to}`),
                ]);
                if (cancelled) return;
                setOverview(overviewRes.data);
                setHeatmapCells(heatmapApiToCells(heatmapRes.data?.cells ?? []));
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load analytics');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [from, to]);

    const metricCards: MetricCard[] = useMemo(() => {
        const b = overview?.status_breakdown;
        const avgDays = overview?.avg_return_days;
        const newUsers = overview?.new_users_count ?? 0;
        if (!b) {
            return [
                { label: 'Total Borrowings', value: '—', change: '—', positive: true },
                { label: 'Active Tools', value: '—', change: '—', positive: true },
                { label: 'Overdue Items', value: '—', change: '—', positive: true },
                { label: 'Avg. Return Time', value: '—', change: '—', positive: true },
                { label: 'Utilization Rate', value: '—', change: '—', positive: true },
                { label: 'New Users', value: '—', change: '—', positive: true },
            ];
        }
        const total = b.borrowed + b.returned;
        return [
            { label: 'Total Borrowings', value: String(total), change: 'vs prev. period', positive: true },
            { label: 'Active Tools', value: String(b.borrowed), change: 'currently out', positive: true },
            { label: 'Overdue Items', value: String(b.overdue), change: 'need attention', positive: b.overdue === 0 },
            { label: 'Avg. Return Time', value: avgDays != null ? `${avgDays} days` : '—', change: 'vs prev. period', positive: true },
            { label: 'Utilization Rate', value: total > 0 ? `${Math.round((b.borrowed / total) * 100)}%` : '0%', change: 'vs prev. period', positive: true },
            { label: 'New Users', value: newUsers > 0 ? String(newUsers) : '—', change: 'vs prev. period', positive: true },
        ];
    }, [overview]);

    return (
        <AppLayout
            activeRoute="admin-analytics"
            variant="admin"
            header={
                <>
                    <Breadcrumb className="mb-2">
                        <Breadcrumb.Home href="/admin/dashboard" />
                        <Breadcrumb.Item isCurrent>Analytics</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                </>
            }
        >
            <Head title="Analytics" />

            {loading && (
                <div className="rounded-3xl bg-white px-5 py-12 text-center text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                    Loading analytics…
                </div>
            )}
            {error && (
                <div className="rounded-3xl bg-red-50 px-5 py-4 text-red-700 shadow-sm dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}
            {!loading && !error && (
            <div className="space-y-6">
                {/* Period Selector */}
                <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 rounded-full bg-white px-1 py-1 text-[11px] shadow-sm dark:bg-gray-800">
                        {(
                            [
                                { value: '7d', label: '7 Days' },
                                { value: '30d', label: '30 Days' },
                                { value: '90d', label: '90 Days' },
                                { value: '1y', label: '1 Year' },
                            ] as const
                        ).map((p) => (
                            <button
                                key={p.value}
                                type="button"
                                onClick={() => setPeriod(p.value)}
                                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                                    period === p.value
                                        ? 'bg-gray-900 text-white dark:bg-blue-600'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            const { from: fromParam, to: toParam } = getPeriodRange(period);
                            const url = new URL('/api/analytics/export', window.location.origin);
                            url.searchParams.set('from', fromParam);
                            url.searchParams.set('to', toParam);
                            try {
                                const res = await fetch(url.toString(), { credentials: 'include' });
                                if (!res.ok) throw new Error('Export failed');
                                const blob = await res.blob();
                                const disposition = res.headers.get('Content-Disposition');
                                const match = disposition?.match(/filename="?([^";]+)"?/);
                                const filename = match?.[1] ?? `analytics_${fromParam}_${toParam}.csv`;
                                const a = document.createElement('a');
                                a.href = URL.createObjectURL(blob);
                                a.download = filename;
                                a.click();
                                URL.revokeObjectURL(a.href);
                            } catch {
                                setError('Failed to download report');
                            }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 8H12M8 4V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Export Report
                    </button>
                </div>

                {/* Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {metricCards.map((metric) => (
                        <div key={metric.label} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
                            <p className="text-[10px] font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">{metric.label}</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                            <p className={`mt-1 text-[11px] font-medium ${metric.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {metric.change} vs prev. period
                            </p>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <TrendAnalysisChart timeseries={overview?.timeseries} />
                    <ToolUtilizationChart data={overview?.tool_utilization} />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <CategoryDistributionChart data={overview?.category_distribution} />
                    <UserActivityMetrics data={overview?.top_users} />
                </div>

                {/* Heatmap */}
                <UsageHeatmap data={heatmapCells ?? undefined} />
            </div>
            )}
        </AppLayout>
    );
}
