type SkipLinkProps = {
    targetId?: string;
    children?: string;
};

export function SkipLink({ targetId = 'main-content', children = 'Skip to main content' }: SkipLinkProps) {
    return (
        <a
            href={`#${targetId}`}
            className="sr-only fixed top-4 left-4 z-[100] rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg focus:not-sr-only focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
            {children}
        </a>
    );
}
