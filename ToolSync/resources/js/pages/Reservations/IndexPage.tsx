import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from '@/Components/Toast';
import { Breadcrumb } from '@/Components/Breadcrumb';
import { EmptyState } from '@/Components/EmptyState';
import AppLayout from '@/Layouts/AppLayout';

type Reservation = {
    id: number;
    toolName: string;
    toolId: string;
    startDate: string;
    endDate: string;
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    recurring?: boolean;
    recurrencePattern?: string;
};

const MOCK_RESERVATIONS: Reservation[] = [
    { id: 1, toolName: 'MacBook Pro 14"', toolId: 'LP-0001', startDate: '2026-02-10', endDate: '2026-02-14', status: 'upcoming' },
    { id: 2, toolName: 'Dell XPS 15', toolId: 'LP-0002', startDate: '2026-02-06', endDate: '2026-02-08', status: 'active' },
    { id: 3, toolName: 'Epson EB-X51', toolId: 'PR-0001', startDate: '2026-01-20', endDate: '2026-01-25', status: 'completed' },
    {
        id: 4,
        toolName: 'Canon EOS R6',
        toolId: 'CM-0001',
        startDate: '2026-02-15',
        endDate: '2026-02-20',
        status: 'upcoming',
        recurring: true,
        recurrencePattern: 'Weekly',
    },
    { id: 5, toolName: 'HP LaserJet', toolId: 'PT-0001', startDate: '2026-01-10', endDate: '2026-01-12', status: 'cancelled' },
];

const STATUS_STYLES: Record<string, string> = {
    upcoming: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    completed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    cancelled: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

type FilterStatus = 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled';

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
    const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
    const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const filtered = useMemo(() => {
        if (filter === 'all') return reservations;
        return reservations.filter((r) => r.status === filter);
    }, [reservations, filter]);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = getDaysInMonth(year, month);
    const firstDayOfWeek = days[0].getDay();

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const getReservationsForDay = (date: Date) => {
        return reservations.filter((r) => (r.status === 'upcoming' || r.status === 'active') && isInRange(date, r.startDate, r.endDate));
    };

    const handleConfirmCancel = () => {
        if (!reservationToCancel) return;

        // In this prototype view we only update local state. When the real
        // cancel API exists, this is the single place to call it.
        setReservations((prev) => prev.map((r) => (r.id === reservationToCancel.id ? { ...r, status: 'cancelled' } : r)));

        toast.success(`Reservation for ${reservationToCancel.toolName} has been cancelled.`);
        setReservationToCancel(null);
    };

    return (
        <AppLayout
            activeRoute="reservations"
            header={
                <>
                    <Breadcrumb className="mb-2">
                        <Breadcrumb.Home />
                        <Breadcrumb.Item isCurrent>Reservations</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Reservations</h1>
                </>
            }
        >
            <Head title="Reservations" />

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
                            {(['all', 'upcoming', 'active', 'completed', 'cancelled'] as const).map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFilter(status)}
                                    className={`rounded-full px-3 py-1 capitalize ${
                                        filter === status
                                            ? 'bg-gray-900 text-white dark:bg-blue-600'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {status === 'all' ? 'All' : status}
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
                            title="No reservations found"
                            description="You don't have any reservations matching this filter."
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
                                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLES[reservation.status]}`}
                                        >
                                            {reservation.status}
                                        </span>
                                        {reservation.status === 'upcoming' && (
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

            {reservationToCancel && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Cancel reservation?</h2>
                        <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-300">
                            Are you sure you want to cancel your reservation for{' '}
                            <span className="font-semibold">{reservationToCancel.toolName}</span> ({reservationToCancel.toolId})? This action
                            will free up the reserved dates for other users.
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setReservationToCancel(null)}
                                className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                Keep reservation
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
