import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Breadcrumb } from '@/Components/Breadcrumb';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

type BusinessHours = {
    day: DayOfWeek;
    enabled: boolean;
    open: string;
    close: string;
};

type AutoApprovalRule = {
    id: number;
    name: string;
    condition: string;
    enabled: boolean;
};

export default function IndexPage() {
    const [businessHours, setBusinessHours] = useState<BusinessHours[]>([
        { day: 'monday', enabled: true, open: '08:00', close: '17:00' },
        { day: 'tuesday', enabled: true, open: '08:00', close: '17:00' },
        { day: 'wednesday', enabled: true, open: '08:00', close: '17:00' },
        { day: 'thursday', enabled: true, open: '08:00', close: '17:00' },
        { day: 'friday', enabled: true, open: '08:00', close: '17:00' },
        { day: 'saturday', enabled: false, open: '09:00', close: '13:00' },
        { day: 'sunday', enabled: false, open: '09:00', close: '13:00' },
    ]);

    const [maxBorrowings, setMaxBorrowings] = useState(3);
    const [maxDuration, setMaxDuration] = useState(14);
    const [defaultDuration, setDefaultDuration] = useState(7);
    const [reminderDays, setReminderDays] = useState(2);
    const [overdueEscalationDays, setOverdueEscalationDays] = useState(3);

    const [holidays, setHolidays] = useState([
        { id: 1, name: 'New Year', date: '2026-01-01' },
        { id: 2, name: 'Independence Day', date: '2026-06-12' },
        { id: 3, name: 'Christmas', date: '2026-12-25' },
    ]);
    const [newHolidayName, setNewHolidayName] = useState('');
    const [newHolidayDate, setNewHolidayDate] = useState('');

    const [autoApprovalRules, setAutoApprovalRules] = useState<AutoApprovalRule[]>([
        { id: 1, name: 'Admin auto-approve', condition: 'User role is Admin', enabled: true },
        { id: 2, name: 'Short-term borrow', condition: 'Duration <= 3 days', enabled: true },
        { id: 3, name: 'Low-value tools', condition: 'Tool category is Consumables', enabled: false },
    ]);

    const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'holidays' | 'automation'>('general');

    const toggleBusinessDay = (index: number) => {
        setBusinessHours((prev) => prev.map((bh, i) => (i === index ? { ...bh, enabled: !bh.enabled } : bh)));
    };

    const updateHours = (index: number, field: 'open' | 'close', value: string) => {
        setBusinessHours((prev) => prev.map((bh, i) => (i === index ? { ...bh, [field]: value } : bh)));
    };

    const addHoliday = () => {
        if (!newHolidayName || !newHolidayDate) return;
        setHolidays((prev) => [...prev, { id: Date.now(), name: newHolidayName, date: newHolidayDate }]);
        setNewHolidayName('');
        setNewHolidayDate('');
    };

    const removeHoliday = (id: number) => {
        setHolidays((prev) => prev.filter((h) => h.id !== id));
    };

    const toggleAutoApproval = (id: number) => {
        setAutoApprovalRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
    };

    const handleSave = () => {
        toast.success('Settings saved successfully');
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
                                onClick={handleSave}
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
                                onClick={handleSave}
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
                                <div key={holiday.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-700">
                                    <div>
                                        <p className="text-xs font-medium text-gray-900 dark:text-white">{holiday.name}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{holiday.date}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeHoliday(holiday.id)}
                                        className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
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
                                            onChange={() => toggleAutoApproval(rule.id)}
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
                                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">Send email {reminderDays} days before due date</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">Send email on due date</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">Send daily reminder when overdue</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                        Escalate to admin after {overdueEscalationDays} days overdue
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end border-t pt-4 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                            >
                                Save Automation Settings
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
