import { toast } from '@/Components/Toast';
import { useFavoritesStore } from '@/stores/favoritesStore';

type FavoriteButtonProps = {
    tool: {
        id: number;
        name: string;
        toolId: string;
        category: string;
    };
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
};

const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
};

export function FavoriteButton({ tool, size = 'md', className = '' }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavoritesStore();
    const isFav = isFavorite(tool.id);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(tool);
        if (isFav) {
            toast.success(`${tool.name} removed from favorites`);
        } else {
            toast.success(`${tool.name} added to favorites`);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`flex items-center justify-center rounded-full transition-all ${sizeClasses[size]} ${
                isFav
                    ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-rose-500 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600'
            } ${className}`}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
            <svg className={iconSizeClasses[size]} viewBox="0 0 20 20" fill={isFav ? 'currentColor' : 'none'} xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M10 17.5L8.55 16.21C4.4 12.52 1.5 9.94 1.5 6.75C1.5 4.17 3.52 2.15 6.1 2.15C7.54 2.15 8.92 2.81 10 3.87C11.08 2.81 12.46 2.15 13.9 2.15C16.48 2.15 18.5 4.17 18.5 6.75C18.5 9.94 15.6 12.52 11.45 16.21L10 17.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}
