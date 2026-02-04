import ApplicationLogo from '@/Components/ApplicationLogo';
import { type SharedData, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';

type AppLayoutProps = PropsWithChildren<{
    header?: ReactNode;
    activeRoute?: 'dashboard' | 'tools-borrowing' | 'borrowing-history';
}>;

export default function AppLayout({
    header,
    activeRoute = 'dashboard',
    children,
}: AppLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as User | null;
    const displayName = user?.name ?? 'User';
    const displayEmail = user?.email ?? 'user@example.com';

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
                        <div>
                            <p className="text-xs text-gray-500">Logged in as</p>
                            <p className="mt-1 font-medium">{displayName}</p>
                            <p className="text-xs text-gray-500">
                                {displayEmail}
                            </p>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full justify-start rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                            Logout
                        </Link>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex min-h-[600px] flex-1 flex-col">
                    <header className="border-b border-neutral-200 bg-[#f6f4f0]">
                        <div className="flex items-center justify-between px-8 py-6">
                            <div>
                                {header && (
                                    <div className="space-y-1">
                                        {header}
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <main className="flex w-full flex-1 flex-col px-8 py-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

