import { ImageGalleryItem } from './ImageGalleryItem';

export type ImageGalleryEntry = {
    id: string;
    src: string;
    alt: string;
    href?: string;
    actionLabel?: string;
    actionAriaLabel?: string;
    actionTitle?: string;
    actionIcon?: string;
    onAction?: () => void;
};

type ImageGalleryProps = {
    items: ImageGalleryEntry[];
    emptyText?: string;
    sizeClassName?: string;
    className?: string;
};

export function ImageGallery({
    items,
    emptyText = 'No images available.',
    sizeClassName,
    className,
}: ImageGalleryProps) {
    if (items.length === 0) {
        return <p className="text-xs text-gray-500">{emptyText}</p>;
    }

    return (
        <div className={className ?? ''}>
            <div className="overflow-x-auto pb-1">
                <div className="flex w-max gap-2 pr-1">
                    {items.map((item) => (
                        <ImageGalleryItem
                            key={item.id}
                            src={item.src}
                            alt={item.alt}
                            href={item.href}
                            sizeClassName={sizeClassName}
                            actionLabel={item.actionLabel}
                            actionAriaLabel={item.actionAriaLabel}
                            actionTitle={item.actionTitle}
                            actionIcon={item.actionIcon}
                            onAction={item.onAction}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
