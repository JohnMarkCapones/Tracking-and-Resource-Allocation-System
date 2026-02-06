import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FavoriteTool = {
    id: number;
    name: string;
    toolId: string;
    category: string;
    addedAt: string;
};

type FavoritesState = {
    favorites: FavoriteTool[];
    recentlyViewed: FavoriteTool[];
    addFavorite: (tool: Omit<FavoriteTool, 'addedAt'>) => void;
    removeFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;
    toggleFavorite: (tool: Omit<FavoriteTool, 'addedAt'>) => void;
    addToRecentlyViewed: (tool: Omit<FavoriteTool, 'addedAt'>) => void;
    clearRecentlyViewed: () => void;
};

const MAX_RECENTLY_VIEWED = 10;

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favorites: [],
            recentlyViewed: [],

            addFavorite: (tool) => {
                set((state) => ({
                    favorites: [
                        ...state.favorites,
                        {
                            ...tool,
                            addedAt: new Date().toISOString(),
                        },
                    ],
                }));
            },

            removeFavorite: (id) => {
                set((state) => ({
                    favorites: state.favorites.filter((f) => f.id !== id),
                }));
            },

            isFavorite: (id) => {
                return get().favorites.some((f) => f.id === id);
            },

            toggleFavorite: (tool) => {
                const state = get();
                if (state.isFavorite(tool.id)) {
                    state.removeFavorite(tool.id);
                } else {
                    state.addFavorite(tool);
                }
            },

            addToRecentlyViewed: (tool) => {
                set((state) => {
                    // Remove if already exists
                    const filtered = state.recentlyViewed.filter((t) => t.id !== tool.id);
                    // Add to front
                    const updated = [{ ...tool, addedAt: new Date().toISOString() }, ...filtered];
                    // Keep only last MAX_RECENTLY_VIEWED
                    return { recentlyViewed: updated.slice(0, MAX_RECENTLY_VIEWED) };
                });
            },

            clearRecentlyViewed: () => {
                set({ recentlyViewed: [] });
            },
        }),
        {
            name: 'toolsync-favorites',
        },
    ),
);
