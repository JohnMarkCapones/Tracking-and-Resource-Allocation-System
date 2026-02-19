import { Head, usePage, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Breadcrumb } from '@/Components/Breadcrumb';
import { toast } from '@/Components/Toast';
import { AvailabilityCalendar } from '@/Components/Tools/AvailabilityCalendar';
import { RequestToolModal } from '@/Components/Tools/RequestToolModal';
import AppLayout from '@/Layouts/AppLayout';
import { apiRequest } from '@/lib/http';
import { useFavoritesStore } from '@/stores/favoritesStore';

type AvailabilityApiResponse = {
    data: {
        allocations: Array<{ borrow_date: string; expected_return_date: string; actual_return_date: string | null; status: string }>;
        reservations: Array<{ start_date: string; end_date: string; status: string }>;
    };
};

type ToolStatus = 'Available' | 'Borrowed' | 'Maintenance';

type ToolDetail = {
    id: number;
    slug?: string;
    name: string;
    toolId: string;
    category: string;
    status: ToolStatus;
    condition: string;
    description: string;
    specifications: Record<string, string>;
    lastMaintenance: string;
    totalBorrowings: number;
    imageUrl?: string;
};

type DetailPageProps = {
    tool: ToolDetail;
};

function statusClasses(status: ToolStatus): string {
    if (status === 'Available') {
        return 'bg-emerald-50 text-emerald-700';
    }

    if (status === 'Borrowed') {
        return 'bg-amber-50 text-amber-700';
    }

    return 'bg-rose-50 text-rose-700';
}

export default function DetailPage() {
    const page = usePage<DetailPageProps>();
    const { tool } = page.props;
    const { addToRecentlyViewed } = useFavoritesStore();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [unavailableDates, setUnavailableDates] = useState<Array<{ from: Date; to: Date }>>([]);

    useEffect(() => {
        if (page.url.includes('request=1')) {
            setIsRequestModalOpen(true);
        }
    }, [page.url]);

    // Track recently viewed tools
    useEffect(() => {
        addToRecentlyViewed({
            id: tool.id,
            name: tool.name,
            slug: tool.slug,
            toolId: tool.toolId,
            category: tool.category,
            imageUrl: tool.imageUrl,
        });
    }, [tool.id, tool.name, tool.slug, tool.toolId, tool.category, tool.imageUrl, addToRecentlyViewed]);

    const toLocalYmd = (date: Date): string => format(date, 'yyyy-MM-dd');

    useEffect(() => {
        let cancelled = false;
        const from = new Date();
        const to = new Date();
        to.setMonth(to.getMonth() + 2);

        apiRequest<AvailabilityApiResponse>(
            `/api/tools/${tool.id}/availability?from=${toLocalYmd(from)}&to=${toLocalYmd(to)}`,
        )
            .then((res) => {
                if (cancelled) return;
                const ranges: Array<{ from: Date; to: Date }> = [];
                for (const a of res.data.allocations ?? []) {
                    if (a.status === 'BORROWED') {
                        ranges.push({
                            from: new Date(a.borrow_date),
                            to: new Date(a.expected_return_date),
                        });
                    }
                }
                for (const r of res.data.reservations ?? []) {
                    if (r.status !== 'cancelled' && r.status !== 'completed') {
                        ranges.push({
                            from: new Date(r.start_date),
                            to: new Date(r.end_date),
                        });
                    }
                }
                setUnavailableDates(ranges);
            })
            .catch(() => {
                if (!cancelled) setUnavailableDates([]);
            });

        return () => {
            cancelled = true;
        };
    }, [tool.id]);

    const handleRequestSubmit = async (data: { dateRange: DateRange; purpose: string }) => {
        if (!data.dateRange.from || !data.dateRange.to) {
            toast.error('Please select a valid date range.');
            return;
        }

        setIsSubmitting(true);

        try {
            await apiRequest<{ message: string }>('/api/reservations', {
                method: 'POST',
                body: {
                    tool_id: tool.id,
                    start_date: toLocalYmd(data.dateRange.from),
                    end_date: toLocalYmd(data.dateRange.to),
                    recurring: false,
                },
            });

            setIsRequestModalOpen(false);
            toast.success('Borrow request submitted for approval!');
            router.visit('/reservations');
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
                    <Breadcrumb className="mb-2">
                        <Breadcrumb.Home />
                        <Breadcrumb.Item href="/tools">Tools</Breadcrumb.Item>
                        <Breadcrumb.Item isCurrent>{tool.name}</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="text-2xl font-semibold text-gray-900">{tool.name}</h1>
                </>
            }
        >
            <Head title={tool.name} />

            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                    <div className="space-y-6">
                        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
                            <div className="aspect-[16/9] bg-gray-100">
                                {tool.imageUrl ? (
                                    <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        <svg className="h-20 w-20" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M28 16L16 28L24 36L36 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                            <path d="M44 20L60 36L52 44L36 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                            <path d="M20 56L36 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                            <path d="M44 48L56 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">{tool.category}</p>
                                        <h2 className="mt-1 text-lg font-semibold text-gray-900">{tool.name}</h2>
                                        <p className="mt-1 text-xs text-gray-500">ID: {tool.toolId}</p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses(tool.status)}`}>
                                        {tool.status}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-700">{tool.description}</p>

                                <div className="mt-6">
                                    <h3 className="mb-3 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Specifications</h3>
                                    <dl className="grid gap-2 sm:grid-cols-2">
                                        {Object.entries(tool.specifications).map(([key, value]) => (
                                            <div key={key} className="rounded-xl bg-gray-50 px-3 py-2">
                                                <dt className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">{key}</dt>
                                                <dd className="mt-0.5 text-xs font-medium text-gray-900">{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-4 border-t pt-6 text-xs">
                                    <div>
                                        <p className="text-gray-500">Condition</p>
                                        <p className="font-medium text-gray-900">{tool.condition}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Last maintenance</p>
                                        <p className="font-medium text-gray-900">{tool.lastMaintenance}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Total borrowings</p>
                                        <p className="font-medium text-gray-900">{tool.totalBorrowings} times</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-4">
                        <AvailabilityCalendar unavailableDates={unavailableDates} />

                        {tool.status === 'Available' && (
                            <button
                                type="button"
                                onClick={() => setIsRequestModalOpen(true)}
                                className="w-full rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700"
                            >
                                Request to Borrow
                            </button>
                        )}

                        {tool.status === 'Borrowed' && (
                            <>
                                <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center">
                                    <p className="text-xs font-medium text-amber-800">This tool is currently borrowed</p>
                                    <p className="mt-1 text-[11px] text-amber-700">Check the calendar above for available dates</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsRequestModalOpen(true)}
                                    className="w-full rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700"
                                >
                                    Request to Borrow
                                </button>
                            </>
                        )}

                        {tool.status === 'Maintenance' && (
                            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-center">
                                <p className="text-xs font-medium text-rose-800">This tool is under maintenance</p>
                                <p className="mt-1 text-[11px] text-rose-700">It will be available once maintenance is complete</p>
                            </div>
                        )}

                        <Link
                            href="/tools"
                            className="block w-full rounded-full border border-gray-200 bg-white py-2.5 text-center text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Back to Catalog
                        </Link>
                    </div>
                </div>
            </div>

            <RequestToolModal
                show={isRequestModalOpen}
                toolName={tool.name}
                toolId={tool.toolId}
                submitting={isSubmitting}
                onClose={() => {
                    if (isSubmitting) {
                        return;
                    }
                    setIsRequestModalOpen(false);
                }}
                onSubmit={handleRequestSubmit}
            />
        </AppLayout>
    );
}
