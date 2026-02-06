import { useState, useMemo } from 'react';

export type ToolStatus = 'Available' | 'Borrowed' | 'Maintenance';

export type Tool = {
    id: number;
    name: string;
    toolId: string;
    category: string;
    status: ToolStatus;
    condition: string;
    lastMaintenance: string;
    totalBorrowings: number;
    /** Shown on tool detail page; optional in list view */
    description?: string;
    /** Key-value specs (e.g. Processor, Memory); optional in list view */
    specifications?: Record<string, string>;
};

type ToolTableProps = {
    tools: Tool[];
    onEdit: (tool: Tool) => void;
    onDelete: (tool: Tool) => void;
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
};

type SortKey = 'name' | 'category' | 'status' | 'totalBorrowings';

function statusClasses(status: ToolStatus): string {
    if (status === 'Available') {
        return 'bg-emerald-50 text-emerald-700';
    }

    if (status === 'Borrowed') {
        return 'bg-amber-50 text-amber-700';
    }

    return 'bg-rose-50 text-rose-700';
}

export function ToolTable({ tools, onEdit, onDelete, selectedIds, onSelectionChange }: ToolTableProps) {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortKey>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const filteredAndSorted = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = tools.filter((tool) => {
            if (!query) return true;
            const haystack = `${tool.name} ${tool.toolId} ${tool.category}`.toLowerCase();
            return haystack.includes(query);
        });

        return [...filtered].sort((a, b) => {
            const direction = sortDir === 'asc' ? 1 : -1;

            if (sortBy === 'totalBorrowings') {
                return (a.totalBorrowings - b.totalBorrowings) * direction;
            }

            const aValue = a[sortBy] as string;
            const bValue = b[sortBy] as string;
            return aValue.localeCompare(bValue) * direction;
        });
    }, [tools, search, sortBy, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filteredAndSorted.slice(startIndex, startIndex + pageSize);

    const toggleSort = (key: SortKey) => {
        if (sortBy === key) {
            setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(key);
            setSortDir('asc');
        }
    };

    const allSelected = paginated.length > 0 && paginated.every((tool) => selectedIds.includes(tool.id));

    const toggleAll = () => {
        if (allSelected) {
            onSelectionChange(selectedIds.filter((id) => !paginated.some((tool) => tool.id === id)));
        } else {
            const newIds = paginated.map((tool) => tool.id).filter((id) => !selectedIds.includes(id));
            onSelectionChange([...selectedIds, ...newIds]);
        }
    };

    const toggleOne = (id: number) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((sid) => sid !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center rounded-full bg-gray-50 px-3 py-1.5 text-xs text-gray-500 shadow-sm">
                    <svg className="mr-2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Search tools..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-48 border-none bg-transparent text-xs outline-none placeholder:text-gray-400"
                    />
                </div>
                <p className="text-[11px] text-gray-500">{filteredAndSorted.length} tools total</p>
            </div>

            <div className="max-h-[460px] overflow-x-auto overflow-y-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 border-b bg-white/90 text-xs font-medium tracking-wide text-gray-500 uppercase backdrop-blur">
                        <tr>
                            <th className="py-3 pr-2">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </th>
                            <th className="py-3 pr-4">
                                <button
                                    type="button"
                                    onClick={() => toggleSort('name')}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                >
                                    Tool
                                    {sortBy === 'name' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                </button>
                            </th>
                            <th className="py-3 pr-4">ID</th>
                            <th className="py-3 pr-4">
                                <button
                                    type="button"
                                    onClick={() => toggleSort('category')}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                >
                                    Category
                                    {sortBy === 'category' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                </button>
                            </th>
                            <th className="py-3 pr-4">
                                <button
                                    type="button"
                                    onClick={() => toggleSort('status')}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                >
                                    Status
                                    {sortBy === 'status' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                </button>
                            </th>
                            <th className="py-3 pr-4">Condition</th>
                            <th className="py-3 pr-4">
                                <button
                                    type="button"
                                    onClick={() => toggleSort('totalBorrowings')}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                >
                                    Borrowings
                                    {sortBy === 'totalBorrowings' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                </button>
                            </th>
                            <th className="py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="align-middle text-xs text-gray-700">
                        {paginated.map((tool, index) => {
                            const isSelected = selectedIds.includes(tool.id);

                            return (
                                <tr
                                    key={tool.id}
                                    className={`border-b last:border-0 ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    } ${isSelected ? 'bg-blue-50' : ''} hover:bg-gray-100/80`}
                                >
                                    <td className="py-3 pr-2">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleOne(tool.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="py-3 pr-4 font-medium text-gray-900">{tool.name}</td>
                                    <td className="py-3 pr-4 font-mono text-gray-500">{tool.toolId}</td>
                                    <td className="py-3 pr-4">{tool.category}</td>
                                    <td className="py-3 pr-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusClasses(tool.status)}`}
                                        >
                                            {tool.status}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4">{tool.condition}</td>
                                    <td className="py-3 pr-4 text-center">{tool.totalBorrowings}</td>
                                    <td className="py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(tool)}
                                                className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDelete(tool)}
                                                className="rounded-full border border-rose-200 px-3 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredAndSorted.length > 0 && (
                <footer className="mt-4 flex items-center justify-between text-[11px] text-gray-500">
                    <p>
                        Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                        <span className="font-semibold">{Math.min(startIndex + pageSize, filteredAndSorted.length)}</span> of{' '}
                        <span className="font-semibold">{filteredAndSorted.length}</span> tools
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span>
                            Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
}
