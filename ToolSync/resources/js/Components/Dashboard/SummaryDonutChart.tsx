export type AllocationSummaryData = {
    returned: number;
    active: number;
    overdue: number;
    pendingApproval: number;
    booked: number;
    unclaimed: number;
    cancelled: number;
};

type SummaryDonutChartProps = {
    data: AllocationSummaryData;
};

export function SummaryDonutChart({ data }: SummaryDonutChartProps) {
    const r = Number(data.returned) || 0;
    const a = Number(data.active) || 0;
    const o = Number(data.overdue) || 0;
    const p = Number(data.pendingApproval) || 0;
    const b = Number(data.booked) || 0;
    const u = Number(data.unclaimed) || 0;
    const c = Number(data.cancelled) || 0;

    const sum = r + a + o + p + b + u + c;
    const total = sum || 1; // avoid division by zero when computing segment lengths

    const segments = [
        { label: 'Returned', value: r, colorClass: 'stroke-emerald-500', legendClass: 'bg-emerald-500' },
        { label: 'Active', value: a, colorClass: 'stroke-blue-500', legendClass: 'bg-blue-500' },
        { label: 'Overdue', value: o, colorClass: 'stroke-amber-500', legendClass: 'bg-amber-500' },
        { label: 'Pending Approval', value: p, colorClass: 'stroke-violet-500', legendClass: 'bg-violet-500' },
        { label: 'Booked', value: b, colorClass: 'stroke-teal-500', legendClass: 'bg-teal-500' },
        { label: 'Unclaimed', value: u, colorClass: 'stroke-orange-500', legendClass: 'bg-orange-500' },
        { label: 'Cancelled', value: c, colorClass: 'stroke-rose-500', legendClass: 'bg-rose-500' },
    ];

    const donutSegments = segments.filter((segment) => segment.value > 0);

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    let accumulated = 0;

    return (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
                <p className="mt-1 text-[11px] text-gray-500">Borrowing and reservation status overview</p>
            </header>

            <div className="flex items-center gap-6">
                <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90" aria-hidden="true">
                    <circle cx="50" cy="50" r={radius} className="fill-none stroke-slate-100" strokeWidth="16" />
                    {donutSegments.map((segment) => {
                        const segmentLength = (segment.value / total) * circumference;
                        const dashArray = `${segmentLength} ${circumference}`;
                        const dashOffset = -accumulated;
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
                                strokeLinecap="butt"
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

                <div className="grid flex-1 grid-cols-1 gap-2 text-xs text-gray-700">
                    {segments.map((segment) => (
                        <div key={segment.label} className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full ${segment.legendClass}`} />
                            <span className="flex-1">{segment.label}</span>
                            <span className="min-w-5 text-right font-medium text-gray-500">{segment.value}</span>
                            <span className="font-semibold">{Math.round((segment.value / total) * 100)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
