import { Link, router, usePage } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { LaserFlow } from '@/Components/LaserFlow';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { toast } from '@/Components/Toast';
import { apiRequest } from '@/lib/http';
import { type SharedData, type User } from '@/types';
import equipitLogo from '../assets/figma/logo.png';

type AppLayoutProps = PropsWithChildren<{
    header?: ReactNode;
    activeRoute?:
        | 'dashboard'
        | 'tools-borrowing'
        | 'borrowing-history'
        | 'admin-dashboard'
        | 'admin-tools'
        | 'admin-categories'
        | 'admin-allocation-history'
        | 'admin-users'
        | 'admin-analytics'
        | 'admin-settings'
        | 'admin-maintenance'
        | 'admin-reports'
        | 'notifications'
        | 'borrowings'
        | 'favorites'
        | 'reservations';
    variant?: 'user' | 'admin';
}>;

type NotificationKind = 'alert' | 'info' | 'success' | 'maintenance';

type NotificationItem = {
    id: string;
    title: string;
    description: string;
    time: string;
    kind: NotificationKind;
    read: boolean;
    href: string | null;
};

type SharedNotification = {
    id: string;
    type: NotificationKind;
    title: string;
    message: string;
    createdAt: string | null;
    read: boolean;
    href: string | null;
};

type LayoutSharedData = SharedData & {
    notifications?: SharedNotification[];
    notifications_unread_count?: number;
};

function notificationAccent(kind: NotificationKind): string {
    if (kind === 'alert') {
        return 'bg-rose-500';
    }

    if (kind === 'success') {
        return 'bg-emerald-500';
    }

    if (kind === 'maintenance') {
        return 'bg-amber-500';
    }

    return 'bg-blue-500';
}

export default function AppLayout({ header, activeRoute = 'dashboard', variant = 'user', children }: AppLayoutProps) {
    const { auth, notifications: sharedNotifications = [], notifications_unread_count: sharedUnreadCount = 0 } = usePage<LayoutSharedData>().props;
    const user = auth.user as User | null;
    const displayName = user?.name ?? 'User';
    const displayEmail = user?.email ?? 'user@example.com';
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>(
        sharedNotifications.map((n) => ({
            id: n.id,
            title: n.title,
            description: n.message,
            time: n.createdAt ?? 'Just now',
            kind: n.type,
            read: n.read,
            href: n.href,
        })),
    );
    const [unreadCount, setUnreadCount] = useState(sharedUnreadCount);

    useEffect(() => {
        setNotifications(
            sharedNotifications.map((n) => ({
                id: n.id,
                title: n.title,
                description: n.message,
                time: n.createdAt ?? 'Just now',
                kind: n.type,
                read: n.read,
                href: n.href,
            })),
        );
        setUnreadCount(sharedUnreadCount);
    }, [sharedNotifications, sharedUnreadCount]);

    const sidebarLinkBaseClasses = 'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors';

    const desktopNavItemClasses = (isActive: boolean): string =>
        [
            sidebarLinkBaseClasses,
            isActive
                ? 'bg-[#060644]/10 text-[#060644] shadow-sm dark:bg-[#060644] dark:text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
        ].join(' ');

    const mobileNavItemClasses = (isActive: boolean): string =>
        [
            'block rounded-md px-3 py-2 text-base font-medium',
            isActive ? 'bg-[#060644]/10 text-[#060644] dark:bg-[#060644] dark:text-white' : 'text-gray-700 hover:bg-gray-100',
        ].join(' ');

    const isAdminLayout = variant === 'admin';
    const logoHref = isAdminLayout ? '/admin/dashboard' : '/dashboard';

    type SidebarItemKey =
        | 'dashboard'
        | 'tools'
        | 'categories'
        | 'history'
        | 'notifications'
        | 'users'
        | 'favorites'
        | 'reservations'
        | 'analytics'
        | 'settings'
        | 'maintenance'
        | 'reports';

    type SidebarItem = {
        key: SidebarItemKey;
        href: string;
        label: string;
        isActive: boolean;
    };

    const sidebarItems: SidebarItem[] = isAdminLayout
        ? [
              {
                  key: 'dashboard',
                  href: '/admin/dashboard',
                  label: 'Dashboard',
                  isActive: activeRoute === 'admin-dashboard',
              },
              {
                  key: 'analytics',
                  href: '/admin/analytics',
                  label: 'Analytics',
                  isActive: activeRoute === 'admin-analytics',
              },
              {
                  key: 'tools',
                  href: '/admin/tools',
                  label: 'Tools Management',
                  isActive: activeRoute === 'admin-tools',
              },
              {
                  key: 'categories',
                  href: '/admin/categories',
                  label: 'Categories',
                  isActive: activeRoute === 'admin-categories',
              },
              {
                  key: 'users',
                  href: '/admin/users',
                  label: 'User Management',
                  isActive: activeRoute === 'admin-users',
              },
              {
                  key: 'notifications',
                  href: '/notifications',
                  label: 'Notifications',
                  isActive: activeRoute === 'notifications',
              },
              {
                  key: 'history',
                  href: '/admin/allocation-history',
                  label: 'Allocation History',
                  isActive: activeRoute === 'admin-allocation-history',
              },
              {
                  key: 'maintenance',
                  href: '/admin/maintenance',
                  label: 'Maintenance',
                  isActive: activeRoute === 'admin-maintenance',
              },
              {
                  key: 'reports',
                  href: '/admin/reports',
                  label: 'Reports',
                  isActive: activeRoute === 'admin-reports',
              },
              {
                  key: 'settings',
                  href: '/admin/settings',
                  label: 'Settings',
                  isActive: activeRoute === 'admin-settings',
              },
          ]
        : [
              {
                  key: 'dashboard',
                  href: '/dashboard',
                  label: 'Dashboard',
                  isActive: activeRoute === 'dashboard',
              },
              {
                  key: 'tools',
                  href: '/tools',
                  label: 'Browse Tools',
                  isActive: activeRoute === 'tools-borrowing',
              },
              {
                  key: 'history',
                  href: '/borrowings',
                  label: 'My Borrowings',
                  isActive: activeRoute === 'borrowing-history' || activeRoute === 'borrowings',
              },
              {
                  key: 'notifications',
                  href: '/notifications',
                  label: 'Notifications',
                  isActive: activeRoute === 'notifications',
              },
              {
                  key: 'favorites',
                  href: '/favorites',
                  label: 'Favorites',
                  isActive: activeRoute === 'favorites',
              },
              {
                  key: 'reservations',
                  href: '/reservations',
                  label: 'Reservations',
                  isActive: activeRoute === 'reservations',
              },
          ];

    const handleMarkAllNotificationsAsRead = async () => {
        if (unreadCount === 0) {
            setIsNotificationsOpen(false);
            return;
        }

        try {
            await apiRequest<{ message: string }>('/api/notifications/read-all', {
                method: 'POST',
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to mark notifications as read.';
            toast.error(message);
        }
    };

    const handleOpenNotification = async (notification: NotificationItem) => {
        if (!notification.read) {
            try {
                await apiRequest<{ message: string }>(`/api/notifications/${notification.id}/read`, {
                    method: 'POST',
                });
                setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch {
                // If mark-read fails, still continue to destination page.
            }
        }

        setIsNotificationsOpen(false);
        router.visit('/notifications');
    };

    return (
        <div className="relative min-h-screen bg-slate-900">
            {/* Full-screen laser/beam background; pointer-events-none so UI stays clickable */}
            <div className="pointer-events-none fixed inset-0 z-0 opacity-30">
                <LaserFlow color="#6366f1" fogIntensity={0.3} wispIntensity={2} mouseTiltStrength={0.008} />
            </div>
            <div className="relative z-10 flex min-h-screen overflow-hidden bg-[#f6f4f0] dark:bg-gray-900">
                {/* Sidebar */}
                <aside className="hidden w-64 flex-shrink-0 border-r bg-white px-4 pt-6 pb-6 shadow-sm lg:flex lg:flex-col dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-2 px-2">
                        <Link href={logoHref}>
                            <img src={equipitLogo} alt="ToolSync" className="h-8 w-auto" />
                        </Link>
                        <span className="text-lg font-semibold tracking-wide text-[#060644] dark:text-white">ToolSync</span>
                    </div>

                    <nav className="mt-8 space-y-1">
                        {sidebarItems.map((item) => (
                            <Link key={item.key} href={item.href} className={desktopNavItemClasses(item.isActive)}>
                                <span className="flex items-center gap-3">
                                    <span
                                        className={
                                            item.isActive
                                                ? 'flex h-7 w-7 items-center justify-center rounded-lg bg-[#060644]/15 text-[11px] text-[#060644] dark:bg-white/20 dark:text-white'
                                                : item.key === 'dashboard'
                                                  ? 'flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[11px] text-slate-700 dark:bg-[#060644] dark:text-white'
                                                  : 'flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[11px] text-slate-700 dark:bg-slate-600 dark:text-slate-200'
                                        }
                                    >
                                        {item.key === 'dashboard' && (
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                        )}
                                        {item.key === 'tools' && (
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                                <path d="M5 14L9 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                <path d="M11 12L14 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                            </svg>
                                        )}
                                        {item.key === 'categories' && (
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M4 4H8L10 6H16V14H4V4Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.4"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path d="M4 8H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                <path d="M4 11H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                            </svg>
                                        )}
                                        {item.key === 'history' && (
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="10" cy="10" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                                                <path
                                                    d="M10 7V10L12 11"
                                                    stroke="currentColor"
                                                    strokeWidth="1.4"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                        {item.key === 'notifications' && (
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M10 3C7.8 3 6 4.8 6 7V8.1C6 8.7 5.8 9.2 5.4 9.6L4.4 10.8C3.7 11.4 4.2 12.5 5.1 12.5H14.9C15.8 12.5 16.3 11.4 15.6 10.8L14.6 9.6C14.2 9.2 14 8.7 14 8.1V7C14 4.8 12.2 3 10 3Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.4"
                                                />
                                                <path d="M8.5 14.5C8.8 15.1 9.3 15.6 10 15.6C10.7 15.6 11.2 15.1 11.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                            </svg>
                                        )}
                                        {item.key === 'users' && (
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
                                                <path
                                                    d="M4 16C4 13.2386 6.68629 11 10 11C13.3137 11 16 13.2386 16 16"
                                                    stroke="currentColor"
                                                    strokeWidth="1.4"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        )}
                                        {item.key === 'favorites' && (
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M10 17L8.55 15.71C4.4 12.02 1.5 9.44 1.5 6.25C1.5 3.67 3.52 1.65 6.1 1.65C7.54 1.65 8.92 2.31 10 3.37C11.08 2.31 12.46 1.65 13.9 1.65C16.48 1.65 18.5 3.67 18.5 6.25C18.5 9.44 15.6 12.02 11.45 15.71L10 17Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.4"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                        {item.key === 'reservations' && (
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
                                                <path d="M3 8H17" stroke="currentColor" strokeWidth="1.4" />
                                                <path d="M7 2V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                <path d="M13 2V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                            </svg>
                                        )}
                                        {item.key === 'analytics' && (
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4 14V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                <path d="M8 14V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                <path d="M12 14V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                <path d="M16 14V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                            </svg>
                                        )}
                                        {item.key === 'maintenance' && (
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M14.7 6.3C14.5 5.5 13.8 5 13 5H7C6.2 5 5.5 5.5 5.3 6.3L4 11V15C4 15.6 4.4 16 5 16H6C6.6 16 7 15.6 7 15V14H13V15C13 15.6 13.4 16 14 16H15C15.6 16 16 15.6 16 15V11L14.7 6.3Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.4"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <circle cx="6.5" cy="11.5" r="1" fill="currentColor" />
                                                <circle cx="13.5" cy="11.5" r="1" fill="currentColor" />
                                            </svg>
                                        )}
                                        {item.key === 'reports' && (
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M5 3H15V17H5V3Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.4"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path d="M8 7H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                <path d="M8 10H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                <path d="M8 13H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                            </svg>
                                        )}
                                        {item.key === 'settings' && (
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.4" />
                                                <path
                                                    d="M16.5 10C16.5 9.55 16.45 9.1 16.35 8.7L18 7.5L16.5 5L14.6 5.8C14 5.3 13.35 4.9 12.6 4.65L12.2 2.5H7.8L7.4 4.65C6.65 4.9 6 5.3 5.4 5.8L3.5 5L2 7.5L3.65 8.7C3.55 9.1 3.5 9.55 3.5 10C3.5 10.45 3.55 10.9 3.65 11.3L2 12.5L3.5 15L5.4 14.2C6 14.7 6.65 15.1 7.4 15.35L7.8 17.5H12.2L12.6 15.35C13.35 15.1 14 14.7 14.6 14.2L16.5 15L18 12.5L16.35 11.3C16.45 10.9 16.5 10.45 16.5 10Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.4"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                    <span>{item.label}</span>
                                </span>
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto space-y-4 rounded-2xl bg-neutral-50 px-4 py-4 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Logged in as</p>
                            <p className="mt-1 font-medium dark:text-white">{displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{displayEmail}</p>
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
                        <div className="fixed inset-0 bg-black/40" onClick={() => setIsMobileNavOpen(false)} />
                        <aside className="relative flex w-64 flex-shrink-0 flex-col border-r bg-white px-4 pt-6 pb-6 shadow-xl">
                            <div className="flex items-center justify-between gap-2 px-2">
                                <div className="flex items-center gap-2">
                                    <Link href={logoHref}>
                                        <img src={equipitLogo} alt="ToolSync" className="h-8 w-auto" />
                                    </Link>
                                    <span className="text-lg font-semibold tracking-wide text-[#060644] dark:text-white">ToolSync</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsMobileNavOpen(false)}
                                    className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                                >
                                    <span className="sr-only">Close menu</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                {sidebarItems.map((item) => (
                                    <Link key={item.key} href={item.href} className={mobileNavItemClasses(item.isActive)}>
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-auto space-y-4 rounded-2xl bg-neutral-50 px-4 py-4 text-sm text-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#060644] text-xs font-semibold text-white">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Logged in as</p>
                                        <p className="mt-0.5 text-sm font-medium">{displayName}</p>
                                        <p className="text-[11px] text-gray-500">{displayEmail}</p>
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
                    <header className="border-b border-neutral-200 bg-[#f6f4f0] dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-200 lg:hidden"
                                    onClick={() => setIsMobileNavOpen((open) => !open)}
                                >
                                    <span className="sr-only">Open navigation</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 5.5H17M3 10H17M3 14.5H11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    </svg>
                                </button>
                                {header && <div className="space-y-1">{header}</div>}
                            </div>

                            <div className="flex items-center gap-4">
                                <ThemeToggle />

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsNotificationsOpen((open) => !open)}
                                        className="relative rounded-full bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                        aria-expanded={isNotificationsOpen}
                                    >
                                        <span className="sr-only">View notifications</span>
                                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                        {unreadCount > 0 && <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500" />}
                                    </button>
                                    {isNotificationsOpen && (
                                        <div className="absolute right-0 z-10 mt-2 w-72 rounded-2xl bg-white p-3 text-xs text-gray-800 shadow-xl dark:bg-gray-800 dark:text-gray-200">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Notifications</p>
                                                <button
                                                    type="button"
                                                    className="text-[11px] font-medium text-[#060644] hover:text-[#050538]"
                                                    onClick={handleMarkAllNotificationsAsRead}
                                                >
                                                    Mark all as read
                                                </button>
                                            </div>
                                            <ul className="space-y-2">
                                                {notifications.length === 0 ? (
                                                    <li className="rounded-xl bg-gray-50 px-3 py-3 text-center text-[11px] text-gray-500">
                                                        No notifications yet.
                                                    </li>
                                                ) : (
                                                    notifications.map((notification) => (
                                                        <li key={notification.id}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenNotification(notification)}
                                                                className={`flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left hover:bg-gray-100 ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                                                            >
                                                                <span className={`mt-1 h-2 w-2 rounded-full ${notificationAccent(notification.kind)}`} />
                                                                <div className="flex-1">
                                                                    <p className="text-[11px] font-semibold text-gray-900">{notification.title}</p>
                                                                    <p className="mt-0.5 text-[11px] text-gray-600">{notification.description}</p>
                                                                    <p className="mt-0.5 text-[10px] text-gray-400">{notification.time}</p>
                                                                </div>
                                                            </button>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                            <Link
                                                href="/notifications"
                                                onClick={() => setIsNotificationsOpen(false)}
                                                className="mt-2 block w-full rounded-full bg-gray-900 px-3 py-1.5 text-center text-[11px] font-semibold text-white hover:bg-black"
                                            >
                                                Open notifications center
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex w-full flex-1 flex-col px-8 py-6">{children}</main>
                </div>
            </div>
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-white p-6 text-sm text-gray-800 shadow-xl">
                        <h2 className="text-base font-semibold text-gray-900">Log out of ToolSync?</h2>
                        <p className="mt-2 text-xs text-gray-600">
                            You will be signed out of your current session. Any in‑progress changes that are not saved might be lost.
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
