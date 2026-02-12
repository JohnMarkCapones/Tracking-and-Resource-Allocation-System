import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Breadcrumb } from '@/Components/Breadcrumb';
import Modal from '@/Components/Modal';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import type { SettingsApiResponse } from '@/lib/apiTypes';
import { apiRequest } from '@/lib/http';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DAY_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_TO_API: Record<DayOfWeek, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
};

type BusinessHours = {
    day: DayOfWeek;
    enabled: boolean;
    open: string;
    close: string;
};

type HolidayRow = { id: number; name: string; date: string };

type AutoApprovalRule = {
    id: number;
    name: string;
    condition: string;
    enabled: boolean;
};

type ConfirmAction =
    | { type: 'save-general' }
    | { type: 'save-hours' }
    | { type: 'save-holidays' }
    | { type: 'save-automation' }
    | { type: 'remove-holiday'; id: number }
    | { type: 'toggle-auto-approval'; id: number; nextEnabled: boolean };

const defaultBusinessHours: BusinessHours[] = DAY_ORDER.map((day) =>
    day === 'saturday' || day === 'sunday'
        ? { day, enabled: false, open: '09:00', close: '13:00' }
        : { day, enabled: true, open: '08:00', close: '17:00' },
);

const parseNumberSetting = (value: string | undefined, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBooleanSetting = (value: string | undefined, fallback: boolean): boolean => {
    if (value === undefined) return fallback;
    if (value === '1' || value.toLowerCase() === 'true') return true;
    if (value === '0' || value.toLowerCase() === 'false') return false;
    return fallback;
};

export default function IndexPage() {
    const [businessHours, setBusinessHours] = useState<BusinessHours[]>(defaultBusinessHours);

    const [maxBorrowings, setMaxBorrowings] = useState(3);
    const [maxDuration, setMaxDuration] = useState(14);
    const [defaultDuration, setDefaultDuration] = useState(7);
    const [reminderDays, setReminderDays] = useState(2);
    const [overdueEscalationDays, setOverdueEscalationDays] = useState(3);
    const [reminderEmailBeforeDue, setReminderEmailBeforeDue] = useState(true);
    const [reminderEmailOnDue, setReminderEmailOnDue] = useState(true);
    const [reminderEmailDailyOverdue, setReminderEmailDailyOverdue] = useState(true);
    const [reminderEscalateToAdmin, setReminderEscalateToAdmin] = useState(true);

    const [holidays, setHolidays] = useState<HolidayRow[]>([]);
    const [newHolidayName, setNewHolidayName] = useState('');
    const [newHolidayDate, setNewHolidayDate] = useState('');
    const localHolidayIdRef = useRef(-1);

    const [autoApprovalRules, setAutoApprovalRules] = useState<AutoApprovalRule[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiRequest<SettingsApiResponse>('/api/settings');
            const d = res.data;
            const g = d.general ?? {};
            setMaxBorrowings(parseNumberSetting(g.max_borrowings, 3));
            setMaxDuration(parseNumberSetting(g.max_duration, 14));
            setDefaultDuration(parseNumberSetting(g.default_duration, 7));
            setReminderDays(parseNumberSetting(g.reminder_days, 2));
            setOverdueEscalationDays(parseNumberSetting(g.overdue_escalation_days, 3));
            setReminderEmailBeforeDue(parseBooleanSetting(g.reminder_email_before_due, true));
            setReminderEmailOnDue(parseBooleanSetting(g.reminder_email_on_due, true));
            setReminderEmailDailyOverdue(parseBooleanSetting(g.reminder_email_daily_overdue, true));
            setReminderEscalateToAdmin(parseBooleanSetting(g.reminder_escalate_to_admin, true));

            const hours = (d.business_hours ?? []).slice().sort((a, b) => a.day_of_week - b.day_of_week);
            const uiOrder = [1, 2, 3, 4, 5, 6, 0].map((dow) => hours.find((h) => h.day_of_week === dow));
            setBusinessHours(
                DAY_ORDER.map((day, i) => {
                    const h = uiOrder[i];
                    return h
                        ? { day, enabled: h.enabled, open: h.open ?? '09:00', close: h.close ?? '17:00' }
                        : { day, enabled: day !== 'saturday' && day !== 'sunday', open: '08:00', close: '17:00' };
                }),
            );

            setHolidays((d.holidays ?? []).map((h) => ({ id: h.id, name: h.name, date: h.date })));
            setAutoApprovalRules(
                (d.auto_approval_rules ?? []).map((r) => ({
                    id: r.id,
                    name: r.name,
                    condition: r.condition,
                    enabled: r.enabled,
                })),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'holidays' | 'automation'>('general');
    const [pendingConfirm, setPendingConfirm] = useState<ConfirmAction | null>(null);

    const toggleBusinessDay = (index: number) => {
        setBusinessHours((prev) => prev.map((bh, i) => (i === index ? { ...bh, enabled: !bh.enabled } : bh)));
    };

    const updateHours = (index: number, field: 'open' | 'close', value: string) => {
        setBusinessHours((prev) => prev.map((bh, i) => (i === index ? { ...bh, [field]: value } : bh)));
    };

    const addHoliday = () => {
        if (!newHolidayName || !newHolidayDate) return;
        const localId = localHolidayIdRef.current;
        localHolidayIdRef.current -= 1;
        setHolidays((prev) => [...prev, { id: localId, name: newHolidayName, date: newHolidayDate }]);
        setNewHolidayName('');
        setNewHolidayDate('');
    };

    const requestRemoveHoliday = (id: number) => {
        setPendingConfirm({ type: 'remove-holiday', id });
    };

    const requestToggleAutoApproval = (id: number) => {
        setAutoApprovalRules((prev) => {
            const current = prev.find((r) => r.id === id);
            if (!current) return prev;
            const nextEnabled = !current.enabled;
            setPendingConfirm({ type: 'toggle-auto-approval', id, nextEnabled });
            return prev;
        });
    };

    const performConfirmAction = async () => {
        if (!pendingConfirm) return;

        const confirm = pendingConfirm;
        setPendingConfirm(null);

        try {
            switch (confirm.type) {
                case 'save-general':
                    await apiRequest('/api/settings', {
                        method: 'PUT',
                        body: {
                            general: {
                                max_borrowings: maxBorrowings,
                                max_duration: maxDuration,
                                default_duration: defaultDuration,
                                reminder_days: reminderDays,
                                overdue_escalation_days: overdueEscalationDays,
                            },
                        },
                    });
                    await loadSettings();
                    toast.success('General settings saved successfully');
                    break;
                case 'save-hours':
                    await apiRequest('/api/settings', {
                        method: 'PUT',
                        body: {
                            business_hours: businessHours.map((bh) => ({
                                day_of_week: DAY_TO_API[bh.day],
                                enabled: bh.enabled,
                                open: bh.open,
                                close: bh.close,
                            })),
                        },
                    });
                    await loadSettings();
                    toast.success('Business hours saved successfully');
                    break;
                case 'save-automation':
                    await apiRequest('/api/settings', {
                        method: 'PUT',
                        body: {
                            general: {
                                reminder_email_before_due: reminderEmailBeforeDue,
                                reminder_email_on_due: reminderEmailOnDue,
                                reminder_email_daily_overdue: reminderEmailDailyOverdue,
                                reminder_escalate_to_admin: reminderEscalateToAdmin,
                            },
                            auto_approval_rules: autoApprovalRules.map((r) => ({ id: r.id, enabled: r.enabled })),
                        },
                    });
                    await loadSettings();
                    toast.success('Automation settings saved successfully');
                    break;
                case 'save-holidays':
                    await apiRequest('/api/settings', {
                        method: 'PUT',
                        body: {
                            holidays: holidays.map((h) =>
                                h.id > 0 ? { id: h.id, name: h.name, date: h.date } : { name: h.name, date: h.date },
                            ),
                        },
                    });
                    await loadSettings();
                    toast.success('Holiday calendar saved.');
                    break;
                case 'remove-holiday': {
                    const nextHolidays = holidays.filter((h) => h.id !== confirm.id);
                    await apiRequest('/api/settings', {
                        method: 'PUT',
                        body: {
                            holidays: nextHolidays.map((h) =>
                                h.id > 0 ? { id: h.id, name: h.name, date: h.date } : { name: h.name, date: h.date },
                            ),
                        },
                    });
                    setHolidays(nextHolidays);
                    await loadSettings();
                    toast.success('Holiday removed from calendar.');
                    break;
                }
                case 'toggle-auto-approval': {
                    const nextRules = autoApprovalRules.map((r) =>
                        r.id === confirm.id ? { ...r, enabled: confirm.nextEnabled } : r,
                    );
                    await apiRequest('/api/settings', {
                        method: 'PUT',
                        body: {
                            auto_approval_rules: nextRules.map((r) => ({ id: r.id, enabled: r.enabled })),
                        },
                    });
                    setAutoApprovalRules(nextRules);
                    await loadSettings();
                    toast.success(
                        confirm.nextEnabled ? 'Auto-approval rule enabled.' : 'Auto-approval rule disabled.',
                    );
                    break;
                }
                default:
                    break;
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save settings');
            setPendingConfirm(confirm);
        }
    };

    const requestSaveGeneral = () => {
        setPendingConfirm({ type: 'save-general' });
    };

    const requestSaveHours = () => {
        setPendingConfirm({ type: 'save-hours' });
    };

    const requestSaveAutomation = () => {
        setPendingConfirm({ type: 'save-automation' });
    };

    const requestSaveHolidays = () => {
        setPendingConfirm({ type: 'save-holidays' });
    };

    const tabs = [
        { key: 'general' as const, label: 'General' },
        { key: 'hours' as const, label: 'Business Hours' },
        { key: 'holidays' as const, label: 'Holidays' },
        { key: 'automation' as const, label: 'Automation' },
    ];

    return (
        <AppLayout
            activeRoute="admin-settings"
            variant="admin"
            header={
                <>
                    <Breadcrumb className="mb-2">
                        <Breadcrumb.Home href="/admin/dashboard" />
                        <Breadcrumb.Item isCurrent>Settings</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">System Configuration</h1>
                </>
            }
        >
            <Head title="System Settings" />

            {loading && (
                <div className="rounded-3xl bg-white px-5 py-12 text-center text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                    Loading settings…
                </div>
            )}
            {error && (
                <div className="rounded-3xl bg-red-50 px-5 py-4 text-red-700 shadow-sm dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}
            {!loading && !error && (
            <div className="space-y-6">
                {/* Tabs */}
                <div className="inline-flex items-center gap-1 rounded-full bg-white px-1 py-1 text-[11px] shadow-sm dark:bg-gray-800">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'bg-gray-900 text-white dark:bg-blue-600'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* General Settings */}
                {activeTab === 'general' && (
                    <div className="max-w-2xl space-y-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Borrowing Limits</h3>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Max concurrent borrowings per user</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={maxBorrowings}
                                    onChange={(e) => setMaxBorrowings(Number(e.target.value))}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Max borrowing duration (days)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={90}
                                    value={maxDuration}
                                    onChange={(e) => setMaxDuration(Number(e.target.value))}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Default borrowing duration (days)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={maxDuration}
                                    value={defaultDuration}
                                    onChange={(e) => setDefaultDuration(Number(e.target.value))}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Return reminder (days before due)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={7}
                                    value={reminderDays}
                                    onChange={(e) => setReminderDays(Number(e.target.value))}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="border-t pt-6 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Overdue Escalation</h3>
                            <div className="mt-3">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Escalate to admin after (days overdue)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={14}
                                    value={overdueEscalationDays}
                                    onChange={(e) => setOverdueEscalationDays(Number(e.target.value))}
                                    className="mt-1 w-full max-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end border-t pt-4 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={requestSaveGeneral}
                                className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {/* Business Hours */}
                {activeTab === 'hours' && (
                    <div className="max-w-2xl rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Operating Hours</h3>
                        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Set the hours when tools can be picked up and returned</p>
                        <div className="space-y-3">
                            {businessHours.map((bh, index) => (
                                <div key={bh.day} className="flex items-center gap-4">
                                    <label className="flex w-32 items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={bh.enabled}
                                            onChange={() => toggleBusinessDay(index)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                        />
                                        <span className="text-xs font-medium text-gray-700 capitalize dark:text-gray-300">{bh.day}</span>
                                    </label>
                                    {bh.enabled ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                value={bh.open}
                                                onChange={(e) => updateHours(index, 'open', e.target.value)}
                                                className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                            <span className="text-xs text-gray-500">to</span>
                                            <input
                                                type="time"
                                                value={bh.close}
                                                onChange={(e) => updateHours(index, 'close', e.target.value)}
                                                className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 dark:text-gray-500">Closed</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end border-t pt-4 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={requestSaveHours}
                                className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                            >
                                Save Hours
                            </button>
                        </div>
                    </div>
                )}

                {/* Holidays */}
                {activeTab === 'holidays' && (
                    <div className="max-w-2xl rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Holiday Calendar</h3>
                        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Non-working days when pickups/returns are unavailable</p>

                        <div className="mb-4 flex gap-2">
                            <input
                                type="text"
                                placeholder="Holiday name"
                                value={newHolidayName}
                                onChange={(e) => setNewHolidayName(e.target.value)}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="date"
                                value={newHolidayDate}
                                onChange={(e) => setNewHolidayDate(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={addHoliday}
                                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>

                        <div className="space-y-2">
                            {holidays.map((holiday) => (
                                <div key={holiday.id || holiday.date + holiday.name} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-700">
                                    <div>
                                        <p className="text-xs font-medium text-gray-900 dark:text-white">{holiday.name}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{holiday.date}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => requestRemoveHoliday(holiday.id)}
                                        className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end border-t pt-4 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={requestSaveHolidays}
                                className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                            >
                                Save holidays
                            </button>
                        </div>
                    </div>
                )}

                {/* Automation */}
                {activeTab === 'automation' && (
                    <div className="max-w-2xl rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Auto-Approval Rules</h3>
                        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                            Automatically approve borrowing requests that match these rules
                        </p>

                        <div className="space-y-3">
                            {autoApprovalRules.map((rule) => (
                                <div key={rule.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-700">
                                    <div>
                                        <p className="text-xs font-medium text-gray-900 dark:text-white">{rule.name}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{rule.condition}</p>
                                    </div>
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            checked={rule.enabled}
                                            onChange={() => requestToggleAutoApproval(rule.id)}
                                            className="peer sr-only"
                                        />
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 peer-checked:bg-blue-600 after:absolute after:top-0.5 after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full dark:bg-gray-600" />
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 border-t pt-4 dark:border-gray-700">
                            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Return Reminders</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={reminderEmailBeforeDue}
                                        onChange={(e) => setReminderEmailBeforeDue(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                    />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">Send email {reminderDays} days before due date</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={reminderEmailOnDue}
                                        onChange={(e) => setReminderEmailOnDue(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                    />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">Send email on due date</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={reminderEmailDailyOverdue}
                                        onChange={(e) => setReminderEmailDailyOverdue(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                    />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">Send daily reminder when overdue</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={reminderEscalateToAdmin}
                                        onChange={(e) => setReminderEscalateToAdmin(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                    />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                        Escalate to admin after {overdueEscalationDays} days overdue
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end border-t pt-4 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={requestSaveAutomation}
                                className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                            >
                                Save Automation Settings
                            </button>
                        </div>
                    </div>
                )}
            </div>
            )}
            {pendingConfirm && (
                <Modal show={true} maxWidth="sm" onClose={() => setPendingConfirm(null)}>
                    <div className="overflow-hidden rounded-lg">
                        <div className="bg-gradient-to-r from-slate-900 to-blue-700 px-6 py-3 text-white">
                            <h2 className="text-sm font-semibold">
                                {pendingConfirm.type === 'save-general' && 'Save general settings?'}
                                {pendingConfirm.type === 'save-hours' && 'Save business hours?'}
                                {pendingConfirm.type === 'save-holidays' && 'Save holiday calendar?'}
                                {pendingConfirm.type === 'save-automation' && 'Save automation settings?'}
                                {pendingConfirm.type === 'remove-holiday' && 'Remove holiday?'}
                                {pendingConfirm.type === 'toggle-auto-approval' && 'Update auto-approval rule?'}
                            </h2>
                        </div>
                        <div className="space-y-3 bg-white px-6 py-4 text-[11px] text-gray-700">
                            {pendingConfirm.type === 'save-general' && (
                                <p>
                                    Are you sure you want to save these **borrowing limits and escalation rules**? They
                                    will immediately affect how new borrowing requests are validated.
                                </p>
                            )}
                            {pendingConfirm.type === 'save-hours' && (
                                <p>
                                    Save the updated **operating hours**? Pickups and returns outside these hours will
                                    be blocked or rescheduled.
                                </p>
                            )}
                            {pendingConfirm.type === 'save-holidays' && (
                                <p>
                                    Save the **holiday calendar**? New holidays will be stored and removed ones will be
                                    deleted.
                                </p>
                            )}
                            {pendingConfirm.type === 'save-automation' && (
                                <p>
                                    Apply these **automation and reminder settings**? Future requests and notifications
                                    will follow the new behavior.
                                </p>
                            )}
                            {pendingConfirm.type === 'remove-holiday' && (
                                <p>
                                    Are you sure you want to remove this holiday from the calendar? Bookings will once
                                    again be allowed on that date.
                                </p>
                            )}
                            {pendingConfirm.type === 'toggle-auto-approval' && (
                                <p>
                                    {pendingConfirm.nextEnabled
                                        ? 'Enable this auto-approval rule? Matching requests will be approved automatically without manual review.'
                                        : 'Disable this auto-approval rule? Matching requests will require manual approval.'}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-3">
                            <button
                                type="button"
                                onClick={() => setPendingConfirm(null)}
                                className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={performConfirmAction}
                                className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700"
                            >
                                Yes, continue
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </AppLayout>
    );
}
