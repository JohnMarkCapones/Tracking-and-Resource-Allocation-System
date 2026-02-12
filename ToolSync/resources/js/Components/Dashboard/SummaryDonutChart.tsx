/**
 * Allocation-only summary: Returned, Active (on time), Overdue.
 * We do not mix inventory (Available, Maintenance) with allocation outcomes,
 * so percentages are logically consistent (all from the same allocation set).
 */
export type AllocationSummaryData = {
    returned: number;
    active: number;
    overdue: number;
};

type SummaryDonutChartProps = {
    data: AllocationSummaryData;
};

export function SummaryDonutChart({ data }: SummaryDonutChartProps) {
    const r = Number(data.returned) || 0;
    const a = Number(data.active) || 0;
    const o = Number(data.overdue) || 0;
    const sum = r + a + o;
    const total = sum || 1; // avoid division by zero when computing segment lengths

    const segments = [
        { label: 'Returned', value: r, colorClass: 'stroke-blue-900', legendClass: 'bg-blue-900' },
        { label: 'Active', value: a, colorClass: 'stroke-sky-500', legendClass: 'bg-sky-500' },
        { label: 'Overdue', value: o, colorClass: 'stroke-rose-500', legendClass: 'bg-rose-500' },
    ].filter((segment) => segment.value > 0);

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    let accumulated = 0;

    return (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
                <p className="mt-1 text-[11px] text-gray-500">Borrowing outcomes in the selected period</p>
            </header>

            <div className="flex items-center gap-6">
                <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90" aria-hidden="true">
                    <circle cx="50" cy="50" r={radius} className="fill-none stroke-slate-100" strokeWidth="16" />
                    {segments.map((segment) => {
                        const segmentLength = (segment.value / total) * circumference;
                        const dashArray = `${segmentLength} ${circumference}`;
                        const dashOffset = circumference - accumulated;
                        accumulated += segmentLength;

                        return (
                            <circle
                                key={segment.label}
                                cx="50"
                                cy="50"
                                r={radius}
                                className={`fill-none ${segment.colorClass}`}
                                strokeWidth="16"
                                strokeDasharray={dashArray}
                                strokeDashoffset={dashOffset}
                                strokeLinecap="round"
                            />
                        );
                    })}

                    <circle cx="50" cy="50" r={24} className="fill-white" />
                    <text x="50" y="48" textAnchor="middle" className="rotate-90 fill-slate-500 text-[10px] font-medium">
                        Total
                    </text>
                    <text x="50" y="60" textAnchor="middle" className="rotate-90 fill-slate-900 text-[15px] font-semibold">
                        {sum}
                    </text>
                </svg>

                <div className="space-y-3 text-xs text-gray-700">
                    {segments.map((segment) => (
                        <div key={segment.label} className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full ${segment.legendClass}`} />
                            <span className="flex-1">{segment.label}</span>
                            <span className="font-semibold">{Math.round((segment.value / total) * 100)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
