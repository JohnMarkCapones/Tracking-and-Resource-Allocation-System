import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { ToolUtilizationChart, TrendAnalysisChart, CategoryDistributionChart, UserActivityMetrics } from '@/Components/Admin/AnalyticsCharts';
import { UsageHeatmap } from '@/Components/Admin/UsageHeatmap';
import { Breadcrumb } from '@/Components/Breadcrumb';
import AppLayout from '@/Layouts/AppLayout';

type Period = '7d' | '30d' | '90d' | '1y';

const METRIC_CARDS = [
    { label: 'Total Borrowings', value: '482', change: '+12%', positive: true },
    { label: 'Active Tools', value: '64', change: '+3', positive: true },
    { label: 'Overdue Items', value: '5', change: '-2', positive: true },
    { label: 'Avg. Return Time', value: '4.2d', change: '+0.3d', positive: false },
    { label: 'Utilization Rate', value: '78%', change: '+5%', positive: true },
    { label: 'New Users', value: '12', change: '+8', positive: true },
];

export default function IndexPage() {
    const [period, setPeriod] = useState<Period>('30d');

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
                        onClick={() => {
                            const now = new Date();
                            let from = new Date(now);

                            if (period === '7d') {
                                from.setDate(now.getDate() - 7);
                            } else if (period === '30d') {
                                from.setDate(now.getDate() - 30);
                            } else if (period === '90d') {
                                from.setDate(now.getDate() - 90);
                            } else {
                                from.setFullYear(now.getFullYear() - 1);
                            }

                            const toParam = now.toISOString().slice(0, 10);
                            const fromParam = from.toISOString().slice(0, 10);

                            const url = new URL('/api/analytics/export', window.location.origin);
                            url.searchParams.set('from', fromParam);
                            url.searchParams.set('to', toParam);

                            window.location.href = url.toString();
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
                    {METRIC_CARDS.map((metric) => (
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
                    <TrendAnalysisChart />
                    <ToolUtilizationChart />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <CategoryDistributionChart />
                    <UserActivityMetrics />
                </div>

                {/* Heatmap */}
                <UsageHeatmap />
            </div>
        </AppLayout>
    );
}
