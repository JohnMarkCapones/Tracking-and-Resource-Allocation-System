import type { ReactNode } from 'react';

type ImageGalleryItemProps = {
    src: string;
    alt: string;
    href?: string;
    sizeClassName?: string;
    actionLabel?: string;
    actionAriaLabel?: string;
    actionTitle?: string;
    onAction?: () => void;
    actionIcon?: ReactNode;
};

export function ImageGalleryItem({
    src,
    alt,
    href,
    sizeClassName = 'h-20 w-20',
    actionLabel = 'Remove',
    actionAriaLabel,
    actionTitle,
    onAction,
    actionIcon,
}: ImageGalleryItemProps) {
    const content = (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className="h-full w-full object-cover"
        />
    );

    return (
        <div className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white ${sizeClassName}`}>
            {href ? (
                <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    title={actionTitle ?? `Open ${alt}`}
                    className="block h-full w-full"
                >
                    {content}
                </a>
            ) : (
                <div className="h-full w-full">{content}</div>
            )}

            {onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    title={actionTitle ?? actionLabel}
                    aria-label={actionAriaLabel ?? actionLabel}
                    className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white shadow hover:bg-rose-700"
                >
                    {actionIcon ?? 'x'}
                </button>
            )}
        </div>
    );
}
