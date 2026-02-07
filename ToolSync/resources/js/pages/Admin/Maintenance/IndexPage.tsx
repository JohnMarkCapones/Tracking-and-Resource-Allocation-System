import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/Components/Breadcrumb';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import Modal from '@/Components/Modal';
import { apiRequest } from '@/lib/http';
import type { MaintenanceScheduleApiItem, ToolDeprecationApiItem } from '@/lib/apiTypes';

type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue';

type MaintenanceRecord = {
    id: number;
    toolName: string;
    toolId: string;
    type: 'routine' | 'repair' | 'inspection' | 'calibration';
    scheduledDate: string;
    completedDate?: string;
    assignee: string;
    status: MaintenanceStatus;
    notes: string;
    usageCount: number;
    triggerThreshold: number;
};

function mapScheduleToRecord(m: MaintenanceScheduleApiItem): MaintenanceRecord {
    const status = m.status as MaintenanceStatus;
    return {
        id: m.id,
        toolName: m.toolName,
        toolId: m.toolId,
        type: m.type as MaintenanceRecord['type'],
        scheduledDate: m.scheduledDate,
        completedDate: m.completedDate ?? undefined,
        assignee: m.assignee,
        status,
        notes: m.notes ?? '',
        usageCount: m.usageCount,
        triggerThreshold: m.triggerThreshold,
    };
}

type DeprecationItem = {
    id: number;
    toolName: string;
    toolId: string;
    reason: string;
    retireDate: string;
    replacementId?: string;
    status: 'pending' | 'approved' | 'retired';
};

function mapDeprecationToItem(d: ToolDeprecationApiItem): DeprecationItem {
    const status = d.status as DeprecationItem['status'];
    return {
        id: d.id,
        toolName: d.toolName,
        toolId: d.toolId,
        reason: d.reason,
        retireDate: d.retireDate,
        replacementId: d.replacementId ?? undefined,
        status: status === 'pending' || status === 'approved' || status === 'retired' ? status : 'pending',
    };
}

const STATUS_STYLES: Record<MaintenanceStatus, string> = {
    scheduled: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    overdue: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const TYPE_STYLES: Record<string, string> = {
    routine: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    repair: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    inspection: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    calibration: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

type SchedulesResponse = { data: MaintenanceScheduleApiItem[] };
type DeprecationsResponse = { data: ToolDeprecationApiItem[] };

async function loadSchedules(): Promise<MaintenanceRecord[]> {
    const res = await apiRequest<SchedulesResponse>('/api/maintenance-schedules');
    return (res.data ?? []).map(mapScheduleToRecord);
}

async function loadDeprecations(): Promise<DeprecationItem[]> {
    const res = await apiRequest<DeprecationsResponse>('/api/tool-deprecations');
    return (res.data ?? []).map(mapDeprecationToItem);
}

export default function IndexPage() {
    const [activeTab, setActiveTab] = useState<'schedule' | 'deprecation'>('schedule');
    const [filterStatus, setFilterStatus] = useState<'all' | MaintenanceStatus>('all');
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
    const [deprecations, setDeprecations] = useState<DeprecationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    const [scheduleToolName, setScheduleToolName] = useState('');
    const [scheduleToolId, setScheduleToolId] = useState('');
    const [scheduleType, setScheduleType] = useState<'routine' | 'repair' | 'inspection' | 'calibration'>('routine');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleAssignee, setScheduleAssignee] = useState('');
    const [scheduleNotes, setScheduleNotes] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [schedules, deps] = await Promise.all([loadSchedules(), loadDeprecations()]);
                if (cancelled) return;
                setMaintenanceRecords(schedules);
                setDeprecations(deps);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load maintenance data');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const filteredMaintenance =
        filterStatus === 'all' ? maintenanceRecords : maintenanceRecords.filter((m) => m.status === filterStatus);

    const handleComplete = async (id: number): Promise<void> => {
        try {
            await apiRequest(`/api/maintenance-schedules/${id}`, {
                method: 'PUT',
                body: { status: 'completed', completed_date: new Date().toISOString().slice(0, 10) },
            });
            setMaintenanceRecords((prev) =>
                prev.map((record) => (record.id === id ? { ...record, status: 'completed' as const } : record)),
            );
            toast.success('Maintenance marked as completed');
        } catch {
            toast.error('Could not update maintenance');
        }
    };

    const handleOpenScheduleModal = (): void => {
        setScheduleToolName('');
        setScheduleToolId('');
        setScheduleType('routine');
        setScheduleDate('');
        setScheduleAssignee('');
        setScheduleNotes('');
        setIsScheduleModalOpen(true);
    };

    const handleSubmitSchedule = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!scheduleToolName.trim() || !scheduleToolId.trim() || !scheduleDate || !scheduleAssignee.trim()) {
            toast.error('Please fill in tool, ID, date, and assignee.');
            return;
        }

        const toolIdNum = parseInt(scheduleToolId.replace(/^TL-?/i, ''), 10);
        if (Number.isNaN(toolIdNum)) {
            toast.error('Tool ID must be a number or in format TL-1.');
            return;
        }

        try {
            await apiRequest('/api/maintenance-schedules', {
                method: 'POST',
                body: {
                    tool_id: toolIdNum,
                    type: scheduleType,
                    scheduled_date: scheduleDate,
                    assignee: scheduleAssignee.trim(),
                    notes: scheduleNotes.trim() || null,
                },
            });
            const schedules = await loadSchedules();
            setMaintenanceRecords(schedules);
            setIsScheduleModalOpen(false);
            toast.success('Maintenance scheduled.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to schedule maintenance');
        }
    };

    return (
        <AppLayout
            activeRoute="admin-maintenance"
            variant="admin"
            header={
                <>
                    <Breadcrumb className="mb-2">
                        <Breadcrumb.Home href="/admin/dashboard" />
                        <Breadcrumb.Item isCurrent>Maintenance</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Maintenance Scheduling</h1>
                </>
            }
        >
            <Head title="Maintenance" />

            {loading && (
                <div className="rounded-3xl bg-white px-5 py-12 text-center text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                    Loading maintenance data…
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
                <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 rounded-full bg-white px-1 py-1 text-[11px] shadow-sm dark:bg-gray-800">
                        <button
                            type="button"
                            onClick={() => setActiveTab('schedule')}
                            className={`rounded-full px-4 py-1.5 font-medium ${activeTab === 'schedule' ? 'bg-gray-900 text-white dark:bg-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                            Schedule
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('deprecation')}
                            className={`rounded-full px-4 py-1.5 font-medium ${activeTab === 'deprecation' ? 'bg-gray-900 text-white dark:bg-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                            Deprecation
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenScheduleModal}
                        className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        + Schedule Maintenance
                    </button>
                </div>

                {activeTab === 'schedule' && (
                    <>
                        {/* Quick Stats */}
                        <div className="grid gap-4 sm:grid-cols-4">
                            {[
                                {
                                    label: 'Scheduled',
                                    count: maintenanceRecords.filter((m) => m.status === 'scheduled').length,
                                    color: 'text-blue-600',
                                },
                                {
                                    label: 'In Progress',
                                    count: maintenanceRecords.filter((m) => m.status === 'in_progress').length,
                                    color: 'text-amber-600',
                                },
                                {
                                    label: 'Overdue',
                                    count: maintenanceRecords.filter((m) => m.status === 'overdue').length,
                                    color: 'text-rose-600',
                                },
                                {
                                    label: 'Completed',
                                    count: maintenanceRecords.filter((m) => m.status === 'completed').length,
                                    color: 'text-emerald-600',
                                },
                            ].map((stat) => (
                                <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
                                    <p className="text-[10px] font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">{stat.label}</p>
                                    <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                                </div>
                            ))}
                        </div>

                        {/* Filter */}
                        <div className="inline-flex items-center gap-1 rounded-full bg-white px-1 py-1 text-[11px] shadow-sm dark:bg-gray-800">
                            {(['all', 'scheduled', 'in_progress', 'overdue', 'completed'] as const).map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFilterStatus(status)}
                                    className={`rounded-full px-3 py-1 capitalize ${
                                        filterStatus === status ? 'bg-gray-900 text-white dark:bg-blue-600' : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    {status === 'all' ? 'All' : status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        {/* Maintenance List */}
                        <div className="space-y-3">
                            {filteredMaintenance.map((record) => (
                                <div key={record.id} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-700">
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                                                    <path
                                                        d="M7 4L4 7L6 9L9 6M11 5L15 9L13 11L9 7M5 14L9 10M11 12L14 15"
                                                        stroke="currentColor"
                                                        strokeWidth="1.4"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{record.toolName}</p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    {record.toolId} · Assigned to {record.assignee}
                                                </p>
                                                <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">{record.notes}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${TYPE_STYLES[record.type]}`}
                                                    >
                                                        {record.type}
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLES[record.status]}`}
                                                    >
                                                        {record.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                {/* Usage meter */}
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                                        <span>
                                                            Usage: {record.usageCount}/{record.triggerThreshold}
                                                        </span>
                                                        <span>{Math.round((record.usageCount / record.triggerThreshold) * 100)}%</span>
                                                    </div>
                                                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                                        <div
                                                            className={`h-full rounded-full ${record.usageCount >= record.triggerThreshold ? 'bg-rose-500' : 'bg-blue-500'}`}
                                                            style={{
                                                                width: `${Math.min((record.usageCount / record.triggerThreshold) * 100, 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{record.scheduledDate}</p>
                                            {record.status !== 'completed' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleComplete(record.id)}
                                                    className="mt-2 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                                >
                                                    Mark Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'deprecation' && (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tools scheduled for retirement</p>
                        {deprecations.map((item) => (
                            <div key={item.id} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.toolName}</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{item.toolId}</p>
                                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{item.reason}</p>
                                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                            Retire date: {item.retireDate}
                                            {item.replacementId && ` · Replacement: ${item.replacementId}`}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                                            item.status === 'approved'
                                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                : item.status === 'retired'
                                                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                  : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            )}
            <Modal show={isScheduleModalOpen} maxWidth="md" onClose={() => setIsScheduleModalOpen(false)}>
                <div className="overflow-hidden rounded-lg">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 text-white">
                        <h2 className="text-sm font-semibold">Schedule Maintenance</h2>
                        <p className="mt-1 text-[11px] text-blue-100">
                            Create a quick maintenance task for a tool. You can refine details later from the maintenance list.
                        </p>
                    </div>
                    <form onSubmit={handleSubmitSchedule}>
                        <div className="space-y-4 bg-white px-6 py-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="toolName"
                                        className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase"
                                    >
                                        Tool name
                                    </label>
                                    <input
                                        id="toolName"
                                        type="text"
                                        value={scheduleToolName}
                                        onChange={(e) => setScheduleToolName(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. 3D Printer"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="toolId"
                                        className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase"
                                    >
                                        Tool ID
                                    </label>
                                    <input
                                        id="toolId"
                                        type="text"
                                        value={scheduleToolId}
                                        onChange={(e) => setScheduleToolId(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. PR-0010"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="maintenanceType"
                                        className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase"
                                    >
                                        Type
                                    </label>
                                    <select
                                        id="maintenanceType"
                                        value={scheduleType}
                                        onChange={(e) =>
                                            setScheduleType(e.target.value as 'routine' | 'repair' | 'inspection' | 'calibration')
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="routine">Routine</option>
                                        <option value="repair">Repair</option>
                                        <option value="inspection">Inspection</option>
                                        <option value="calibration">Calibration</option>
                                    </select>
                                </div>
                                <div>
                                    <label
                                        htmlFor="scheduledDate"
                                        className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase"
                                    >
                                        Scheduled date
                                    </label>
                                    <input
                                        id="scheduledDate"
                                        type="date"
                                        value={scheduleDate}
                                        onChange={(e) => setScheduleDate(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="assignee"
                                    className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase"
                                >
                                    Assignee
                                </label>
                                <input
                                    id="assignee"
                                    type="text"
                                    value={scheduleAssignee}
                                    onChange={(e) => setScheduleAssignee(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Tech Team"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="notes"
                                    className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase"
                                >
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    value={scheduleNotes}
                                    onChange={(e) => setScheduleNotes(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="What needs to be checked or fixed?"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-3">
                            <button
                                type="button"
                                onClick={() => setIsScheduleModalOpen(false)}
                                className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700"
                            >
                                Schedule
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AppLayout>
    );
}
