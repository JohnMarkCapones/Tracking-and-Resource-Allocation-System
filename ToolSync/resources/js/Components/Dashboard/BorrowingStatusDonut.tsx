export type BorrowingStatusSegment = {
    label: string;
    value: number;
};

type BorrowingStatusDonutProps = {
    segments: BorrowingStatusSegment[];
};

export function BorrowingStatusDonut({ segments }: BorrowingStatusDonutProps) {
    const total = segments.reduce((accumulator, segment) => accumulator + segment.value, 0);
    const normalizedTotal = total || 1;

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    const colors = [
        { stroke: 'stroke-blue-900', bullet: 'bg-blue-900' },
        { stroke: 'stroke-sky-500', bullet: 'bg-sky-500' },
        { stroke: 'stroke-slate-400', bullet: 'bg-slate-400' },
        { stroke: 'stroke-emerald-500', bullet: 'bg-emerald-500' },
        { stroke: 'stroke-amber-500', bullet: 'bg-amber-500' },
    ];

    let accumulated = 0;

    if (!segments.length) {
        return (
            <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[#111827]">
                <header className="mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">Borrowing status</h3>
                </header>
                <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center dark:border-gray-700 dark:bg-[#111827]">
                    <p className="text-xs font-medium text-gray-600">No status data available</p>
                    <p className="mt-1 text-[11px] text-gray-500">When tools are borrowed, their status distribution will appear here.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[#111827]">
            <header className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Borrowing status</h3>
                <span className="text-[11px] text-gray-500">Distribution per tool</span>
            </header>

            <div className="flex items-center gap-6">
                <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90" aria-hidden="true">
                    <circle cx="50" cy="50" r={radius} className="fill-none stroke-slate-100 dark:stroke-slate-700" strokeWidth="16" />
                    {segments.map((segment, index) => {
                        const segmentLength = (segment.value / normalizedTotal) * circumference;

                        if (segmentLength <= 0) {
                            return null;
                        }

                        const dashArray = `${segmentLength} ${circumference - segmentLength}`;
                        const dashOffset = -accumulated;
                        accumulated += segmentLength;

                        const colorClass = colors[index % colors.length]?.stroke ?? 'stroke-slate-400';

                        return (
                            <circle
                                key={segment.label}
                                cx="50"
                                cy="50"
                                r={radius}
                                className={`fill-none ${colorClass}`}
                                strokeWidth="16"
                                strokeDasharray={dashArray}
                                strokeDashoffset={dashOffset}
                                strokeLinecap="round"
                            />
                        );
                    })}

                    <circle cx="50" cy="50" r={24} className="fill-white dark:fill-[#111827]" />
                    <text x="50" y="48" textAnchor="middle" className="rotate-90 fill-slate-500 text-[10px] font-medium dark:fill-slate-400">
                        Total
                    </text>
                    <text x="50" y="60" textAnchor="middle" className="rotate-90 fill-slate-900 text-[15px] font-semibold dark:fill-white">
                        {total}
                    </text>
                </svg>

                <div className="space-y-3 text-xs text-gray-700 dark:text-gray-200">
                    {segments.map((segment, index) => (
                        <div key={segment.label} className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full ${colors[index % colors.length]?.bullet ?? 'bg-slate-400'}`} />
                            <span className="flex-1">{segment.label}</span>
                            <span className="font-semibold">
                                {segment.value} ({Math.round((segment.value / normalizedTotal) * 100)}
                                %)
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
