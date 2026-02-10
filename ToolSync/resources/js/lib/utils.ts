import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Base path for tool images by name (e.g. images/tools/printer.png). */
const TOOLS_IMAGE_BASE = '/images/tools';

/** Slugify tool name for filename: "Projector Screen" → "projector-screen". */
function slugifyToolName(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

/**
 * Resolve tool image URL. Uses image_path from API when set, otherwise
 * fallback to /images/tools/{slug}.png by tool name.
 */
export function getToolImageUrl(name: string, imagePath: string | null | undefined): string {
    if (imagePath?.trim()) {
        return imagePath.startsWith('http') ? imagePath : `/${imagePath.replace(/^\//, '')}`;
    }
    const slug = slugifyToolName(name);
    return slug ? `${TOOLS_IMAGE_BASE}/${slug}.png` : '';
}
