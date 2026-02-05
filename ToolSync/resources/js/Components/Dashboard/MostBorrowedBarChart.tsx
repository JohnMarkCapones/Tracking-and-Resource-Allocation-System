import { useState } from 'react';

export type MostBorrowedTool = {
    name: string;
    count: number;
};

type MostBorrowedBarChartProps = {
    tools: MostBorrowedTool[];
};

export function MostBorrowedBarChart({ tools }: MostBorrowedBarChartProps) {
    const [hoveredTool, setHoveredTool] = useState<string | null>(null);

    const max =
        tools.reduce(
            (accumulator, tool) => Math.max(accumulator, tool.count),
            0,
        ) || 1;

    if (!tools.length) {
        return (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
                <header className="mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Most borrowed tools
                    </h3>
                </header>
                <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center">
                    <p className="text-xs font-medium text-gray-600">
                        No borrowing data yet
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">
                        Once users start borrowing tools, you&apos;ll see the top
                        items here.
                    </p>
                </div>
            </section>
        );
    }

    const sortedTools = [...tools].sort(
        (first, second) => second.count - first.count,
    );

    // Simple y-axis "ruler" ticks so the chart feels like a real graph.
    // We round the maximum up to the next multiple of 5 so ticks look clean
    // (e.g. 0, 5, 10, 15, 20) instead of awkward values like 18, 14, 9, 5, 0.
    const tickSteps = 4;
    const roundedMax = Math.max(5, Math.ceil(max / 5) * 5);
    const step = roundedMax / tickSteps;
    const ticks = Array.from({ length: tickSteps + 1 }, (_value, index) =>
        Math.round(roundedMax - index * step),
    );

    return (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                    Most borrowed tools
                </h3>
                <span className="text-[11px] text-gray-500">
                    Top {sortedTools.length} by borrow count
                </span>
            </header>

            <div className="mt-4 h-52 rounded-2xl bg-slate-50 px-4 pb-3 pt-4">
                <div className="relative flex h-full items-end border-b border-slate-200/80 pb-1.5">
                    {/* horizontal ruler + y-axis labels */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-400">
                        {ticks.map((tick, index) => (
                            <div
                                key={tick}
                                className="flex items-center gap-1"
                            >
                                <span className="w-8 text-right">{tick}</span>
                                <div
                                    className={
                                        index === ticks.length - 1
                                            ? 'h-px flex-1 bg-slate-300'
                                            : 'h-px flex-1 bg-slate-200/60'
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    {/* subtle vertical grid lines inside the chart area */}
                    <div className="pointer-events-none absolute left-8 right-0 top-0 bottom-0 flex justify-between">
                        {sortedTools.map((tool) => (
                            <div
                                key={tool.name}
                                className="h-full w-px bg-slate-200/30"
                            />
                        ))}
                    </div>

                    <div className="relative z-10 ml-8 flex h-full w-full items-end gap-8">
                        {sortedTools.map((tool) => {
                            const height = (tool.count / roundedMax) * 100;

                            return (
                                <div
                                    key={tool.name}
                                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                                    title={`${tool.name}: ${tool.count} borrowings`}
                                    onMouseEnter={() =>
                                        setHoveredTool(tool.name)
                                    }
                                    onMouseLeave={() => setHoveredTool(null)}
                                >
                                    <div className="relative flex h-full w-full items-end justify-center">
                                        {hoveredTool === tool.name && (
                                            <div className="absolute -top-7 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                                                {tool.count} borrowings
                                            </div>
                                        )}

                                        <div className="flex h-full w-10 items-end">
                                            <div
                                                className="flex h-full w-full flex-col overflow-hidden rounded-t-md bg-gradient-to-t from-blue-600 to-sky-400 transition-transform duration-150 ease-out hover:-translate-y-1 hover:shadow-md"
                                                style={{
                                                    height: `${height}%`,
                                                }}
                                            >
                                                {/* We keep a slight tone change near the top so it feels like a chart bar, */}
                                                {/* but avoid the full "hotdog" pill look by only rounding the top edge. */}
                                                <div className="flex-1" />
                                                <div className="h-1.5 bg-sky-300/70" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-[11px] font-medium text-gray-700">
                                        {tool.name}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

