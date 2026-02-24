import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { EmptyState } from '@/Components/EmptyState';
import { SkeletonCard } from '@/Components/Skeleton';
import { toast } from '@/Components/Toast';
import { RequestToolModal } from '@/Components/Tools/RequestToolModal';
import { ToolCard, type ToolCardData } from '@/Components/Tools/ToolCard';
import { ToolFilters } from '@/Components/Tools/ToolFilters';
import AppLayout from '@/Layouts/AppLayout';
import type { DashboardApiResponse, ReservationApiItem, ToolDto, ToolCategoryDto } from '@/lib/apiTypes';
import { mapToolStatusToUi, mapAvailabilityStatusToUi } from '@/lib/apiTypes';
import { apiRequest } from '@/lib/http';

const DEFAULT_MAX_BORROWINGS = 3;
const PAGE_SIZE = 18;

type ToolsMeta = {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
};

type ToolsIndexResponse = {
    data: ToolDto[];
    meta?: ToolsMeta;
};

type ToolRangeAvailabilityResponse = {
    data: {
        total_quantity: number;
        available_count: number;
        available_for_dates?: Record<string, number>;
        availability_status?: string;
        availability_message?: string;
    };
};

function mapToolToCardData(dto: ToolDto): ToolCardData {
    // Use calculated availability from backend if available, otherwise calculate manually
    const calculatedAvailable = dto.calculated_available_count;
    const calculatedReserved = dto.calculated_reserved_count ?? dto.reserved_count ?? 0;
    const borrowedQuantity = Math.max(0, Number(dto.borrowed_count ?? 0));
    const totalQuantity = Number(dto.quantity ?? 0);

    // Calculate availability: prefer backend calculation, fallback to manual
    const availableQuantity =
        calculatedAvailable !== undefined
            ? Math.max(0, calculatedAvailable)
            : Math.max(0, totalQuantity - borrowedQuantity - calculatedReserved);

    // Use availability status from backend if available, otherwise fall back to tool status
    const status = dto.availability_status 
        ? mapAvailabilityStatusToUi(dto.availability_status)
        : mapToolStatusToUi(dto.status);

    return {
        id: dto.id,
        name: dto.name,
        slug: dto.slug ?? null,
        toolId: 'TL-' + dto.id,
        category: dto.category?.name ?? 'Other',
        status,
        condition: dto.latest_admin_condition ?? dto.condition ?? 'Good',
        quantity: totalQuantity,
        availableQuantity,
        borrowedQuantity,
        reservedQuantity: calculatedReserved,
        hasConditionHistory: (dto.condition_histories_count ?? 0) > 0,
        latestAdminCondition: dto.latest_admin_condition ?? null,
        imageUrl: dto.image_path ?? undefined,
    };
}

type CatalogPageProps = { auth?: { user?: { id: number } } };

export default function CatalogPage() {
    const inertiaPage = usePage<CatalogPageProps>();
    const userId = inertiaPage.props.auth?.user?.id;
    const toLocalYmd = (date: Date): string => format(date, 'yyyy-MM-dd');

    // Dashboard counts must be scoped to the current user so the borrow limit reflects
    // their own slots (not system-wide). Admins otherwise see "Borrowing limit reached"
    // because the dashboard returns all users' counts when user_id is not passed.
    const dashboardUrl = userId != null ? `/api/dashboard?user_id=${userId}` : '/api/dashboard';

    const getMinAvailabilityForRange = (availability: ToolRangeAvailabilityResponse['data']): number => {
        const perDayAvailability = Object.values(availability.available_for_dates ?? {});
        if (perDayAvailability.length > 0) {
            return Math.min(...perDayAvailability);
        }

        return Number(availability.available_count ?? 0);
    };

    const [tools, setTools] = useState<ToolCardData[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryDtos, setCategoryDtos] = useState<ToolCategoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState<ToolCardData | null>(null);
    const [selectedToolIds, setSelectedToolIds] = useState<Set<number>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeBorrowingsCount, setActiveBorrowingsCount] = useState(0);
    const [pendingBorrowRequestsCount, setPendingBorrowRequestsCount] = useState(0);
    const [maxBorrowings, setMaxBorrowings] = useState(DEFAULT_MAX_BORROWINGS);
    const [search, setSearch] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [, setTotalPages] = useState(1);
    const [totalTools, setTotalTools] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);
    const [randomSeed, setRandomSeed] = useState<string | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Limit is based only on active borrowings (scheduled + borrowed + pending return).
    // Pending reservation requests (not yet approved) do not count toward the max.
    const borrowSlotsUsed = activeBorrowingsCount;

    const fetchTools = async (options?: {
        page?: number;
        search?: string;
        categories?: string[];
        statuses?: string[];
        append?: boolean;
    }) => {
        const effectivePage = options?.page ?? page;
        const effectiveSearch = options?.search ?? search;
        const effectiveCategories = options?.categories ?? selectedCategories;
        const effectiveStatuses = options?.statuses ?? selectedStatuses;
        const append = options?.append ?? false;
        const seed = randomSeed;

        const params = new URLSearchParams();
        params.set('paginated', '1');
        params.set('page', String(effectivePage));
        params.set('per_page', String(PAGE_SIZE));

        if (seed) {
            params.set('random_seed', seed);
        }

        if (effectiveSearch.trim()) {
            params.set('search', effectiveSearch.trim());
        }

        if (effectiveStatuses.length > 0) {
            const statusToApi = (s: string): 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE' => {
                if (s === 'Borrowed') return 'BORROWED';
                if (s === 'Maintenance') return 'MAINTENANCE';
                return 'AVAILABLE';
            };

            for (const status of effectiveStatuses) {
                params.append('status[]', statusToApi(status));
            }
        }

        if (effectiveCategories.length > 0 && categoryDtos.length > 0) {
            const ids = effectiveCategories
                .map((name) => categoryDtos.find((c) => c.name === name)?.id)
                .filter((id): id is number => typeof id === 'number');

            for (const id of ids) {
                params.append('category_id[]', String(id));
            }
        }

        if (append) {
            setIsLoadingMore(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const res = await apiRequest<ToolsIndexResponse>(`/api/tools?${params.toString()}`);
            const meta = res.meta;

            setTools((prev) =>
                append ? [...prev, ...(res.data ?? []).map(mapToolToCardData)] : (res.data ?? []).map(mapToolToCardData),
            );

            if (meta) {
                setPage(meta.current_page);
                setTotalPages(meta.last_page || 1);
                setTotalTools(meta.total ?? (res.data?.length ?? 0));
                setHasMore(meta.current_page < (meta.last_page || 1));
            } else {
                setPage(effectivePage);
                setTotalPages(1);
                setTotalTools(res.data?.length ?? 0);
                setHasMore(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load tools');
        } finally {
            if (append) {
                setIsLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        let cancelled = false;

        async function loadInitial() {
            setLoading(true);
            setError(null);
            try {
                const seed = Math.random().toString(36).slice(2);
                setRandomSeed(seed);

                const [toolsRes, categoriesRes, dashboardRes, reservationsRes] = await Promise.all([
                    apiRequest<ToolsIndexResponse>(`/api/tools?paginated=1&page=1&per_page=${PAGE_SIZE}&random_seed=${seed}`),
                    apiRequest<{ data: ToolCategoryDto[] }>('/api/tool-categories'),
                    apiRequest<DashboardApiResponse>(dashboardUrl),
                    apiRequest<{ data: ReservationApiItem[] }>('/api/reservations'),
                ]);
                if (cancelled) return;

                const meta = toolsRes.meta;
                setTools((toolsRes.data ?? []).map(mapToolToCardData));
                if (meta) {
                    setPage(meta.current_page);
                    setTotalPages(meta.last_page || 1);
                    setTotalTools(meta.total ?? (toolsRes.data?.length ?? 0));
                    setHasMore(meta.current_page < (meta.last_page || 1));
                } else {
                    setPage(1);
                    setTotalPages(1);
                    setTotalTools(toolsRes.data?.length ?? 0);
                    setHasMore(false);
                }

                const categoryData = categoriesRes.data ?? [];
                setCategoryDtos(categoryData);
                setCategories(categoryData.map((c) => c.name));

                setMaxBorrowings(
                    dashboardRes.data.max_borrowings ?? DEFAULT_MAX_BORROWINGS,
                );
                setActiveBorrowingsCount(
                    (dashboardRes.data.counts.borrowed_active_count ?? 0) +
                    (dashboardRes.data.counts.scheduled_active_count ?? 0),
                );
                setPendingBorrowRequestsCount((reservationsRes.data ?? []).filter((r) => r.status === 'pending').length);
                setInitialLoaded(true);
            } catch (err) {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : 'Failed to load tools');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadInitial();
        return () => {
            cancelled = true;
        };
    }, [dashboardUrl]);

    const handleClearAll = () => {
        setSelectedCategories([]);
        setSelectedStatuses([]);
        setSearch('');
        setPage(1);
        const seed = Math.random().toString(36).slice(2);
        setRandomSeed(seed);
        void fetchTools({ page: 1, search: '', categories: [], statuses: [], append: false });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
        const seed = Math.random().toString(36).slice(2);
        setRandomSeed(seed);
        void fetchTools({ page: 1, search: value, append: false });
    };

    const handleCategoriesChange = (nextCategories: string[]) => {
        setSelectedCategories(nextCategories);
        setPage(1);
        const seed = Math.random().toString(36).slice(2);
        setRandomSeed(seed);
        void fetchTools({ page: 1, categories: nextCategories, append: false });
    };

    const handleStatusesChange = (nextStatuses: string[]) => {
        setSelectedStatuses(nextStatuses);
        setPage(1);
        const seed = Math.random().toString(36).slice(2);
        setRandomSeed(seed);
        void fetchTools({ page: 1, statuses: nextStatuses, append: false });
    };

    useEffect(() => {
        if (!initialLoaded) return;
        const node = loadMoreRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry?.isIntersecting) return;
                if (loading || isLoadingMore) return;
                if (!hasMore) return;

                const nextPage = page + 1;
                setPage(nextPage);
                void fetchTools({ page: nextPage, append: true });
            },
            { root: null, rootMargin: '200px 0px', threshold: 0.1 },
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLoaded, loading, isLoadingMore, hasMore, page]);

    const handleRequestBorrow = (tool: ToolCardData) => {
        if (tool.status === 'Available' && borrowSlotsUsed >= maxBorrowings) {
            toast.error(`You have reached the maximum of ${maxBorrowings} active borrowings. Return a tool before borrowing another.`);
            return;
        }
        setSelectedTool(tool);
        setSelectedToolIds(new Set());
        setIsRequestModalOpen(true);
    };

    const handleSelectChange = (tool: ToolCardData, selected: boolean) => {
        setSelectedToolIds((prev) => {
            const next = new Set(prev);
            if (selected) next.add(tool.id);
            else next.delete(tool.id);
            return next;
        });
    };

    const selectedTools = tools.filter((t) => selectedToolIds.has(t.id));

    const handleBatchRequestClick = () => {
        if (selectedTools.length === 0) return;
        if (borrowSlotsUsed + selectedTools.length > maxBorrowings) {
            toast.error(`You can have at most ${maxBorrowings} active borrowings. You have ${borrowSlotsUsed}. Return a tool before requesting more.`);
            return;
        }
        setSelectedTool(null);
        setIsRequestModalOpen(true);
    };

    const handleRequestSubmit = async (data: { dateRange: DateRange; purpose: string }) => {
        if (!data.dateRange.from || !data.dateRange.to) {
            toast.error('Please select a valid date range.');
            return;
        }

        const toolsToRequest = selectedTools.length > 0 ? selectedTools : selectedTool ? [selectedTool] : [];
        if (toolsToRequest.length === 0) {
            toast.error('No tools selected.');
            return;
        }

        setIsSubmitting(true);

        try {
            const startDate = toLocalYmd(data.dateRange.from);
            const endDate = toLocalYmd(data.dateRange.to);

            const rangeChecks = await Promise.all(
                toolsToRequest.map(async (toolItem) => {
                    const availability = await apiRequest<ToolRangeAvailabilityResponse>(
                        `/api/tools/${toolItem.id}/availability?from=${startDate}&to=${endDate}`,
                    );
                    const minAvailability = getMinAvailabilityForRange(availability.data);

                    return {
                        tool: toolItem,
                        minAvailability,
                        message: availability.data.availability_message,
                        available: minAvailability > 0,
                    };
                }),
            );

            const unavailable = rangeChecks.filter((check) => !check.available);
            if (unavailable.length > 0) {
                if (unavailable.length === 1) {
                    const single = unavailable[0];
                    toast.error(single.message ?? `${single.tool.name} is fully reserved for the selected dates.`);
                } else {
                    const names = unavailable.map((check) => check.tool.name).join(', ');
                    toast.error(`Some selected tools are fully reserved for those dates: ${names}.`);
                }

                return;
            }

            if (toolsToRequest.length > 1) {
                await apiRequest<{ message: string }>('/api/reservations/batch', {
                    method: 'POST',
                    body: {
                        tool_ids: toolsToRequest.map((t) => t.id),
                        start_date: startDate,
                        end_date: endDate,
                    },
                });
                toast.success(`${toolsToRequest.length} borrow request(s) submitted for approval!`);
                setSelectedToolIds(new Set());
            } else {
                await apiRequest<{ message: string }>('/api/reservations', {
                    method: 'POST',
                    body: {
                        tool_id: toolsToRequest[0].id,
                        start_date: startDate,
                        end_date: endDate,
                        recurring: false,
                    },
                });
                toast.success('Borrow request submitted for approval!');
            }

            setIsRequestModalOpen(false);
            setSelectedTool(null);

            const [toolsRes, dashboardRes, reservationsRes] = await Promise.all([
                apiRequest<ToolsIndexResponse>(`/api/tools?paginated=1&page=${page}&per_page=${PAGE_SIZE}${randomSeed ? `&random_seed=${randomSeed}` : ''}`),
                apiRequest<DashboardApiResponse>(dashboardUrl),
                apiRequest<{ data: ReservationApiItem[] }>('/api/reservations'),
            ]);
            const meta = toolsRes.meta;
            setTools((toolsRes.data ?? []).map(mapToolToCardData));
            if (meta) {
                setPage(meta.current_page);
                setTotalPages(meta.last_page || 1);
                setTotalTools(meta.total ?? (toolsRes.data?.length ?? 0));
            } else {
                setTotalTools(toolsRes.data?.length ?? 0);
            }
            setMaxBorrowings(dashboardRes.data.max_borrowings ?? DEFAULT_MAX_BORROWINGS);
            setActiveBorrowingsCount(
                (dashboardRes.data.counts.borrowed_active_count ?? 0) +
                (dashboardRes.data.counts.scheduled_active_count ?? 0),
            );
            setPendingBorrowRequestsCount((reservationsRes.data ?? []).filter((r) => r.status === 'pending').length);
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
                {loading && !initialLoaded && (
                    <div className="rounded-xl bg-gray-50 px-4 py-6 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <SkeletonCard key={index} showImage lines={3} />
                            ))}
                        </div>
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
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-64 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <span className="font-semibold text-gray-900">{totalTools}</span>
                        <span>tools found</span>
                        {tools.filter((t) => t.status === 'Available').length > 0 && (
                            <>
                                <span className="mx-1 text-gray-300">·</span>
                                <span className="text-emerald-600">{tools.filter((t) => t.status === 'Available').length} available on this page</span>
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
                            onCategoriesChange={handleCategoriesChange}
                            selectedStatuses={selectedStatuses}
                            onStatusesChange={handleStatusesChange}
                            onClearAll={handleClearAll}
                        />
                    </div>

                    <section className="rounded-3xl bg-white p-5 shadow-sm">
                        {tools.length === 0 ? (
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
                                {tools.map((tool) => (
                                    <ToolCard
                                        key={tool.id}
                                        tool={tool}
                                        onRequestBorrow={handleRequestBorrow}
                                        disableBorrowRequest={borrowSlotsUsed >= maxBorrowings}
                                    />
                                ))}
                                {isLoadingMore &&
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <SkeletonCard key={`skeleton-${index}`} showImage lines={2} />
                                    ))}
                            </div>
                        )}
                        <div ref={loadMoreRef} className="mt-4 h-6 w-full" aria-hidden="true" />
                    </section>
                </div>
                )}
            </div>

            {(selectedTool || selectedTools.length > 0) && (
                <RequestToolModal
                    show={isRequestModalOpen}
                    toolName={selectedTool?.name}
                    toolId={selectedTool?.toolId}
                    tools={selectedTools.length > 0 ? selectedTools : undefined}
                    submitting={isSubmitting}
                    onClose={() => {
                        if (isSubmitting) return;
                        setIsRequestModalOpen(false);
                        setSelectedTool(null);
                    }}
                    onSubmit={handleRequestSubmit}
                />
            )}
        </AppLayout>
    );
}
