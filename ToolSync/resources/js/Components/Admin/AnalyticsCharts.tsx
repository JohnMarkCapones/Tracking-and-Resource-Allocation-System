import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

// Tool Utilization Chart
const utilizationData = [
    { name: 'Multimeter', usage: 45, total: 60 },
    { name: 'Oscilloscope', usage: 38, total: 60 },
    { name: 'Soldering Kit', usage: 52, total: 60 },
    { name: 'Drill Press', usage: 12, total: 60 },
    { name: 'Laptop', usage: 58, total: 60 },
    { name: '3D Printer', usage: 30, total: 60 },
    { name: 'Caliper', usage: 22, total: 60 },
    { name: 'Power Supply', usage: 41, total: 60 },
];

export function ToolUtilizationChart() {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Tool Utilization</h3>
            <p className="mb-4 text-[11px] text-gray-500 dark:text-gray-400">Days used in the last 60 days</p>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={utilizationData} layout="vertical" margin={{ left: 0, right: 16 }}>
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
        </div>
    );
}

// Trend Analysis Chart
const trendData = [
    { month: 'Jul', borrowings: 42, returns: 38, requests: 48 },
    { month: 'Aug', borrowings: 55, returns: 50, requests: 62 },
    { month: 'Sep', borrowings: 48, returns: 52, requests: 55 },
    { month: 'Oct', borrowings: 62, returns: 58, requests: 70 },
    { month: 'Nov', borrowings: 70, returns: 65, requests: 78 },
    { month: 'Dec', borrowings: 35, returns: 40, requests: 38 },
    { month: 'Jan', borrowings: 58, returns: 55, requests: 65 },
    { month: 'Feb', borrowings: 64, returns: 60, requests: 72 },
];

export function TrendAnalysisChart() {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Trend Analysis</h3>
            <p className="mb-4 text-[11px] text-gray-500 dark:text-gray-400">Monthly comparison over 8 months</p>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData} margin={{ left: -10, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="borrowings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="returns" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="requests" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// Category Distribution Chart
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const categoryData = [
    { name: 'Electronics', value: 35 },
    { name: 'Mechanical', value: 25 },
    { name: 'Computing', value: 20 },
    { name: 'Safety', value: 10 },
    { name: 'Measurement', value: 8 },
    { name: 'Other', value: 2 },
];

export function CategoryDistributionChart() {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Category Distribution</h3>
            <p className="mb-4 text-[11px] text-gray-500 dark:text-gray-400">Tools by category</p>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                        {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

// User Activity Metrics
type UserMetric = {
    name: string;
    department: string;
    borrowings: number;
    overdue: number;
    avgDuration: number;
};

const userMetrics: UserMetric[] = [
    { name: 'Jane Doe', department: 'Engineering', borrowings: 24, overdue: 1, avgDuration: 4.2 },
    { name: 'John Smith', department: 'Research', borrowings: 18, overdue: 0, avgDuration: 6.8 },
    { name: 'Alice Johnson', department: 'Engineering', borrowings: 15, overdue: 2, avgDuration: 3.5 },
    { name: 'Bob Williams', department: 'Quality', borrowings: 12, overdue: 0, avgDuration: 5.1 },
    { name: 'Carol Davis', department: 'Research', borrowings: 10, overdue: 1, avgDuration: 7.3 },
];

export function UserActivityMetrics() {
    const sortedUsers = useMemo(() => [...userMetrics].sort((a, b) => b.borrowings - a.borrowings), []);

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Top Users by Activity</h3>
            <p className="mb-4 text-[11px] text-gray-500 dark:text-gray-400">Most active borrowers this period</p>
            <div className="space-y-3">
                {sortedUsers.map((user, idx) => (
                    <div key={user.name} className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {idx + 1}
                        </span>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-900 dark:text-white">{user.name}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{user.department}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{user.borrowings}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">borrowings</p>
                                </div>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                <div
                                    className="h-full rounded-full bg-blue-500"
                                    style={{ width: `${(user.borrowings / sortedUsers[0].borrowings) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
