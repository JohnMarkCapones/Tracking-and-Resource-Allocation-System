import { useMemo } from 'react';

type HeatmapCell = {
    day: number; // 0=Sun, 6=Sat
    hour: number; // 0-23
    value: number;
};

type UsageHeatmapProps = {
    data?: HeatmapCell[];
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function generateMockData(): HeatmapCell[] {
    const cells: HeatmapCell[] = [];
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            // Simulate higher usage during weekdays and business hours
            const isWeekday = day >= 1 && day <= 5;
            const isBusinessHour = hour >= 8 && hour <= 17;
            const base = isWeekday ? (isBusinessHour ? 8 : 2) : 1;
            cells.push({
                day,
                hour,
                value: Math.floor(Math.random() * base) + (isWeekday && isBusinessHour ? 3 : 0),
            });
        }
    }
    return cells;
}

function getColor(value: number, max: number): string {
    if (value === 0) return 'bg-gray-100 dark:bg-gray-700';
    const intensity = value / max;
    if (intensity < 0.25) return 'bg-blue-100 dark:bg-blue-900/40';
    if (intensity < 0.5) return 'bg-blue-200 dark:bg-blue-800/60';
    if (intensity < 0.75) return 'bg-blue-400 dark:bg-blue-600';
    return 'bg-blue-600 dark:bg-blue-500';
}

export function UsageHeatmap({ data }: UsageHeatmapProps) {
    const heatmapData = useMemo(() => data ?? generateMockData(), [data]);
    const maxValue = useMemo(() => Math.max(...heatmapData.map((c) => c.value), 1), [heatmapData]);

    const getCell = (day: number, hour: number) => {
        return heatmapData.find((c) => c.day === day && c.hour === hour);
    };

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Borrowing Activity Heatmap</h3>
            <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                    <div className="mb-1 flex items-center">
                        <div className="w-10" />
                        {HOURS.filter((_, i) => i % 3 === 0).map((hour) => (
                            <div key={hour} className="flex-1 text-center text-[9px] text-gray-400 dark:text-gray-500">
                                {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`}
                            </div>
                        ))}
                    </div>
                    {DAYS.map((day, dayIndex) => (
                        <div key={day} className="mb-0.5 flex items-center">
                            <div className="w-10 text-[10px] font-medium text-gray-500 dark:text-gray-400">{day}</div>
                            <div className="flex flex-1 gap-0.5">
                                {HOURS.map((hour) => {
                                    const cell = getCell(dayIndex, hour);
                                    return (
                                        <div
                                            key={hour}
                                            className={`flex-1 rounded-sm ${getColor(cell?.value ?? 0, maxValue)}`}
                                            style={{ aspectRatio: '1', minHeight: '14px' }}
                                            title={`${day} ${hour}:00 - ${cell?.value ?? 0} borrowings`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <span>Less</span>
                <span className="h-3 w-3 rounded-sm bg-gray-100 dark:bg-gray-700" />
                <span className="h-3 w-3 rounded-sm bg-blue-100 dark:bg-blue-900/40" />
                <span className="h-3 w-3 rounded-sm bg-blue-200 dark:bg-blue-800/60" />
                <span className="h-3 w-3 rounded-sm bg-blue-400 dark:bg-blue-600" />
                <span className="h-3 w-3 rounded-sm bg-blue-600 dark:bg-blue-500" />
                <span>More</span>
            </div>
        </div>
    );
}
