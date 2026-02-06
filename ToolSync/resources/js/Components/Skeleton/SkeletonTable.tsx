import { Skeleton } from './Skeleton';

type SkeletonTableProps = {
    rows?: number;
    columns?: number;
    className?: string;
};

export function SkeletonTable({ rows = 5, columns = 5, className = '' }: SkeletonTableProps) {
    return (
        <div className={`rounded-3xl bg-white p-6 shadow-sm ${className}`} aria-label="Loading table">
            <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <div className="overflow-hidden">
                <div className="border-b pb-3">
                    <div className="flex gap-4">
                        {Array.from({ length: columns }).map((_, index) => (
                            <Skeleton key={`header-${index}`} className="h-3 flex-1" />
                        ))}
                    </div>
                </div>
                <div className="divide-y">
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <div key={rowIndex} className="flex gap-4 py-3">
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <Skeleton key={`cell-${rowIndex}-${colIndex}`} className={`h-4 flex-1 ${colIndex === 0 ? 'w-32' : ''}`} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-3 w-32" />
                <div className="flex gap-2">
                    <Skeleton className="h-7 w-14 rounded-full" />
                    <Skeleton className="h-7 w-14 rounded-full" />
                </div>
            </div>
        </div>
    );
}
