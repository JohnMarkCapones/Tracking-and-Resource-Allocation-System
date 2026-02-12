import { Head, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';

import type { ReactNode } from 'react';
import { EmptyState } from '@/Components/EmptyState';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import { apiRequest } from '@/lib/http';

type NotificationType = 'alert' | 'info' | 'success' | 'maintenance';

type Notification = {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    createdAt: string | null;
    href?: string | null;
    read: boolean;
    reservationId?: number | null;
    allocationId?: number | null;
};

type NotificationsPageProps = {
    auth?: { user?: { role?: string } };
    notifications: Notification[];
};

function typeIcon(type: NotificationType): ReactNode {
    if (type === 'alert') {
        return (
            <svg className="h-4 w-4 text-rose-500" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="8" cy="10.5" r="0.8" fill="currentColor" />
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        );
    }

    if (type === 'success') {
        return (
            <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8.5L6.5 11L12 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        );
    }

    if (type === 'maintenance') {
        return (
            <svg className="h-4 w-4 text-amber-500" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3L3 5L4.5 6.5L6.5 4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8.5 4L11 6.5L9.5 8L7 5.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M4 10.5L7 7.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8.5 9L11 11.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        );
    }

    return (
        <svg className="h-4 w-4 text-blue-500" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 4V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="8" cy="10.5" r="0.8" fill="currentColor" />
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
    );
}

function typeBgClass(type: NotificationType, read: boolean): string {
    if (read) return 'bg-white';

    if (type === 'alert') return 'bg-rose-50';
    if (type === 'success') return 'bg-emerald-50';
    if (type === 'maintenance') return 'bg-amber-50';
    return 'bg-blue-50';
}

type FilterType = 'all' | 'unread' | NotificationType;

function normalizeNotificationType(t: string | undefined): NotificationType {
    const lower = (t ?? 'info').toLowerCase();
    if (lower === 'alert' || lower === 'info' || lower === 'success' || lower === 'maintenance') return lower;
    return 'info';
}

export default function IndexPage() {
    const page = usePage<NotificationsPageProps>();
    const { notifications: initialNotifications } = page.props;
    const isAdmin = page.props.auth?.user?.role === 'ADMIN';

    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [pendingActionId, setPendingActionId] = useState<number | null>(null);
    const [pendingReturnActionId, setPendingReturnActionId] = useState<number | null>(null);

    const filteredNotifications = useMemo(() => {
        if (filterType === 'all') return notifications;
        if (filterType === 'unread') return notifications.filter((n) => !n.read);
        return notifications.filter((n) => normalizeNotificationType(n.type) === filterType);
    }, [notifications, filterType]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleMarkAsRead = async (id: string) => {
        try {
            await apiRequest<{ message: string }>(`/api/notifications/${id}/read`, {
                method: 'POST',
            });
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to mark notification as read.';
            toast.error(message);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await apiRequest<{ message: string }>('/api/notifications/read-all', {
                method: 'POST',
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to mark notifications as read.';
            toast.error(message);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await apiRequest<{ message: string }>(`/api/notifications/${id}`, {
                method: 'DELETE',
            });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            toast('Notification deleted');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete notification.';
            toast.error(message);
        }
    };

    const handleClearAll = async () => {
        try {
            await apiRequest<{ message: string }>('/api/notifications', {
                method: 'DELETE',
            });
            setNotifications([]);
            setFilterType('all');
            toast('All notifications cleared');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to clear notifications.';
            toast.error(message);
        }
    };

    const clearFilter = () => setFilterType('all');

    const refetchNotifications = async () => {
        try {
            const res = await apiRequest<{ data: Notification[] }>('/api/notifications');
            setNotifications(res.data ?? []);
        } catch {
            // Keep current list on error
        }
    };

    const handleApproveBorrowRequest = async (reservationId: number) => {
        setPendingActionId(reservationId);
        try {
            await apiRequest(`/api/reservations/${reservationId}/approve`, { method: 'POST' });
            toast.success('Borrow request approved.');
            await refetchNotifications();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to approve';
            toast.error(message);
        } finally {
            setPendingActionId(null);
        }
    };

    const handleDeclineBorrowRequest = async (reservationId: number) => {
        setPendingActionId(reservationId);
        try {
            await apiRequest(`/api/reservations/${reservationId}/decline`, { method: 'POST' });
            toast.success('Borrow request declined.');
            await refetchNotifications();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to decline';
            toast.error(message);
        } finally {
            setPendingActionId(null);
        }
    };

    const handleApproveReturnRequest = async (allocationId: number) => {
        setPendingReturnActionId(allocationId);
        try {
            await apiRequest(`/api/tool-allocations/${allocationId}`, {
                method: 'PUT',
                body: { status: 'RETURNED' },
            });
            toast.success('Return approved.');
            await refetchNotifications();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to approve return';
            toast.error(message);
        } finally {
            setPendingReturnActionId(null);
        }
    };

    const handleDeclineReturnRequest = async (allocationId: number) => {
        setPendingReturnActionId(allocationId);
        try {
            await apiRequest(`/api/tool-allocations/${allocationId}`, {
                method: 'PUT',
                body: { status: 'BORROWED' },
            });
            toast.success('Return declined. Tool stays borrowed.');
            await refetchNotifications();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to decline return';
            toast.error(message);
        } finally {
            setPendingReturnActionId(null);
        }
    };

    return (
        <AppLayout
            activeRoute="notifications"
            variant={isAdmin ? 'admin' : 'user'}
            header={
                <>
                    <p className="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">Notifications</p>
                    <h1 className="text-2xl font-semibold text-gray-900">Stay updated on your borrowings</h1>
                </>
            }
        >
            <Head title="Notifications" />

            <div className="space-y-6">
                <section className="flex flex-col justify-between gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Filter</span>
                        <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-gray-50 px-1 py-1 text-[11px] text-gray-600 shadow-sm">
                            {(['all', 'unread', 'alert', 'info', 'success', 'maintenance'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFilterType(type)}
                                    aria-pressed={filterType === type}
                                    aria-label={type === 'all' ? 'Show all notifications' : type === 'unread' ? `Show unread (${unreadCount})` : `Filter by ${type}`}
                                    className={`rounded-full px-3 py-1 capitalize ${
                                        filterType === type ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {type === 'all'
                                        ? 'All'
                                        : type === 'unread'
                                          ? `Unread (${unreadCount})`
                                          : type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Mark all as read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </section>

                {filteredNotifications.length === 0 ? (
                    <EmptyState
                        icon={
                            <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M20 6C14.477 6 10 10.477 10 16V18.211C10 19.344 9.633 20.445 8.962 21.347L6.707 24.379C5.55 25.934 6.685 28 8.629 28H31.371C33.315 28 34.45 25.934 33.293 24.379L31.038 21.347C30.367 20.445 30 19.344 30 18.211V16C30 10.477 25.523 6 20 6Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M15 30C15.553 31.23 16.755 32 18 32H22C23.245 32 24.447 31.23 25 30"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        }
                        title={filterType === 'all' ? 'No notifications yet' : `No ${filterType} notifications`}
                        description={
                            filterType === 'all'
                                ? "You're all caught up! Notifications about your borrowings will appear here."
                                : 'No notifications match this filter. Show all to see everything.'
                        }
                        action={
                            filterType !== 'all' && notifications.length > 0
                                ? { label: 'Show all', onClick: clearFilter }
                                : undefined
                        }
                    />
                ) : (
                    <div className="space-y-2">
                        {filteredNotifications.map((notification) => {
                            const notifType = normalizeNotificationType(notification.type);
                            return (
                            <div
                                key={notification.id}
                                className={`flex items-start gap-3 rounded-2xl px-4 py-3 shadow-sm ${typeBgClass(notifType, notification.read)}`}
                            >
                                <div className="mt-0.5">{typeIcon(notifType)}</div>
                                        <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className={`text-sm ${notification.read ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-600">{notification.message}</p>
                                            <p className="mt-1 text-[10px] text-gray-400">{notification.createdAt}</p>
                                            {isAdmin && notification.reservationId != null && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApproveBorrowRequest(notification.reservationId!)}
                                                        disabled={pendingActionId === notification.reservationId}
                                                        className="rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                                    >
                                                        {pendingActionId === notification.reservationId ? '…' : 'Approve'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeclineBorrowRequest(notification.reservationId!)}
                                                        disabled={pendingActionId === notification.reservationId}
                                                        className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                            {isAdmin && notification.allocationId != null && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApproveReturnRequest(notification.allocationId!)}
                                                        disabled={pendingReturnActionId === notification.allocationId}
                                                        className="rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                                    >
                                                        {pendingReturnActionId === notification.allocationId ? '…' : 'Approve'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeclineReturnRequest(notification.allocationId!)}
                                                        disabled={pendingReturnActionId === notification.allocationId}
                                                        className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!notification.read && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="rounded-full p-1.5 text-gray-400 hover:bg-white hover:text-gray-600"
                                                    aria-label="Mark as read"
                                                >
                                                    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M4 8.5L6.5 11L12 5"
                                                            stroke="currentColor"
                                                            strokeWidth="1.6"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(notification.id)}
                                                className="rounded-full p-1.5 text-gray-400 hover:bg-white hover:text-rose-600"
                                                aria-label="Delete notification"
                                            >
                                                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {!notification.read && <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />}
                            </div>
                        );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
