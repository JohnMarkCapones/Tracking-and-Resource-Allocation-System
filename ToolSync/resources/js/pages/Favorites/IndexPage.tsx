import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { Breadcrumb } from '@/Components/Breadcrumb';
import { EmptyState } from '@/Components/EmptyState';
import { FavoriteButton } from '@/Components/FavoriteButton';
import { ToolCard, type ToolCardData } from '@/Components/Tools/ToolCard';
import AppLayout from '@/Layouts/AppLayout';
import type { FavoriteApiItem } from '@/lib/apiTypes';
import { apiRequest } from '@/lib/http';
import { useFavoritesStore } from '@/stores/favoritesStore';

type FavoritesApiResponse = { data: FavoriteApiItem[] };

export default function IndexPage() {
    const { favorites, recentlyViewed, clearRecentlyViewed, setFavorites } = useFavoritesStore();

    const handleRequestBorrow = (tool: ToolCardData) => {
        router.visit(`/tools/${tool.id}?request=1`);
    };

    // Convert favorite tools to ToolCard format
    const favoriteTools: ToolCardData[] = favorites.map((tool) => ({
        id: tool.id,
        name: tool.name,
        toolId: tool.toolId,
        category: tool.category,
        status: tool.status as 'Available' | 'Borrowed' | 'Maintenance',
        condition: tool.condition || 'Good',
        quantity: tool.quantity || 1,
        availableQuantity: tool.availableQuantity || 0,
        borrowedQuantity: tool.borrowedQuantity || 0,
        imageUrl: tool.imageUrl || undefined,
    }));

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await apiRequest<FavoritesApiResponse>('/api/favorites');
                if (cancelled) return;
                setFavorites(
                    (res.data ?? []).map((t) => ({
                        id: t.id,
                        name: t.name,
                        toolId: t.toolId,
                        category: t.category,
                        imageUrl: t.imageUrl,
                    })),
                );
            } catch {
                // 401 will redirect in http.ts; other errors leave store as-is
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [setFavorites]);

    return (
        <AppLayout
            activeRoute="favorites"
            header={
                <>
                    <Breadcrumb className="mb-2">
                        <Breadcrumb.Item isCurrent>Favorites</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Favorites</h1>
                </>
            }
        >
            <Head title="My Favorites" />

            <div className="space-y-8">
                {/* Favorites Section */}
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Saved Tools</h2>
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {favorites.length} items
                        </span>
                    </div>

                    {favorites.length === 0 ? (
                        <EmptyState
                            icon={
                                <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M20 35L17.1 32.42C9.6 25.84 4.5 21.27 4.5 15.25C4.5 10.09 8.54 6 13.7 6C16.58 6 19.34 7.32 20 9.47C20.66 7.32 23.42 6 26.3 6C31.46 6 35.5 10.09 35.5 15.25C35.5 21.27 30.4 25.84 22.9 32.42L20 35Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            }
                            title="No favorites yet"
                            description="Start adding tools to your favorites by clicking the heart icon on any tool."
                            action={{
                                label: 'Browse Tools',
                                onClick: () => router.visit('/tools'),
                            }}
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {favoriteTools.map((tool) => (
                                <ToolCard
                                    key={tool.id}
                                    tool={tool}
                                    onRequestBorrow={handleRequestBorrow}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Recently Viewed Section */}
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recently Viewed</h2>
                        {recentlyViewed.length > 0 && (
                            <button
                                type="button"
                                onClick={clearRecentlyViewed}
                                className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                Clear history
                            </button>
                        )}
                    </div>

                    {recentlyViewed.length === 0 ? (
                        <div className="rounded-2xl bg-gray-50 px-6 py-8 text-center dark:bg-gray-800">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No recently viewed tools</p>
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Tools you view will appear here</p>
                        </div>
                    ) : (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {recentlyViewed.map((tool) => (
                                <Link
                                    key={tool.id}
                                    href={`/tools/${tool.id}`}
                                    className="flex-shrink-0 rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
                                    style={{ minWidth: '160px' }}
                                >
                                    <div className="mb-2 aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                                        {tool.imageUrl ? (
                                            <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M14 8L8 14L12 18L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <path d="M22 10L30 18L26 22L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <p className="truncate text-xs font-medium text-gray-900 dark:text-white">{tool.name}</p>
                                    <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">{tool.category}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
