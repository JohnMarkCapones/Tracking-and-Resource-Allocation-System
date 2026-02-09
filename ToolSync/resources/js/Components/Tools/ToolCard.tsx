import { Link, router } from '@inertiajs/react';
import { FavoriteButton } from '@/Components/FavoriteButton';

export type ToolCardStatus = 'Available' | 'Borrowed' | 'Maintenance';

export type ToolCardData = {
    id: number;
    name: string;
    toolId: string;
    category: string;
    status: ToolCardStatus;
    condition: string;
    imageUrl?: string;
};

type ToolCardProps = {
    tool: ToolCardData;
};

function statusClasses(status: ToolCardStatus): string {
    if (status === 'Available') {
        return 'bg-emerald-50 text-emerald-700';
    }

    if (status === 'Borrowed') {
        return 'bg-amber-50 text-amber-700';
    }

    return 'bg-rose-50 text-rose-700';
}

export function ToolCard({ tool }: ToolCardProps) {
    return (
        <Link
            href={`/tools/${tool.id}`}
            className="group rounded-2xl bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-gray-50"
        >
            <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                {tool.imageUrl ? (
                    <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-100 text-gray-500">
                        <svg className="h-14 w-14 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                        <span className="text-[11px] font-medium">No image</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <FavoriteButton tool={tool} size="sm" />
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses(tool.status)}`}>{tool.status}</span>
                </div>
            </div>

            <div>
                <p className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">{tool.category}</p>
                <h3 className="mt-0.5 text-sm font-semibold text-gray-900 group-hover:text-blue-600">{tool.name}</h3>
                <p className="mt-1 text-[11px] text-gray-500">
                    ID: {tool.toolId} · {tool.condition}
                </p>
            </div>

            {tool.status === 'Available' && (
                <button
                    type="button"
                    className="mt-3 w-full rounded-full bg-blue-600 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700"
                    onClick={(e) => {
                        // Navigate to the tool detail page and auto-open the request
                        // modal using a query string flag. We stop the Link navigation
                        // so we can control the destination URL explicitly.
                        e.preventDefault();
                        e.stopPropagation();
                        router.visit(`/tools/${tool.id}?request=1`);
                    }}
                >
                    Request to Borrow
                </button>
            )}

            {tool.status === 'Borrowed' && (
                <button
                    type="button"
                    className="mt-3 w-full rounded-full bg-blue-600 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700"
                    onClick={(e) => {
                        // Same flow as borrowing, but messaging is about reserving
                        // a future slot while the tool is currently borrowed.
                        e.preventDefault();
                        e.stopPropagation();
                        router.visit(`/tools/${tool.id}?request=1`);
                    }}
                >
                    Request a Reservation
                </button>
            )}
        </Link>
    );
}
