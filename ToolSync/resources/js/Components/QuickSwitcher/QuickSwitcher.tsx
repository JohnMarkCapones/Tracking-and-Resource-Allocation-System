import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { router } from '@inertiajs/react';
import { Fragment, useState, useMemo, useEffect, useRef } from 'react';

type QuickSwitcherProps = {
    isOpen: boolean;
    onClose: () => void;
};

type QuickSwitcherItem = {
    id: string;
    title: string;
    subtitle?: string;
    href: string;
    icon: React.ReactNode;
    category: string;
};

const ITEMS: QuickSwitcherItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        subtitle: 'View system overview',
        href: '/dashboard',
        category: 'Navigation',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 8.5H6V12H3V8.5Z" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9.5 3H12.5V12H9.5V3Z" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 6H9.5V12H6V6Z" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        ),
    },
    {
        id: 'tools',
        title: 'Browse Tools',
        subtitle: 'Find and borrow equipment',
        href: '/tools',
        category: 'Navigation',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path d="M5 3L3 5L4.5 6.5L6.5 4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8.5 4L11 6.5L9.5 8L7 5.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M4 10.5L7 7.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8.5 9L11 11.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        ),
    },
    {
        id: 'borrowings',
        title: 'My Borrowings',
        subtitle: 'View your active and past borrowings',
        href: '/borrowings',
        category: 'Navigation',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8 5.5V8L10 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 'notifications',
        title: 'Notifications',
        subtitle: 'View all your notifications',
        href: '/notifications',
        category: 'Navigation',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path
                    d="M8 2.5C6.067 2.5 4.5 4.067 4.5 6V7.084C4.5 7.536 4.332 7.974 4.031 8.297L3.283 9.111C2.775 9.658 3.163 10.5 3.915 10.5H12.085C12.837 10.5 13.225 9.658 12.717 9.111L11.969 8.297C11.668 7.974 11.5 7.536 11.5 7.084V6C11.5 4.067 9.933 2.5 8 2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                />
                <path
                    d="M6.5 11.5C6.72 12.113 7.31 12.5 8 12.5C8.69 12.5 9.28 12.113 9.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },
    {
        id: 'admin-dashboard',
        title: 'Admin Dashboard',
        subtitle: 'System-wide analytics',
        href: '/admin/dashboard',
        category: 'Admin',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2 6H14" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 6V14" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        ),
    },
    {
        id: 'admin-tools',
        title: 'Tool Management',
        subtitle: 'Manage inventory',
        href: '/admin/tools',
        category: 'Admin',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L13 6L7 12H4V9L10 3Z" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        ),
    },
    {
        id: 'admin-users',
        title: 'User Management',
        subtitle: 'Manage users and permissions',
        href: '/admin/users',
        category: 'Admin',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M3 13C3 10.5 5.239 8.5 8 8.5C10.761 8.5 13 10.5 13 13" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        ),
    },
    {
        id: 'admin-allocation-history',
        title: 'Allocation History',
        subtitle: 'View borrowing records',
        href: '/admin/allocation-history',
        category: 'Admin',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path d="M4 3H12V13H4V3Z" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 6H10" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 8.5H10" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 11H8" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        ),
    },
];

export function QuickSwitcher({ isOpen, onClose }: QuickSwitcherProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredItems = useMemo(() => {
        if (!query.trim()) return ITEMS;

        const q = query.toLowerCase();
        return ITEMS.filter(
            (item) => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q) || item.category.toLowerCase().includes(q),
        );
    }, [query]);

    const groupedItems = useMemo(() => {
        const groups: Record<string, QuickSwitcherItem[]> = {};
        for (const item of filteredItems) {
            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category].push(item);
        }
        return groups;
    }, [filteredItems]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, filteredItems.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
            e.preventDefault();
            navigate(filteredItems[selectedIndex].href);
        }
    };

    const navigate = (href: string) => {
        onClose();
        router.visit(href);
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[60]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto p-4 pt-[15vh]">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="mx-auto max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                            <div className="flex items-center gap-3 border-b px-4 py-3">
                                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 16 16" fill="none">
                                    <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.4" />
                                    <path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Search pages, actions..."
                                    className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                                />
                                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">ESC</kbd>
                            </div>

                            <div className="max-h-80 overflow-y-auto py-2">
                                {filteredItems.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-sm text-gray-500">No results found for "{query}"</div>
                                ) : (
                                    Object.entries(groupedItems).map(([category, items]) => (
                                        <div key={category}>
                                            <div className="px-4 py-2 text-[10px] font-semibold tracking-wide text-gray-500 uppercase">
                                                {category}
                                            </div>
                                            {items.map((item) => {
                                                const globalIndex = filteredItems.indexOf(item);

                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => navigate(item.href)}
                                                        className={`flex w-full items-center gap-3 px-4 py-2 text-left ${
                                                            globalIndex === selectedIndex
                                                                ? 'bg-blue-50 text-blue-900'
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                                globalIndex === selectedIndex
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-gray-100 text-gray-500'
                                                            }`}
                                                        >
                                                            {item.icon}
                                                        </span>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{item.title}</p>
                                                            {item.subtitle && <p className="text-[11px] text-gray-500">{item.subtitle}</p>}
                                                        </div>
                                                        {globalIndex === selectedIndex && (
                                                            <kbd className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                                                                Enter
                                                            </kbd>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t bg-gray-50 px-4 py-2 text-[10px] text-gray-500">
                                <span className="font-medium">Tip:</span> Press{' '}
                                <kbd className="mx-1 rounded bg-gray-200 px-1 py-0.5 font-mono">Cmd+K</kbd> or{' '}
                                <kbd className="mx-1 rounded bg-gray-200 px-1 py-0.5 font-mono">Ctrl+K</kbd> anytime to open this menu
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}
