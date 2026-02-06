import { Link } from '@inertiajs/react';
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
        <Link href={`/tools/${tool.id}`} className="group rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                {tool.imageUrl ? (
                    <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 8L8 14L12 18L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M22 10L30 18L26 22L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M10 28L18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M22 24L28 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
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
                        e.preventDefault();
                    }}
                >
                    Request to Borrow
                </button>
            )}
        </Link>
    );
}
