import ApplicationLogo from '@/Components/ApplicationLogo';
import { type SharedData, type User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';
import { useState } from 'react';

type AppLayoutProps = PropsWithChildren<{
    header?: ReactNode;
    activeRoute?: 'dashboard' | 'tools-borrowing' | 'borrowing-history';
}>;

type NotificationKind = 'alert' | 'info' | 'maintenance';

type NotificationItem = {
    id: number;
    title: string;
    description: string;
    time: string;
    kind: NotificationKind;
};

const NOTIFICATIONS: NotificationItem[] = [
    {
        id: 1,
        title: '2 tools overdue',
        description: 'Review and remind owners of overdue borrowings.',
        time: '5 min ago',
        kind: 'alert',
    },
    {
        id: 2,
        title: 'Upcoming maintenance',
        description: '4 tools require checks within the next 14 days.',
        time: '1 hr ago',
        kind: 'maintenance',
    },
    {
        id: 3,
        title: 'New borrowing request',
        description: 'Jane Doe requested Laptop · LP-0009.',
        time: 'Today',
        kind: 'info',
    },
];

function notificationAccent(kind: NotificationKind): string {
    if (kind === 'alert') {
        return 'bg-rose-500';
    }

    if (kind === 'maintenance') {
        return 'bg-amber-500';
    }

    return 'bg-blue-500';
}

export default function AppLayout({
    header,
    activeRoute = 'dashboard',
    children,
}: AppLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as User | null;
    const displayName = user?.name ?? 'User';
    const displayEmail = user?.email ?? 'user@example.com';
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const sidebarLinkBaseClasses =
        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors';

    const desktopNavItemClasses = (isActive: boolean): string =>
        [
            sidebarLinkBaseClasses,
            isActive
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100',
        ].join(' ');

    const mobileNavItemClasses = (isActive: boolean): string =>
        [
            'block rounded-md px-3 py-2 text-base font-medium',
            isActive
                ? 'bg-blue-900 text-white'
                : 'text-gray-700 hover:bg-gray-100',
        ].join(' ');

    const isDashboardActive = activeRoute === 'dashboard';
    const isToolsBorrowingActive = activeRoute === 'tools-borrowing';
    const isBorrowingHistoryActive = activeRoute === 'borrowing-history';

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="flex min-h-screen overflow-hidden bg-[#f6f4f0]">
                {/* Sidebar */}
                <aside className="hidden w-64 flex-shrink-0 border-r bg-white px-4 pb-6 pt-6 shadow-sm lg:flex lg:flex-col">
                    <div className="flex items-center gap-2 px-2">
                        <Link href="/">
                            <ApplicationLogo className="h-8 w-8" />
                        </Link>
                        <span className="text-lg font-semibold tracking-wide text-gray-900">
                            ToolSync
                        </span>
                    </div>

                    <nav className="mt-8 space-y-1">
                        <Link
                            href="/dashboard"
                            className={desktopNavItemClasses(isDashboardActive)}
                        >
                            <span className="flex items-center gap-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[11px] text-white">
                                    {/* Simple dashboard icon */}
                                    <svg
                                        className="h-3.5 w-3.5"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M4 11H8V16H4V11Z"
                                            stroke="currentColor"
                                            strokeWidth="1.4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M12 4H16V16H12V4Z"
                                            stroke="currentColor"
                                            strokeWidth="1.4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M8 8H12V16H8V8Z"
                                            stroke="currentColor"
                                            strokeWidth="1.4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                                <span>Dashboard</span>
                            </span>
                        </Link>
                        <Link
                            href="#"
                            className={desktopNavItemClasses(
                                isToolsBorrowingActive,
                            )}
                        >
                            <span className="flex items-center gap-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[11px] text-slate-700">
                                    {/* Tools icon */}
                                    <svg
                                        className="h-3.5 w-3.5"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M7 4L4 7L6 9L9 6"
                                            stroke="currentColor"
                                            strokeWidth="1.4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M11 5L15 9L13 11L9 7"
                                            stroke="currentColor"
                                            strokeWidth="1.4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M5 14L9 10"
                                            stroke="currentColor"
                                            strokeWidth="1.4"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M11 12L14 15"
                                            stroke="currentColor"
                                            strokeWidth="1.4"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                                <span>Tools Borrowing</span>
                            </span>
                        </Link>
                        <Link
                            href="#"
                            className={desktopNavItemClasses(
                                isBorrowingHistoryActive,
                            )}
                        >
                            <span className="flex items-center gap-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[11px] text-slate-700">
                                    {/* History icon */}
                                    <svg
                                        className="h-3.5 w-3.5"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle
                                            cx="10"
                                            cy="10"
                                            r="4.5"
                                            stroke="currentColor"
                                            strokeWidth="1.4"
                                        />
                                        <path
                                            d="M10 7V10L12 11"
                                            stroke="currentColor"
                                            strokeWidth="1.4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                                <span>My Borrowing History</span>
                            </span>
                        </Link>
                    </nav>

                    <div className="mt-auto space-y-4 rounded-2xl bg-neutral-50 px-4 py-4 text-sm text-gray-700">
                        <div>
                            <p className="text-xs text-gray-500">Logged in as</p>
                            <p className="mt-1 font-medium">{displayName}</p>
                            <p className="text-xs text-gray-500">
                                {displayEmail}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="w-full justify-start rounded-lg bg-red-50 px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Mobile sidebar (slide-over) */}
                {isMobileNavOpen && (
                    <div className="fixed inset-0 z-40 flex lg:hidden">
                        <div
                            className="fixed inset-0 bg-black/40"
                            onClick={() => setIsMobileNavOpen(false)}
                        />
                        <aside className="relative flex w-64 flex-shrink-0 flex-col border-r bg-white px-4 pb-6 pt-6 shadow-xl">
                            <div className="flex items-center justify-between gap-2 px-2">
                                <div className="flex items-center gap-2">
                                    <Link href="/">
                                        <ApplicationLogo className="h-8 w-8" />
                                    </Link>
                                    <span className="text-lg font-semibold tracking-wide text-gray-900">
                                        ToolSync
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsMobileNavOpen(false)}
                                    className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                                >
                                    <span className="sr-only">Close menu</span>
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M4.5 4.5L15.5 15.5M15.5 4.5L4.5 15.5"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <nav className="mt-8 space-y-1">
                                <Link
                                    href="/dashboard"
                                    className={desktopNavItemClasses(
                                        isDashboardActive,
                                    )}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="#"
                                    className={desktopNavItemClasses(
                                        isToolsBorrowingActive,
                                    )}
                                >
                                    Tools Borrowing
                                </Link>
                                <Link
                                    href="#"
                                    className={desktopNavItemClasses(
                                        isBorrowingHistoryActive,
                                    )}
                                >
                                    My Borrowing History
                                </Link>
                            </nav>

                            <div className="mt-auto space-y-4 rounded-2xl bg-neutral-50 px-4 py-4 text-sm text-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Logged in as
                                        </p>
                                        <p className="mt-0.5 text-sm font-medium">
                                            {displayName}
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            {displayEmail}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsLogoutModalOpen(true)}
                                    className="w-full justify-start rounded-lg bg-red-50 px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-100"
                                >
                                    Logout
                                </button>
                            </div>
                        </aside>
                    </div>
                )}

                {/* Main content */}
                <div className="flex min-h-[600px] flex-1 flex-col">
                    <header className="border-b border-neutral-200 bg-[#f6f4f0]">
                        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-200 lg:hidden"
                                    onClick={() =>
                                        setIsMobileNavOpen((open) => !open)
                                    }
                                >
                                    <span className="sr-only">
                                        Open navigation
                                    </span>
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M3 5.5H17M3 10H17M3 14.5H11.5"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>
                                {header && (
                                    <div className="space-y-1">
                                        {header}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden items-center rounded-full bg-white px-3 py-1.5 text-xs text-gray-500 shadow-sm sm:flex">
                                    <svg
                                        className="mr-2 h-4 w-4 text-gray-400"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle
                                            cx="9"
                                            cy="9"
                                            r="4.5"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                        />
                                        <path
                                            d="M12.5 12.5L16 16"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <input
                                        type="search"
                                        placeholder="Search tools or history"
                                        className="w-44 border-none bg-transparent text-xs outline-none placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsNotificationsOpen(
                                                (open) => !open,
                                            )
                                        }
                                        className="relative rounded-full bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-100"
                                        aria-expanded={isNotificationsOpen}
                                    >
                                        <span className="sr-only">
                                            View notifications
                                        </span>
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M10 3C7.79086 3 6 4.79086 6 7V8.10557C6 8.6712 5.78929 9.21839 5.41421 9.62223L4.35355 10.764C3.71895 11.4467 4.20379 12.5 5.14434 12.5H14.8557C15.7962 12.5 16.2811 11.4467 15.6464 10.764L14.5858 9.62223C14.2107 9.21839 14 8.6712 14 8.10557V7C14 4.79086 12.2091 3 10 3Z"
                                                stroke="currentColor"
                                                strokeWidth="1.6"
                                            />
                                            <path
                                                d="M8.5 14.5C8.77614 15.1414 9.33726 15.6 10 15.6C10.6627 15.6 11.2239 15.1414 11.5 14.5"
                                                stroke="currentColor"
                                                strokeWidth="1.6"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                                    </button>
                                    {isNotificationsOpen && (
                                        <div className="absolute right-0 z-10 mt-2 w-72 rounded-2xl bg-white p-3 text-xs text-gray-800 shadow-xl">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                                    Notifications
                                                </p>
                                                <button
                                                    type="button"
                                                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
                                                    onClick={() =>
                                                        setIsNotificationsOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Mark all as read
                                                </button>
                                            </div>
                                            <ul className="space-y-2">
                                                {NOTIFICATIONS.map(
                                                    (notification) => (
                                                        <li
                                                            key={
                                                                notification.id
                                                            }
                                                            className="flex items-start gap-2 rounded-xl bg-gray-50 px-2 py-2"
                                                        >
                                                            <span
                                                                className={`mt-1 h-2 w-2 rounded-full ${notificationAccent(
                                                                    notification.kind,
                                                                )}`}
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-[11px] font-semibold text-gray-900">
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </p>
                                                                <p className="mt-0.5 text-[11px] text-gray-600">
                                                                    {
                                                                        notification.description
                                                                    }
                                                                </p>
                                                                <p className="mt-0.5 text-[10px] text-gray-400">
                                                                    {
                                                                        notification.time
                                                                    }
                                                                </p>
                                                            </div>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                            <button
                                                type="button"
                                                className="mt-2 w-full rounded-full bg-gray-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black"
                                            >
                                                Open notifications center
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex w-full flex-1 flex-col px-8 py-6">
                        {children}
                    </main>
                </div>
            </div>
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="w-full max-w-sm rounded-2xl bg-white p-6 text-sm text-gray-800 shadow-xl"
                    >
                        <h2 className="text-base font-semibold text-gray-900">
                            Log out of ToolSync?
                        </h2>
                        <p className="mt-2 text-xs text-gray-600">
                            You will be signed out of your current session. Any
                            in‑progress changes that are not saved might be
                            lost.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogoutModalOpen(false);
                                    router.post('/logout');
                                }}
                                className="rounded-full bg-red-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

