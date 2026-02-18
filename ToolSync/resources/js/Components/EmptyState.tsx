import type { ReactNode } from 'react';

type EmptyStateProps = {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
};

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
    return (
        <div
            className={`flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center dark:border-gray-700 dark:bg-gray-800/50 ${className}`}
        >
            {icon && (
                <div className="mb-3 text-gray-400 dark:text-gray-500" aria-hidden="true">
                    {icon}
                </div>
            )}
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{title}</p>
            {description && <p className="mt-1 max-w-xs text-[11px] text-gray-500 dark:text-gray-400">{description}</p>}
            {action && (
                <button
                    type="button"
                    onClick={action.onClick}
                    className="mt-3 rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
