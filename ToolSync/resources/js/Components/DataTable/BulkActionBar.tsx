import type { ReactNode } from 'react';

type BulkAction = {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger' | 'success' | 'warning';
    icon?: ReactNode;
};

type BulkActionBarProps = {
    selectedCount: number;
    itemLabel?: string;
    actions: BulkAction[];
    onClear: () => void;
};

const variantClasses = {
    default: 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    danger: 'border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
    success: 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50',
    warning: 'border-amber-200 bg-white text-amber-600 hover:bg-amber-50',
};

export function BulkActionBar({ selectedCount, itemLabel = 'item', actions, onClear }: BulkActionBarProps) {
    if (selectedCount === 0) {
        return null;
    }

    const pluralLabel = selectedCount === 1 ? itemLabel : `${itemLabel}s`;

    return (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transform">
            <div className="flex items-center gap-3 rounded-full bg-slate-900 px-4 py-2.5 text-sm text-white shadow-xl">
                <p className="whitespace-nowrap">
                    <span className="font-semibold">{selectedCount}</span> {pluralLabel} selected
                </p>

                <div className="h-4 w-px bg-slate-700" />

                <div className="flex items-center gap-2">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={action.onClick}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                                variantClasses[action.variant ?? 'default']
                            }`}
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={onClear}
                        className="rounded-full px-3 py-1 text-[11px] font-medium text-slate-300 hover:text-white"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}
