import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type ToolUtilizationItem = { name: string; usage: number; total: number };

export function ToolUtilizationChart({ data }: { data?: Array<{ tool_name: string; days_used: number }> }) {
    const chartData: ToolUtilizationItem[] = useMemo(() => {
        if (data?.length) {
            const maxDays = 60;
            return data.map((t) => ({ name: t.tool_name, usage: Math.min(t.days_used, maxDays), total: maxDays }));
        }
        return [];
    }, [data]);

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Tool Utilization</h3>
            <p className="mb-4 text-[11px] text-gray-500 dark:text-gray-400">Days used in the last 60 days</p>
            {chartData.length === 0 ? (
                <div className="flex h-[250px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">No utilization data for this period</div>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                        <XAxis type="number" domain={[0, 60]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                        <Tooltip
                            contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: number | undefined) => [`${value ?? 0} days`, 'Used']}
                        />
                        <Bar dataKey="usage" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

const MONTH_LABELS: Record<string, string> = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

type TrendPoint = { month: string; monthKey: string; borrowings: number; returns: number; requests: number };

export function TrendAnalysisChart({
    timeseries,
}: {
    timeseries?: { borrowed: Array<{ date: string; count: number }>; returned: Array<{ date: string; count: number }> };
}) {
    const trendData: TrendPoint[] = useMemo(() => {
        if (!timeseries?.borrowed?.length && !timeseries?.returned?.length) return [];
        const byMonth: Record<string, { borrowings: number; returns: number }> = {};
        for (const b of timeseries.borrowed ?? []) {
            const key = b.date.slice(0, 7);
            if (!byMonth[key]) byMonth[key] = { borrowings: 0, returns: 0 };
            byMonth[key].borrowings += b.count;
        }
        for (const r of timeseries.returned ?? []) {
            const key = r.date.slice(0, 7);
            if (!byMonth[key]) byMonth[key] = { borrowings: 0, returns: 0 };
            byMonth[key].returns += r.count;
        }
        const sorted = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
        return sorted.map(([monthKey]) => {
            const m = byMonth[monthKey];
            const monthLabel = MONTH_LABELS[monthKey.slice(5, 7)] ?? monthKey.slice(5, 7);
            return {
                month: monthLabel,
                monthKey,
                borrowings: m.borrowings,
                returns: m.returns,
                requests: m.borrowings,
            };
        });
    }, [timeseries]);

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Trend Analysis</h3>
            <p className="mb-4 text-[11px] text-gray-500 dark:text-gray-400">Monthly comparison for selected period</p>
            {trendData.length === 0 ? (
                <div className="flex h-[250px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">No trend data for this period</div>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trendData} margin={{ left: -10, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" allowDecimals={false} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="borrowings" name="Borrowings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="returns" name="Returns" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="requests" name="Requests" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

type CategoryPoint = { name: string; value: number };

export function CategoryDistributionChart({ data }: { data?: Array<{ name: string; value: number }> }) {
    const categoryData: CategoryPoint[] = useMemo(() => data?.length ? data : [], [data]);

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Category Distribution</h3>
            <p className="mb-4 text-[11px] text-gray-500 dark:text-gray-400">Tools by category</p>
            {categoryData.length === 0 ? (
                <div className="flex h-[250px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">No categories</div>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" nameKey="name">
                            {categoryData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

type TopUser = { user_name: string; department: string | null; borrow_count: number };

export function UserActivityMetrics({ data }: { data?: Array<{ user_name: string; department: string | null; borrow_count: number }> }) {
    const sortedUsers: TopUser[] = useMemo(() => (data ? [...data].sort((a, b) => b.borrow_count - a.borrow_count) : []), [data]);
    const maxBorrowings = sortedUsers[0]?.borrow_count ?? 1;

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Top Users by Activity</h3>
            <p className="mb-4 text-[11px] text-gray-500 dark:text-gray-400">Most active borrowers this period</p>
            {sortedUsers.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">No user activity in this period</div>
            ) : (
                <div className="space-y-3">
                    {sortedUsers.map((user, idx) => (
                        <div key={`${user.user_name}-${idx}`} className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                {idx + 1}
                            </span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-900 dark:text-white">{user.user_name}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{user.department ?? '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{user.borrow_count}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">borrowings</p>
                                    </div>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                    <div
                                        className="h-full rounded-full bg-blue-500"
                                        style={{ width: `${(user.borrow_count / maxBorrowings) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
