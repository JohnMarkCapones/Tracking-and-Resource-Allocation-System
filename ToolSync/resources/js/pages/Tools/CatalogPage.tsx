import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState, useMemo, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { EmptyState } from '@/Components/EmptyState';
import { toast } from '@/Components/Toast';
import { RequestToolModal } from '@/Components/Tools/RequestToolModal';
import { ToolCard, type ToolCardData } from '@/Components/Tools/ToolCard';
import { ToolFilters } from '@/Components/Tools/ToolFilters';
import AppLayout from '@/Layouts/AppLayout';
import type { ToolDto, ToolCategoryDto } from '@/lib/apiTypes';
import { mapToolStatusToUi } from '@/lib/apiTypes';
import { apiRequest } from '@/lib/http';

function mapToolToCardData(dto: ToolDto): ToolCardData {
    const availableQuantity = Math.max(0, Number(dto.quantity ?? 0));
    const borrowedQuantity = Math.max(0, Number(dto.borrowed_count ?? 0));

    return {
        id: dto.id,
        name: dto.name,
        toolId: 'TL-' + dto.id,
        category: dto.category?.name ?? 'Other',
        status: mapToolStatusToUi(dto.status),
        condition: dto.condition ?? 'Good',
        quantity: availableQuantity + borrowedQuantity,
        availableQuantity,
        borrowedQuantity,
        imageUrl: dto.image_path ? (dto.image_path.startsWith('http') ? dto.image_path : `/${dto.image_path}`) : undefined,
    };
}

export default function CatalogPage() {
    const toLocalYmd = (date: Date): string => format(date, 'yyyy-MM-dd');

    const [tools, setTools] = useState<ToolCardData[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState<ToolCardData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [toolsRes, categoriesRes] = await Promise.all([
                    apiRequest<{ data: ToolDto[] }>('/api/tools'),
                    apiRequest<{ data: ToolCategoryDto[] }>('/api/tool-categories'),
                ]);
                if (cancelled) return;
                setTools((toolsRes.data ?? []).map(mapToolToCardData));
                setCategories((categoriesRes.data ?? []).map((c) => c.name));
            } catch (err) {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : 'Failed to load tools');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const [search, setSearch] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    const filteredTools = useMemo(() => {
        const query = search.trim().toLowerCase();

        return tools.filter((tool) => {
            if (selectedCategories.length > 0 && !selectedCategories.includes(tool.category)) {
                return false;
            }

            if (selectedStatuses.length > 0 && !selectedStatuses.includes(tool.status)) {
                return false;
            }

            if (!query) return true;

            const haystack = `${tool.name} ${tool.toolId} ${tool.category}`.toLowerCase();
            return haystack.includes(query);
        });
    }, [tools, search, selectedCategories, selectedStatuses]);

    const handleClearAll = () => {
        setSelectedCategories([]);
        setSelectedStatuses([]);
        setSearch('');
    };

    const handleRequestBorrow = (tool: ToolCardData) => {
        setSelectedTool(tool);
        setIsRequestModalOpen(true);
    };

    const handleRequestSubmit = async (data: { dateRange: DateRange; purpose: string }) => {
        if (!selectedTool || !data.dateRange.from || !data.dateRange.to) {
            toast.error('Please select a valid date range.');
            return;
        }

        setIsSubmitting(true);

        const startDate = toLocalYmd(data.dateRange.from);
        const endDate = toLocalYmd(data.dateRange.to);

        try {
            if (selectedTool.status === 'Borrowed') {
                await apiRequest('/api/reservations', {
                    method: 'POST',
                    body: {
                        tool_id: selectedTool.id,
                        start_date: startDate,
                        end_date: endDate,
                        recurring: false,
                    },
                });
                setIsRequestModalOpen(false);
                toast.success('Reservation created successfully!');
                router.visit('/reservations');
                return;
            }

            // Available tool: create a borrow request (reservation PENDING) for admin approval
            await apiRequest<{ message: string }>('/api/reservations', {
                method: 'POST',
                body: {
                    tool_id: selectedTool.id,
                    start_date: startDate,
                    end_date: endDate,
                    recurring: false,
                    borrow_request: true,
                },
            });

            setIsRequestModalOpen(false);
            toast.success('Borrowing request submitted for approval!');
            
            // Reload the tools list
            const toolsRes = await apiRequest<{ data: ToolDto[] }>('/api/tools');
            setTools((toolsRes.data ?? []).map(mapToolToCardData));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to submit request.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
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
                {error && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                )}
                {loading && (
                    <div className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        Loading tools…
                    </div>
                )}
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
                        <span className="mx-2 h-4 w-px bg-gray-200" />
                        <Link
                            href="/reservations"
                            className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-gray-800"
                        >
                            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M3 5.5C3 4.67157 3.67157 4 4.5 4H11.5C12.3284 4 13 4.67157 13 5.5V11.5C13 12.3284 12.3284 13 11.5 13H4.5C3.67157 13 3 12.3284 3 11.5V5.5Z"
                                    stroke="currentColor"
                                    strokeWidth="1.3"
                                />
                                <path d="M6 3V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                <path d="M10 3V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                <path d="M3 7H13" stroke="currentColor" strokeWidth="1.3" />
                            </svg>
                            My reservations
                        </Link>
                    </div>
                </section>

                {!loading && (
                <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                    <div className="rounded-3xl bg-white p-5 shadow-sm lg:sticky lg:top-4 lg:self-start">
                        <ToolFilters
                            categories={categories}
                            selectedCategories={selectedCategories}
                            onCategoriesChange={setSelectedCategories}
                            selectedStatuses={selectedStatuses}
                            onStatusesChange={setSelectedStatuses}
                            onClearAll={handleClearAll}
                        />
                    </div>

                    <section className="rounded-3xl bg-white p-5 shadow-sm">
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
                            <div className="grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredTools.map((tool) => (
                                    <ToolCard key={tool.id} tool={tool} onRequestBorrow={handleRequestBorrow} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
                )}
            </div>

            {selectedTool && (
                <RequestToolModal
                    show={isRequestModalOpen}
                    toolName={selectedTool.name}
                    toolId={selectedTool.toolId}
                    onClose={() => {
                        if (isSubmitting) {
                            return;
                        }
                        setIsRequestModalOpen(false);
                        setSelectedTool(null);
                    }}
                    onSubmit={handleRequestSubmit}
                />
            )}
        </AppLayout>
    );
}
