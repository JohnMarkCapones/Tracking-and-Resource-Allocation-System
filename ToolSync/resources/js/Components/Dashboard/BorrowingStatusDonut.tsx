export type BorrowingStatusSegment = {
    label: string;
    value: number;
};

type BorrowingStatusDonutProps = {
    segments: BorrowingStatusSegment[];
};

export function BorrowingStatusDonut({ segments }: BorrowingStatusDonutProps) {
    const total =
        segments.reduce(
            (accumulator, segment) => accumulator + segment.value,
            0,
        ) || 1;

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    const colors = [
        'stroke-blue-900',
        'stroke-sky-500',
        'stroke-slate-400',
        'stroke-emerald-500',
        'stroke-amber-500',
    ];

    let accumulated = 0;

    if (!segments.length) {
        return (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
                <header className="mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Borrowing status
                    </h3>
                </header>
                <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center">
                    <p className="text-xs font-medium text-gray-600">
                        No status data available
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">
                        When tools are borrowed, their status distribution will
                        appear here.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                    Borrowing status
                </h3>
                <span className="text-[11px] text-gray-500">
                    Distribution per tool
                </span>
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
                    {segments.map((segment, index) => {
                        const segmentLength =
                            (segment.value / total) * circumference;
                        const dashArray = `${segmentLength} ${circumference}`;
                        const dashOffset = circumference - accumulated;
                        accumulated += segmentLength;

                        const colorClass =
                            colors[index % colors.length] ?? 'stroke-slate-400';

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
                            <span className="h-3 w-3 rounded-full bg-slate-400" />
                            <span className="flex-1">{segment.label}</span>
                            <span className="font-semibold">
                                {segment.value} (
                                {Math.round(
                                    (segment.value / total) * 100,
                                )}
                                %)
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

