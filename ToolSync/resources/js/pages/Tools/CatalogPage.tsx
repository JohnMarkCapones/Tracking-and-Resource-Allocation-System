import { Head, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { EmptyState } from '@/Components/EmptyState';
import { ToolCard, type ToolCardData } from '@/Components/Tools/ToolCard';
import { ToolFilters } from '@/Components/Tools/ToolFilters';
import AppLayout from '@/Layouts/AppLayout';

type CatalogPageProps = {
    tools: ToolCardData[];
    categories: string[];
};

export default function CatalogPage() {
    const { tools, categories } = usePage<CatalogPageProps>().props;

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const filteredTools = useMemo(() => {
        const query = search.trim().toLowerCase();

        return tools.filter((tool) => {
            if (selectedCategory && tool.category !== selectedCategory) {
                return false;
            }

            if (selectedStatus && tool.status !== selectedStatus) {
                return false;
            }

            if (!query) return true;

            const haystack = `${tool.name} ${tool.toolId} ${tool.category}`.toLowerCase();
            return haystack.includes(query);
        });
    }, [tools, search, selectedCategory, selectedStatus]);

    const handleClearAll = () => {
        setSelectedCategory(null);
        setSelectedStatus(null);
        setSearch('');
    };

    return (
        <AppLayout
            activeRoute="tools-borrowing"
            header={
                <>
                    <p className="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">Tool catalog</p>
                    <h1 className="text-2xl font-semibold text-gray-900">Browse and borrow equipment</h1>
                </>
            }
        >
            <Head title="Tool Catalog" />

            <div className="space-y-6">
                <section className="flex flex-col gap-4 rounded-3xl bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center rounded-full bg-white px-4 py-2 shadow-sm">
                        <svg className="mr-2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="9" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.6" />
                            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        <input
                            type="search"
                            placeholder="Search tools by name or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-64 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <span className="font-semibold text-gray-900">{filteredTools.length}</span>
                        <span>tools found</span>
                        {tools.filter((t) => t.status === 'Available').length > 0 && (
                            <>
                                <span className="mx-1 text-gray-300">·</span>
                                <span className="text-emerald-600">{tools.filter((t) => t.status === 'Available').length} available</span>
                            </>
                        )}
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                    <div className="rounded-3xl bg-white p-5 shadow-sm lg:sticky lg:top-4 lg:self-start">
                        <ToolFilters
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            selectedStatus={selectedStatus}
                            onStatusChange={setSelectedStatus}
                            onClearAll={handleClearAll}
                        />
                    </div>

                    <div>
                        {filteredTools.length === 0 ? (
                            <EmptyState
                                icon={
                                    <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="18" cy="18" r="9" stroke="currentColor" strokeWidth="2" />
                                        <path d="M25 25L32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                }
                                title="No tools match your filters"
                                description="Try adjusting your search or filters to find what you're looking for."
                                action={{
                                    label: 'Clear Filters',
                                    onClick: handleClearAll,
                                }}
                            />
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredTools.map((tool) => (
                                    <ToolCard key={tool.id} tool={tool} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
