import { Skeleton } from './Skeleton';

type SkeletonCardProps = {
    lines?: number;
    showImage?: boolean;
    className?: string;
};

export function SkeletonCard({ lines = 3, showImage = false, className = '' }: SkeletonCardProps) {
    return (
        <div className={`rounded-3xl bg-white p-6 shadow-sm ${className}`} aria-label="Loading content">
            {showImage && <Skeleton className="mb-4 h-32 w-full rounded-2xl" />}
            <Skeleton className="mb-3 h-4 w-3/4" />
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton key={index} className={`mb-2 h-3 ${index === lines - 1 ? 'w-1/2' : 'w-full'}`} />
            ))}
        </div>
    );
}
