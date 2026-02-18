import { router } from '@inertiajs/react';
import { FavoriteButton } from '@/Components/FavoriteButton';

export type ToolCardStatus = 'Available' | 'Borrowed' | 'Maintenance';

export type ToolCardData = {
    id: number;
    name: string;
    /** URL slug for /tools/{slug} (fallback to id if missing) */
    slug?: string | null;
    toolId: string;
    category: string;
    status: ToolCardStatus;
    condition: string;
    quantity: number;
    availableQuantity: number;
    borrowedQuantity: number;
    reservedQuantity?: number;
    imageUrl?: string;
};

type ToolCardProps = {
    tool: ToolCardData;
    onRequestBorrow?: (tool: ToolCardData) => void;
    disableBorrowRequest?: boolean;
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

export function ToolCard({ tool, onRequestBorrow, disableBorrowRequest = false }: ToolCardProps) {
    const toolHref = `/tools/${tool.slug ?? tool.id}`;

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onRequestBorrow) {
            onRequestBorrow(tool);
        } else {
            router.visit(`${toolHref}?request=1`);
        }
    };

    const parts = [`Qty: ${tool.quantity} total`, `${tool.availableQuantity} available`];
    if (tool.borrowedQuantity > 0) {
        parts.push(`${tool.borrowedQuantity} borrowed`);
    }
    if (tool.reservedQuantity && tool.reservedQuantity > 0) {
        parts.push(`${tool.reservedQuantity} reserved`);
    }
    const quantityLabel = parts.join(' · ');

    return (
        <div
            className="group rounded-2xl bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-gray-50 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => router.visit(toolHref)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    router.visit(toolHref);
                }
            }}
        >
            <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 pointer-events-none">
                {tool.imageUrl ? (
                    <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover" />
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
                <div className="absolute top-2 right-2 flex items-center gap-1.5 pointer-events-auto">
                    <FavoriteButton tool={tool} size="sm" />
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses(tool.status)}`}>{tool.status}</span>
                </div>
            </div>

            <div>
                <p className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">{tool.category}</p>
                <h3 className="mt-0.5 text-sm font-semibold text-gray-900">{tool.name}</h3>
                <p className="mt-1 text-[11px] text-gray-500">
                    ID: {tool.toolId} · {tool.condition} · {quantityLabel}
                </p>
            </div>

            {tool.status === 'Available' && (
                <button
                    type="button"
                    className={`mt-3 w-full rounded-full py-1.5 text-[11px] font-semibold text-white ${
                        disableBorrowRequest ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={handleButtonClick}
                    disabled={disableBorrowRequest}
                    title={disableBorrowRequest ? 'Maximum 3 active borrow/request slots reached.' : undefined}
                >
                    {disableBorrowRequest ? 'Borrowing limit reached' : 'Request to Borrow'}
                </button>
            )}

            {tool.status === 'Borrowed' && (
                <button
                    type="button"
                    className="mt-3 w-full rounded-full bg-blue-600 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700"
                    onClick={handleButtonClick}
                >
                    Request a Reservation
                </button>
            )}
        </div>
    );
}
