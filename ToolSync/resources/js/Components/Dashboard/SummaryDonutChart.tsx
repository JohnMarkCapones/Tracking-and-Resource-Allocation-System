export type SummaryData = {
    returned: number;
    borrowed: number;
    underMaintenance: number;
    available: number;
    overdue: number;
};

type SummaryDonutChartProps = {
    data: SummaryData;
};

export function SummaryDonutChart({ data }: SummaryDonutChartProps) {
    const total =
        data.returned +
        data.borrowed +
        data.underMaintenance +
        data.available +
        data.overdue || 1;

    const segments = [
        {
            label: 'Returned',
            value: data.returned,
            colorClass: 'stroke-blue-900',
            legendClass: 'bg-blue-900',
        },
        {
            label: 'Borrowed',
            value: data.borrowed,
            colorClass: 'stroke-sky-500',
            legendClass: 'bg-sky-500',
        },
        {
            label: 'Maintenance',
            value: data.underMaintenance,
            colorClass: 'stroke-amber-400',
            legendClass: 'bg-amber-400',
        },
        {
            label: 'Available',
            value: data.available,
            colorClass: 'stroke-emerald-500',
            legendClass: 'bg-emerald-500',
        },
        {
            label: 'Overdue',
            value: data.overdue,
            colorClass: 'stroke-rose-500',
            legendClass: 'bg-rose-500',
        },
    ].filter((segment) => segment.value > 0);

    // SVG circumference for a 40 radius circle.
    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    let accumulated = 0;

    return (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                    Summary
                </h3>
            </header>

            <div className="flex items-center gap-6">
                <svg
                    viewBox="0 0 100 100"
                    className="h-32 w-32 -rotate-90"
                    aria-hidden="true"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        className="fill-none stroke-slate-100"
                        strokeWidth="16"
                    />
                    {segments.map((segment) => {
                        const segmentLength =
                            (segment.value / total) * circumference;
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

                    <circle
                        cx="50"
                        cy="50"
                        r={24}
                        className="fill-white"
                    />
                    <text
                        x="50"
                        y="48"
                        textAnchor="middle"
                        className="rotate-90 text-[10px] font-medium fill-slate-500"
                    >
                        Total
                    </text>
                    <text
                        x="50"
                        y="60"
                        textAnchor="middle"
                        className="rotate-90 text-[15px] font-semibold fill-slate-900"
                    >
                        {total}
                    </text>
                </svg>

                <div className="space-y-3 text-xs text-gray-700">
                    {segments.map((segment) => (
                        <div
                            key={segment.label}
                            className="flex items-center gap-2"
                        >
                            <span
                                className={`h-3 w-3 rounded-full ${segment.legendClass}`}
                            />
                            <span className="flex-1">{segment.label}</span>
                            <span className="font-semibold">
                                {Math.round(
                                    (segment.value / total) * 100,
                                )}
                                %
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

