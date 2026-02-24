import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Breadcrumb } from '@/Components/Breadcrumb';
import { EmptyState } from '@/Components/EmptyState';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import type { ReservationApiItem } from '@/lib/apiTypes';
import { apiRequest } from '@/lib/http';

type Reservation = {
    id: number;
    toolName: string;
    toolId: string;
    startDate: string;
    endDate: string;
    status: 'pending_approval' | 'booked' | 'unclaimed' | 'completed' | 'cancelled';
    recurring?: boolean;
    recurrencePattern?: string;
};

type ReservationsApiResponse = { data: ReservationApiItem[] };

function mapApiToReservation(r: ReservationApiItem): Reservation {
    const raw = r.status.toLowerCase();
    const startYmd = r.startDate.slice(0, 10);
    const startDate = new Date(`${startYmd}T00:00:00`);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Canonical reservation statuses (single source of truth per item):
    // - pending      => pending_approval
    // - completed    => booked when start date is in the future, else completed
    // - cancelled    => unclaimed when start date is in the past, else cancelled
    const status: Reservation['status'] =
        raw === 'completed'
            ? startDate > todayStart
                ? 'booked'
                : 'completed'
            : raw === 'cancelled'
              ? startDate < todayStart
                  ? 'unclaimed'
                  : 'cancelled'
              : 'pending_approval';
    return {
        id: r.id,
        toolName: r.toolName,
        toolId: r.toolId,
        startDate: r.startDate,
        endDate: r.endDate,
        status,
        recurring: r.recurring,
        recurrencePattern: r.recurrencePattern ?? undefined,
    };
}

const STATUS_STYLES: Record<string, string> = {
    pending_approval: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    booked: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    unclaimed: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    completed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    cancelled: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

type FilterStatus = 'all' | Reservation['status'];

function statusLabel(status: Reservation['status']): string {
    if (status === 'pending_approval') return 'Pending Approval';
    if (status === 'booked') return 'Booked';
    if (status === 'unclaimed') return 'Unclaimed';
    if (status === 'completed') return 'Approved';
    return status;
}

// Calendar helpers
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number): Date[] {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(date: Date, start: string, end: string): boolean {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const s = new Date(start);
    const e = new Date(end);
    return d >= s && d <= e;
}

export default function IndexPage() {
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await apiRequest<ReservationsApiResponse>('/api/reservations');
                if (cancelled) return;
                setReservations((res.data ?? []).map(mapApiToReservation));
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load reservations');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(() => {
        if (filter === 'all') return reservations;
        return reservations.filter((r) => r.status === filter);
    }, [reservations, filter]);

    const summary = useMemo(() => {
        const pendingApproval = reservations.filter((r) => r.status === 'pending_approval').length;
        const booked = reservations.filter((r) => r.status === 'booked').length;
        const unclaimed = reservations.filter((r) => r.status === 'unclaimed').length;
        const completed = reservations.filter((r) => r.status === 'completed').length;
        const cancelled = reservations.filter((r) => r.status === 'cancelled').length;

        return {
            total: reservations.length,
            booked,
            pendingApproval,
            unclaimed,
            completed,
            cancelled,
        };
    }, [reservations]);

    const filterTabs = useMemo(
        () =>
            [
                { key: 'all' as const, label: 'All', count: summary.total },
                { key: 'booked' as const, label: 'Booked', count: summary.booked },
                { key: 'pending_approval' as const, label: 'Pending Approval', count: summary.pendingApproval },
                { key: 'unclaimed' as const, label: 'Unclaimed', count: summary.unclaimed },
                { key: 'completed' as const, label: 'Approved', count: summary.completed },
                { key: 'cancelled' as const, label: 'Cancelled', count: summary.cancelled },
            ] satisfies Array<{ key: FilterStatus; label: string; count: number }>,
        [summary],
    );

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = getDaysInMonth(year, month);
    const firstDayOfWeek = days[0].getDay();

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const getReservationsForDay = (date: Date) => {
        return reservations.filter((r) => (r.status === 'pending_approval' || r.status === 'booked') && isInRange(date, r.startDate, r.endDate));
    };

    const handleConfirmCancel = async () => {
        if (!reservationToCancel) return;

        try {
            await apiRequest(`/api/reservations/${reservationToCancel.id}`, {
                method: 'PUT',
                body: { status: 'CANCELLED' },
            });
            setReservations((prev) =>
                prev.map((r) => (r.id === reservationToCancel.id ? { ...r, status: 'cancelled' } : r)),
            );
            toast.success(`Borrow request for ${reservationToCancel.toolName} has been cancelled.`);
        } catch {
            toast.error('Could not cancel borrow request');
        }
        setReservationToCancel(null);
    };

    return (
        <AppLayout
            activeRoute="reservations"
            header={
                <>
                    <Breadcrumb className="mb-2">
                        <Breadcrumb.Item isCurrent>Borrow Requests</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Borrow Requests</h1>
                </>
            }
        >
            <Head title="Borrow Requests" />

            {loading && (
                <div className="rounded-3xl bg-white px-5 py-12 text-center text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                    Loading reservations…
                </div>
            )}
            {error && (
                <div className="rounded-3xl bg-red-50 px-5 py-4 text-red-700 shadow-sm dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}
            {!loading && !error && (
            <div className="space-y-6">
                {/* Calendar View */}
                <section className="rounded-3xl bg-white p-5 shadow-sm dark:bg-gray-800">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={prevMonth}
                                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                    <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={nextMonth}
                                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
                        {DAYS_OF_WEEK.map((day) => (
                            <div
                                key={day}
                                className="bg-gray-50 px-2 py-2 text-center text-[10px] font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            >
                                {day}
                            </div>
                        ))}
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-white p-2 dark:bg-gray-800" style={{ minHeight: '60px' }} />
                        ))}
                        {days.map((date) => {
                            const reservations = getReservationsForDay(date);
                            const isToday = isSameDay(date, new Date());
                            return (
                                <div
                                    key={date.toISOString()}
                                    className={`bg-white p-1.5 dark:bg-gray-800 ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                                    style={{ minHeight: '60px' }}
                                >
                                    <span
                                        className={`mb-0.5 block text-[10px] font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                                    >
                                        {date.getDate()}
                                    </span>
                                    {reservations.slice(0, 2).map((r) => (
                                        <div
                                            key={r.id}
                                            className="mb-0.5 truncate rounded bg-blue-100 px-1 py-0.5 text-[8px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                        >
                                            {r.toolName}
                                        </div>
                                    ))}
                                    {reservations.length > 2 && <p className="text-[8px] text-gray-400">+{reservations.length - 2} more</p>}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Reservations List */}
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="inline-flex items-center gap-1 rounded-full bg-white px-1 py-1 text-[11px] shadow-sm dark:bg-gray-800">
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setFilter(tab.key)}
                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
                                        filter === tab.key
                                            ? 'bg-gray-900 text-white dark:bg-blue-600'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <span className="capitalize">{tab.label}</span>
                                    <span
                                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                            filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={
                                <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none">
                                    <rect x="6" y="8" width="28" height="26" rx="4" stroke="currentColor" strokeWidth="2" />
                                    <path d="M6 16H34" stroke="currentColor" strokeWidth="2" />
                                    <path d="M14 4V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M26 4V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            }
                            title="No borrow requests found"
                            description="You don't have any borrow requests matching this filter."
                        />
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((reservation) => (
                                <div
                                    key={reservation.id}
                                    className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm dark:bg-gray-800"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-700">
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                                                <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
                                                <path d="M3 8H17" stroke="currentColor" strokeWidth="1.4" />
                                                <path d="M7 2V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                <path d="M13 2V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{reservation.toolName}</p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                {reservation.toolId} · {reservation.startDate} - {reservation.endDate}
                                            </p>
                                            {reservation.recurring && (
                                                <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                                                        <path
                                                            d="M1.5 6C1.5 3.51472 3.51472 1.5 6 1.5C8.48528 1.5 10.5 3.51472 10.5 6C10.5 8.48528 8.48528 10.5 6 10.5"
                                                            stroke="currentColor"
                                                            strokeWidth="1"
                                                            strokeLinecap="round"
                                                        />
                                                        <path
                                                            d="M6 10.5L4.5 9M6 10.5L4.5 12"
                                                            stroke="currentColor"
                                                            strokeWidth="1"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    {reservation.recurrencePattern}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[reservation.status]}`}
                                        >
                                            {statusLabel(reservation.status)}
                                        </span>
                                        {reservation.status === 'pending_approval' && (
                                            <button
                                                type="button"
                                                onClick={() => setReservationToCancel(reservation)}
                                                className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
            )}

            {reservationToCancel && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Cancel borrow request?</h2>
                        <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-300">
                            Are you sure you want to cancel your borrow request for{' '}
                            <span className="font-semibold">{reservationToCancel.toolName}</span> ({reservationToCancel.toolId})? This action
                            will free up the reserved dates for other users.
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setReservationToCancel(null)}
                                className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                Keep request
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmCancel}
                                className="rounded-full bg-rose-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700"
                            >
                                Yes, cancel it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
