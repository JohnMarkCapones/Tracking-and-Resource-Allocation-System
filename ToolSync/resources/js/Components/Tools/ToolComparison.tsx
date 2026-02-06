import { create } from 'zustand';
import Modal from '@/Components/Modal';

type CompareTool = {
    id: number;
    name: string;
    toolId: string;
    category: string;
    status: string;
    condition: string;
    specifications: Record<string, string>;
    totalBorrowings: number;
    lastMaintenance: string;
};

type ToolComparisonProps = {
    show: boolean;
    tools: CompareTool[];
    onClose: () => void;
    onRemoveTool: (id: number) => void;
};

function statusClasses(status: string): string {
    if (status === 'Available') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (status === 'Borrowed') return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
}

export function ToolComparison({ show, tools, onClose, onRemoveTool }: ToolComparisonProps) {
    // Gather all specification keys across tools
    const allSpecKeys = [...new Set(tools.flatMap((t) => Object.keys(t.specifications)))];

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compare Tools</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Side-by-side comparison of {tools.length} tools</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {tools.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No tools selected for comparison</p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Add tools from the catalog to compare them</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="py-3 pr-4 text-[10px] font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                        Property
                                    </th>
                                    {tools.map((tool) => (
                                        <th key={tool.id} className="min-w-[180px] px-4 py-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{tool.name}</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{tool.toolId}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveTool(tool.id)}
                                                    className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    aria-label={`Remove ${tool.name}`}
                                                >
                                                    <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
                                                        <path
                                                            d="M3 3L11 11M11 3L3 11"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="py-2.5 pr-4 font-medium text-gray-500 dark:text-gray-400">Status</td>
                                    {tools.map((tool) => (
                                        <td key={tool.id} className="px-4 py-2.5">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses(tool.status)}`}
                                            >
                                                {tool.status}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="py-2.5 pr-4 font-medium text-gray-500 dark:text-gray-400">Category</td>
                                    {tools.map((tool) => (
                                        <td key={tool.id} className="px-4 py-2.5 text-gray-900 dark:text-white">
                                            {tool.category}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="py-2.5 pr-4 font-medium text-gray-500 dark:text-gray-400">Condition</td>
                                    {tools.map((tool) => (
                                        <td key={tool.id} className="px-4 py-2.5 text-gray-900 dark:text-white">
                                            {tool.condition}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="py-2.5 pr-4 font-medium text-gray-500 dark:text-gray-400">Total Borrowings</td>
                                    {tools.map((tool) => (
                                        <td key={tool.id} className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">
                                            {tool.totalBorrowings}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="py-2.5 pr-4 font-medium text-gray-500 dark:text-gray-400">Last Maintenance</td>
                                    {tools.map((tool) => (
                                        <td key={tool.id} className="px-4 py-2.5 text-gray-900 dark:text-white">
                                            {tool.lastMaintenance}
                                        </td>
                                    ))}
                                </tr>

                                {allSpecKeys.length > 0 && (
                                    <tr className="border-b border-gray-200 dark:border-gray-600">
                                        <td
                                            colSpan={tools.length + 1}
                                            className="py-2 text-[10px] font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            Specifications
                                        </td>
                                    </tr>
                                )}

                                {allSpecKeys.map((key) => (
                                    <tr key={key} className="border-b border-gray-100 dark:border-gray-700">
                                        <td className="py-2.5 pr-4 font-medium text-gray-500 dark:text-gray-400">{key}</td>
                                        {tools.map((tool) => (
                                            <td key={tool.id} className="px-4 py-2.5 text-gray-900 dark:text-white">
                                                {tool.specifications[key] ?? '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    );
}

// Compare Store using zustand

type CompareItem = {
    id: number;
    name: string;
    toolId: string;
    category: string;
    status: string;
    condition: string;
    specifications: Record<string, string>;
    totalBorrowings: number;
    lastMaintenance: string;
};

type CompareState = {
    items: CompareItem[];
    addItem: (item: CompareItem) => void;
    removeItem: (id: number) => void;
    clearAll: () => void;
    isInCompare: (id: number) => boolean;
};

export const useCompareStore = create<CompareState>()((set, get) => ({
    items: [],
    addItem: (item) => {
        set((state) => {
            if (state.items.length >= 3) return state;
            if (state.items.some((i) => i.id === item.id)) return state;
            return { items: [...state.items, item] };
        });
    },
    removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    },
    clearAll: () => set({ items: [] }),
    isInCompare: (id) => get().items.some((i) => i.id === id),
}));
