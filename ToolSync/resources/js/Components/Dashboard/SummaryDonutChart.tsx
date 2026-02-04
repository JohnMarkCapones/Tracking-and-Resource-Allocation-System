export type SummaryData = {
    returnedPercent: number;
    notReturnedPercent: number;
};

type SummaryDonutChartProps = {
    data: SummaryData;
};

export function SummaryDonutChart({ data }: SummaryDonutChartProps) {
    const total = data.returnedPercent + data.notReturnedPercent || 1;
    const returned = (data.returnedPercent / total) * 100;
    const notReturned = 100 - returned;

    // SVG circumference for a 40 radius circle.
    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    const returnedOffset = (1 - returned / 100) * circumference;
    const notReturnedOffset = circumference * 2;

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
                        className="fill-none stroke-blue-100"
                        strokeWidth="16"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        className="fill-none stroke-blue-500"
                        strokeWidth="16"
                        strokeDasharray={circumference}
                        strokeDashoffset={returnedOffset}
                        strokeLinecap="round"
                    />
                </svg>

                <div className="space-y-3 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="flex-1">Returned</span>
                        <span className="font-semibold">
                            {data.returnedPercent}%
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-blue-200" />
                        <span className="flex-1">Not Yet Returned</span>
                        <span className="font-semibold">
                            {data.notReturnedPercent}%
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

