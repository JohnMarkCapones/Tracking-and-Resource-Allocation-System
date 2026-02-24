import { router } from '@inertiajs/react';
import { FavoriteButton } from '@/Components/FavoriteButton';

export type ToolCardStatus = 'Available' | 'Borrowed' | 'Maintenance' | 'Partially Available' | 'Fully Reserved' | 'Unavailable';

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
    hasConditionHistory?: boolean;
    latestAdminCondition?: string | null;
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

    if (status === 'Maintenance') {
        return 'bg-rose-50 text-rose-700';
    }

    if (status === 'Partially Available') {
        return 'bg-blue-50 text-blue-700';
    }

    if (status === 'Fully Reserved') {
        return 'bg-orange-50 text-orange-700';
    }

    // Unavailable
    return 'bg-gray-50 text-gray-700';
}

function conditionClasses(condition: string): string {
    const key = condition.toLowerCase();
    if (key === 'damaged') return 'bg-rose-100 text-rose-700';
    if (key === 'poor') return 'bg-amber-100 text-amber-700';
    if (key === 'excellent') return 'bg-emerald-100 text-emerald-700';
    return 'bg-slate-100 text-slate-700';
}

export function ToolCard({ tool, onRequestBorrow, disableBorrowRequest = false }: ToolCardProps) {
    const toolHref = `/tools/${tool.slug ?? tool.id}`;
    const displayCondition = tool.latestAdminCondition?.trim() ? tool.latestAdminCondition : tool.condition;

    const handleButtonClick = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

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
    const quantityLabel = parts.join(' | ');

    return (
        <div
            className="group cursor-pointer rounded-2xl bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md"
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
            <div className="pointer-events-none relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
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
                <div className="pointer-events-auto absolute top-2 right-2 flex items-center gap-1.5">
                    <FavoriteButton tool={tool} size="sm" />
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses(tool.status)}`}>{tool.status}</span>
                </div>
            </div>

            <div>
                <p className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">{tool.category}</p>
                <h3 className="mt-0.5 text-sm font-semibold text-gray-900">{tool.name}</h3>

                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${conditionClasses(displayCondition)}`}>
                        {displayCondition}
                    </span>
                    {tool.latestAdminCondition && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            Admin verified
                        </span>
                    )}
                    {tool.hasConditionHistory && (
                        <button
                            type="button"
                            className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                router.visit(`${toolHref}#condition-history`);
                            }}
                        >
                            View history
                        </button>
                    )}
                </div>

                <p className="mt-1 text-[11px] text-gray-500">ID: {tool.toolId} | {quantityLabel}</p>
            </div>

            {(tool.status === 'Available' || tool.status === 'Partially Available') && (
                <button
                    type="button"
                    className={`mt-3 w-full rounded-full py-1.5 text-[11px] font-semibold text-white ${
                        disableBorrowRequest ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={handleButtonClick}
                    disabled={disableBorrowRequest}
                    title={disableBorrowRequest ? 'Maximum active borrowings reached. Return a tool before borrowing another.' : undefined}
                >
                    {disableBorrowRequest ? 'Borrowing limit reached' : 'Request to Borrow'}
                </button>
            )}

            {(tool.status === 'Borrowed' || tool.status === 'Fully Reserved' || tool.status === 'Unavailable') && (
                <button
                    type="button"
                    className={`mt-3 w-full rounded-full py-1.5 text-[11px] font-semibold text-white ${
                        disableBorrowRequest ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={handleButtonClick}
                    disabled={disableBorrowRequest}
                    title={disableBorrowRequest ? 'Maximum active borrowings reached. Return a tool before borrowing another.' : undefined}
                >
                    {disableBorrowRequest ? 'Borrowing limit reached' : 'Request a Reservation'}
                </button>
            )}
        </div>
    );
}
