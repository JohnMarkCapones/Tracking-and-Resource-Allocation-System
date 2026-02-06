import { Link } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';
import { Children, createContext } from 'react';

type BreadcrumbContextValue = {
    separator: ReactNode;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
    separator: (
        <svg className="h-3 w-3 text-gray-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
});

type BreadcrumbProps = PropsWithChildren<{
    separator?: ReactNode;
    className?: string;
}>;

function Breadcrumb({ children, separator, className = '' }: BreadcrumbProps) {
    const defaultSeparator = (
        <svg className="h-3 w-3 text-gray-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const items = Children.toArray(children);

    return (
        <BreadcrumbContext.Provider value={{ separator: separator ?? defaultSeparator }}>
            <nav aria-label="Breadcrumb" className={className}>
                <ol className="flex items-center gap-2 text-xs">
                    {items.map((child, index) => (
                        <li key={index} className="flex items-center gap-2">
                            {child}
                            {index < items.length - 1 && <span aria-hidden="true">{separator ?? defaultSeparator}</span>}
                        </li>
                    ))}
                </ol>
            </nav>
        </BreadcrumbContext.Provider>
    );
}

type BreadcrumbItemProps = {
    href?: string;
    children: ReactNode;
    isCurrent?: boolean;
};

function BreadcrumbItem({ href, children, isCurrent = false }: BreadcrumbItemProps) {
    if (isCurrent || !href) {
        return (
            <span className="font-medium text-gray-900" aria-current={isCurrent ? 'page' : undefined}>
                {children}
            </span>
        );
    }

    return (
        <Link href={href} className="text-gray-500 hover:text-gray-700 hover:underline">
            {children}
        </Link>
    );
}

type BreadcrumbHomeProps = {
    href?: string;
};

function BreadcrumbHome({ href = '/' }: BreadcrumbHomeProps) {
    return (
        <Link href={href} className="text-gray-500 hover:text-gray-700" aria-label="Home">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10L10 3L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path
                    d="M5 8V15C5 15.5523 5.44772 16 6 16H14C14.5523 16 15 15.5523 15 15V8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </Link>
    );
}

Breadcrumb.Item = BreadcrumbItem;
Breadcrumb.Home = BreadcrumbHome;

export { Breadcrumb };
