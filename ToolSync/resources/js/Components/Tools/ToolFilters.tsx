type ToolFiltersProps = {
    categories: string[];
    selectedCategory: string | null;
    onCategoryChange: (category: string | null) => void;
    selectedStatus: string | null;
    onStatusChange: (status: string | null) => void;
    onClearAll: () => void;
};

const STATUSES = ['Available', 'Borrowed', 'Maintenance'];

export function ToolFilters({ categories, selectedCategory, onCategoryChange, selectedStatus, onStatusChange, onClearAll }: ToolFiltersProps) {
    const hasFilters = selectedCategory !== null || selectedStatus !== null;

    return (
        <aside className="space-y-6">
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-900">Filters</h3>
                    {hasFilters && (
                        <button type="button" onClick={onClearAll} className="text-[11px] font-medium text-blue-600 hover:underline">
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            <div>
                <h4 className="mb-2 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Category</h4>
                <div className="space-y-1">
                    {categories.map((category) => (
                        <label key={category} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-gray-50">
                            <input
                                type="radio"
                                name="category"
                                checked={selectedCategory === category}
                                onChange={() => onCategoryChange(selectedCategory === category ? null : category)}
                                className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">{category}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="mb-2 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Status</h4>
                <div className="space-y-1">
                    {STATUSES.map((status) => (
                        <label key={status} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-gray-50">
                            <input
                                type="radio"
                                name="status"
                                checked={selectedStatus === status}
                                onChange={() => onStatusChange(selectedStatus === status ? null : status)}
                                className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">{status}</span>
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );
}
