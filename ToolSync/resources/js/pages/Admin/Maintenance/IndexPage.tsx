import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/Components/Breadcrumb';
import { EmptyState } from '@/Components/EmptyState';
import Modal from '@/Components/Modal';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import type { MaintenanceScheduleApiItem, ToolDeprecationApiItem, ToolDto } from '@/lib/apiTypes';
import { apiRequest } from '@/lib/http';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MaintenanceType = 'routine' | 'repair' | 'inspection' | 'calibration';
type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue';

type MaintenanceRecord = {
    id: number;
    rawToolId: number;
    toolName: string;
    toolId: string;
    type: MaintenanceType;
    scheduledDate: string;
    completedDate?: string;
    assignee: string;
    status: MaintenanceStatus;
    notes: string;
    usageCount: number;
    triggerThreshold: number;
};

type DeprecationItem = {
    id: number;
    rawToolId: number;
    toolName: string;
    toolId: string;
    reason: string;
    retireDate: string;
    rawReplacementId: number | null;
    replacementId?: string;
    status: 'pending' | 'approved' | 'retired';
};

type ToolOption = { id: number; name: string };
type DeleteTarget = { type: 'schedule' | 'deprecation'; id: number; name: string };

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapScheduleToRecord(m: MaintenanceScheduleApiItem): MaintenanceRecord {
    return {
        id: m.id,
        rawToolId: m.tool_id,
        toolName: m.toolName,
        toolId: m.toolId,
        type: m.type as MaintenanceType,
        scheduledDate: m.scheduledDate,
        completedDate: m.completedDate ?? undefined,
        assignee: m.assignee,
        status: m.status as MaintenanceStatus,
        notes: m.notes ?? '',
        usageCount: m.usageCount,
        triggerThreshold: m.triggerThreshold,
    };
}

function mapDeprecationToItem(d: ToolDeprecationApiItem): DeprecationItem {
    const status = d.status as DeprecationItem['status'];
    return {
        id: d.id,
        rawToolId: d.tool_id,
        toolName: d.toolName,
        toolId: d.toolId,
        reason: d.reason,
        retireDate: d.retireDate,
        rawReplacementId: d.replacement_tool_id ?? null,
        replacementId: d.replacementId ?? undefined,
        status: status === 'pending' || status === 'approved' || status === 'retired' ? status : 'pending',
    };
}

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

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

const DEPRECATION_STATUS_STYLES: Record<string, string> = {
    pending: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    approved: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    retired: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const INPUT_CLS =
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400';

const LABEL_CLS = 'mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400';

const ACTION_LINK = 'text-[11px] font-medium hover:underline';

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

type SchedulesResponse = { data: MaintenanceScheduleApiItem[]; meta?: { table_missing?: string } };
type DeprecationsResponse = { data: ToolDeprecationApiItem[] };

async function loadSchedules(): Promise<{ records: MaintenanceRecord[]; tableMissing: boolean }> {
    const res = await apiRequest<SchedulesResponse>('/api/maintenance-schedules');
    return {
        records: (res.data ?? []).map(mapScheduleToRecord),
        tableMissing: res.meta?.table_missing === 'maintenance_schedules',
    };
}

async function loadDeprecations(): Promise<DeprecationItem[]> {
    const res = await apiRequest<DeprecationsResponse>('/api/tool-deprecations');
    return (res.data ?? []).map(mapDeprecationToItem);
}

async function loadTools(): Promise<ToolOption[]> {
    const res = await apiRequest<{ data: ToolDto[] }>('/api/tools');
    return (res.data ?? []).map((t) => ({ id: t.id, name: t.name }));
}

// ---------------------------------------------------------------------------
// Inline SVG icons (small, reusable)
// ---------------------------------------------------------------------------

function WrenchIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="none">
            <path
                d="M7 4L4 7L6 9L9 6M11 5L15 9L13 11L9 7M5 14L9 10M11 12L14 15"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
            />
        </svg>
    );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function IndexPage() {
    // Data
    const [tools, setTools] = useState<ToolOption[]>([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
    const [deprecations, setDeprecations] = useState<DeprecationItem[]>([]);

    // UI
    const [activeTab, setActiveTab] = useState<'schedule' | 'deprecation'>('schedule');
    const [filterStatus, setFilterStatus] = useState<'all' | MaintenanceStatus>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [maintenanceTableMissing, setMaintenanceTableMissing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Schedule modal
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
    const [scheduleToolId, setScheduleToolId] = useState<number | ''>('');
    const [scheduleType, setScheduleType] = useState<MaintenanceType>('routine');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleAssignee, setScheduleAssignee] = useState('');
    const [scheduleNotes, setScheduleNotes] = useState('');

    // Deprecation modal
    const [isDeprecationModalOpen, setIsDeprecationModalOpen] = useState(false);
    const [editingDeprecationId, setEditingDeprecationId] = useState<number | null>(null);
    const [deprecationToolId, setDeprecationToolId] = useState<number | ''>('');
    const [deprecationReason, setDeprecationReason] = useState('');
    const [deprecationRetireDate, setDeprecationRetireDate] = useState('');
    const [deprecationReplacementId, setDeprecationReplacementId] = useState<number | ''>('');

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

    // -----------------------------------------------------------------------
    // Load data
    // -----------------------------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [schedulesResult, deps, toolList] = await Promise.all([loadSchedules(), loadDeprecations(), loadTools()]);
                if (cancelled) return;
                setMaintenanceRecords(schedulesResult.records);
                setMaintenanceTableMissing(schedulesResult.tableMissing);
                setDeprecations(deps);
                setTools(toolList);
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

    // -----------------------------------------------------------------------
    // Derived
    // -----------------------------------------------------------------------

    const filteredMaintenance = filterStatus === 'all' ? maintenanceRecords : maintenanceRecords.filter((m) => m.status === filterStatus);

    const stats = {
        scheduled: maintenanceRecords.filter((m) => m.status === 'scheduled').length,
        in_progress: maintenanceRecords.filter((m) => m.status === 'in_progress').length,
        overdue: maintenanceRecords.filter((m) => m.status === 'overdue').length,
        completed: maintenanceRecords.filter((m) => m.status === 'completed').length,
    };

    // -----------------------------------------------------------------------
    // Schedule handlers
    // -----------------------------------------------------------------------

    const openCreateScheduleModal = (): void => {
        setEditingScheduleId(null);
        setScheduleToolId('');
        setScheduleType('routine');
        setScheduleDate('');
        setScheduleAssignee('');
        setScheduleNotes('');
        setIsScheduleModalOpen(true);
    };

    const openEditScheduleModal = (record: MaintenanceRecord): void => {
        setEditingScheduleId(record.id);
        setScheduleToolId(record.rawToolId);
        setScheduleType(record.type);
        setScheduleDate(record.scheduledDate);
        setScheduleAssignee(record.assignee);
        setScheduleNotes(record.notes);
        setIsScheduleModalOpen(true);
    };

    const handleSubmitSchedule = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!scheduleToolId || !scheduleDate || !scheduleAssignee.trim()) {
            toast.error('Please select a tool and fill in date and assignee.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                tool_id: scheduleToolId,
                type: scheduleType,
                scheduled_date: scheduleDate,
                assignee: scheduleAssignee.trim(),
                notes: scheduleNotes.trim() || null,
            };

            if (editingScheduleId) {
                await apiRequest(`/api/maintenance-schedules/${editingScheduleId}`, { method: 'PUT', body: payload });
            } else {
                await apiRequest('/api/maintenance-schedules', { method: 'POST', body: payload });
            }

            const { records } = await loadSchedules();
            setMaintenanceRecords(records);
            setIsScheduleModalOpen(false);
            toast.success(editingScheduleId ? 'Schedule updated.' : 'Maintenance scheduled.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save schedule');
        } finally {
            setSubmitting(false);
        }
    };

    const handleScheduleStatusChange = async (id: number, newStatus: MaintenanceStatus): Promise<void> => {
        try {
            const body: Record<string, string> = { status: newStatus };
            if (newStatus === 'completed') {
                body.completed_date = new Date().toISOString().slice(0, 10);
            }
            await apiRequest(`/api/maintenance-schedules/${id}`, { method: 'PUT', body });
            const { records } = await loadSchedules();
            setMaintenanceRecords(records);
            toast.success(`Status updated to ${newStatus.replace('_', ' ')}.`);
        } catch {
            toast.error('Could not update status.');
        }
    };

    // -----------------------------------------------------------------------
    // Deprecation handlers
    // -----------------------------------------------------------------------

    const openCreateDeprecationModal = (): void => {
        setEditingDeprecationId(null);
        setDeprecationToolId('');
        setDeprecationReason('');
        setDeprecationRetireDate('');
        setDeprecationReplacementId('');
        setIsDeprecationModalOpen(true);
    };

    const openEditDeprecationModal = (item: DeprecationItem): void => {
        setEditingDeprecationId(item.id);
        setDeprecationToolId(item.rawToolId);
        setDeprecationReason(item.reason);
        setDeprecationRetireDate(item.retireDate);
        setDeprecationReplacementId(item.rawReplacementId ?? '');
        setIsDeprecationModalOpen(true);
    };

    const handleSubmitDeprecation = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!deprecationToolId || !deprecationReason.trim() || !deprecationRetireDate) {
            toast.error('Please select a tool and fill in reason and retire date.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                tool_id: deprecationToolId,
                reason: deprecationReason.trim(),
                retire_date: deprecationRetireDate,
                replacement_tool_id: deprecationReplacementId || null,
            };

            if (editingDeprecationId) {
                await apiRequest(`/api/tool-deprecations/${editingDeprecationId}`, { method: 'PUT', body: payload });
            } else {
                await apiRequest('/api/tool-deprecations', { method: 'POST', body: payload });
            }

            const deps = await loadDeprecations();
            setDeprecations(deps);
            setIsDeprecationModalOpen(false);
            toast.success(editingDeprecationId ? 'Deprecation updated.' : 'Deprecation scheduled.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save deprecation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeprecationStatusChange = async (id: number, newStatus: 'approved' | 'retired'): Promise<void> => {
        try {
            await apiRequest(`/api/tool-deprecations/${id}`, { method: 'PUT', body: { status: newStatus } });
            const deps = await loadDeprecations();
            setDeprecations(deps);
            toast.success(`Deprecation ${newStatus}.`);
        } catch {
            toast.error('Could not update status.');
        }
    };

    // -----------------------------------------------------------------------
    // Delete handler
    // -----------------------------------------------------------------------

    const handleDelete = async (): Promise<void> => {
        if (!deleteTarget) return;
        setSubmitting(true);
        try {
            const endpoint =
                deleteTarget.type === 'schedule'
                    ? `/api/maintenance-schedules/${deleteTarget.id}`
                    : `/api/tool-deprecations/${deleteTarget.id}`;
            await apiRequest(endpoint, { method: 'DELETE' });

            if (deleteTarget.type === 'schedule') {
                setMaintenanceRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
            } else {
                setDeprecations((prev) => prev.filter((d) => d.id !== deleteTarget.id));
            }
            toast.success(`${deleteTarget.type === 'schedule' ? 'Schedule' : 'Deprecation'} deleted.`);
            setDeleteTarget(null);
        } catch {
            toast.error('Could not delete.');
        } finally {
            setSubmitting(false);
        }
    };

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

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
                <div className="rounded-3xl bg-red-50 px-5 py-4 text-red-700 shadow-sm dark:bg-red-900/20 dark:text-red-400">{error}</div>
            )}

            {!loading && !error && (
                <div className="space-y-6">
                    {maintenanceTableMissing && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                            <p className="font-medium">Maintenance scheduling is not set up yet.</p>
                            <p className="mt-1 text-[12px]">
                                The database table for maintenance schedules is missing. Run{' '}
                                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">php artisan migrate</code> to create it and
                                enable scheduling.
                            </p>
                        </div>
                    )}

                    {/* ---- Tabs + action button ---- */}
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
                            onClick={activeTab === 'schedule' ? openCreateScheduleModal : openCreateDeprecationModal}
                            className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            {activeTab === 'schedule' ? '+ Schedule Maintenance' : '+ Schedule Deprecation'}
                        </button>
                    </div>

                    {/* ==== SCHEDULE TAB ==== */}
                    {activeTab === 'schedule' && (
                        <>
                            {/* Stats */}
                            <div className="grid gap-4 sm:grid-cols-4">
                                {(
                                    [
                                        { label: 'Scheduled', count: stats.scheduled, color: 'text-blue-600' },
                                        { label: 'In Progress', count: stats.in_progress, color: 'text-amber-600' },
                                        { label: 'Overdue', count: stats.overdue, color: 'text-rose-600' },
                                        { label: 'Completed', count: stats.completed, color: 'text-emerald-600' },
                                    ] as const
                                ).map((stat) => (
                                    <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
                                        <p className="text-[10px] font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            {stat.label}
                                        </p>
                                        <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Filters */}
                            <div className="inline-flex items-center gap-1 rounded-full bg-white px-1 py-1 text-[11px] shadow-sm dark:bg-gray-800">
                                {(['all', 'scheduled', 'in_progress', 'overdue', 'completed'] as const).map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setFilterStatus(status)}
                                        className={`rounded-full px-3 py-1 capitalize ${
                                            filterStatus === status
                                                ? 'bg-gray-900 text-white dark:bg-blue-600'
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        {status === 'all' ? 'All' : status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>

                            {/* List */}
                            <div className="space-y-3">
                                {filteredMaintenance.length === 0 ? (
                                    <EmptyState
                                        icon={<WrenchIcon className="h-10 w-10" />}
                                        title={
                                            filterStatus === 'all'
                                                ? 'No maintenance schedules yet'
                                                : `No ${filterStatus.replace('_', ' ')} schedules`
                                        }
                                        description={
                                            filterStatus === 'all'
                                                ? 'Create your first maintenance schedule to keep tools in top condition.'
                                                : 'Try changing the filter to see other schedules.'
                                        }
                                        action={
                                            filterStatus === 'all' ? { label: 'Schedule Maintenance', onClick: openCreateScheduleModal } : undefined
                                        }
                                    />
                                ) : (
                                    filteredMaintenance.map((record) => (
                                        <div key={record.id} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-700">
                                                        <WrenchIcon />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{record.toolName}</p>
                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                            {record.toolId} · Assigned to {record.assignee}
                                                        </p>
                                                        {record.notes && (
                                                            <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">{record.notes}</p>
                                                        )}
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
                                                        {record.triggerThreshold > 0 && (
                                                            <div className="mt-2">
                                                                <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                                                    <span>
                                                                        Usage: {record.usageCount}/{record.triggerThreshold}
                                                                    </span>
                                                                    <span>
                                                                        {Math.round((record.usageCount / record.triggerThreshold) * 100)}%
                                                                    </span>
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
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions column */}
                                                <div className="flex shrink-0 flex-col items-end gap-1.5">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{record.scheduledDate}</p>
                                                    <div className="flex items-center gap-2">
                                                        {record.status === 'scheduled' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleScheduleStatusChange(record.id, 'in_progress')}
                                                                className={`${ACTION_LINK} text-amber-600 dark:text-amber-400`}
                                                            >
                                                                Start
                                                            </button>
                                                        )}
                                                        {(record.status === 'in_progress' || record.status === 'overdue') && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleScheduleStatusChange(record.id, 'completed')}
                                                                className={`${ACTION_LINK} text-emerald-600 dark:text-emerald-400`}
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                        {record.status !== 'completed' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditScheduleModal(record)}
                                                                className={`${ACTION_LINK} text-blue-600 dark:text-blue-400`}
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeleteTarget({
                                                                    type: 'schedule',
                                                                    id: record.id,
                                                                    name: record.toolName,
                                                                })
                                                            }
                                                            className={`${ACTION_LINK} text-rose-600 dark:text-rose-400`}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {/* ==== DEPRECATION TAB ==== */}
                    {activeTab === 'deprecation' && (
                        <div className="space-y-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Tools scheduled for retirement</p>

                            {deprecations.length === 0 ? (
                                <EmptyState
                                    icon={
                                        <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none">
                                            <rect x="8" y="8" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
                                            <path d="M15 20h10M20 15v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    }
                                    title="No deprecation records yet"
                                    description="Schedule a tool for deprecation when it needs to be phased out or replaced."
                                    action={{ label: 'Schedule Deprecation', onClick: openCreateDeprecationModal }}
                                />
                            ) : (
                                deprecations.map((item) => (
                                    <div key={item.id} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.toolName}</p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">{item.toolId}</p>
                                                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{item.reason}</p>
                                                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                                    Retire date: {item.retireDate}
                                                    {item.replacementId && ` · Replacement: ${item.replacementId}`}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${DEPRECATION_STATUS_STYLES[item.status]}`}
                                                >
                                                    {item.status}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {item.status === 'pending' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeprecationStatusChange(item.id, 'approved')}
                                                            className={`${ACTION_LINK} text-amber-600 dark:text-amber-400`}
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {item.status === 'approved' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeprecationStatusChange(item.id, 'retired')}
                                                            className={`${ACTION_LINK} text-gray-600 dark:text-gray-400`}
                                                        >
                                                            Retire
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditDeprecationModal(item)}
                                                        className={`${ACTION_LINK} text-blue-600 dark:text-blue-400`}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteTarget({
                                                                type: 'deprecation',
                                                                id: item.id,
                                                                name: item.toolName,
                                                            })
                                                        }
                                                        className={`${ACTION_LINK} text-rose-600 dark:text-rose-400`}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ================================================================ */}
            {/* Schedule Modal (Create / Edit)                                   */}
            {/* ================================================================ */}
            <Modal show={isScheduleModalOpen} maxWidth="md" onClose={() => setIsScheduleModalOpen(false)}>
                <div className="overflow-hidden rounded-lg">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 text-white">
                        <h2 className="text-sm font-semibold">{editingScheduleId ? 'Edit Maintenance Schedule' : 'Schedule Maintenance'}</h2>
                        <p className="mt-1 text-[11px] text-blue-100">
                            {editingScheduleId
                                ? 'Update the details for this maintenance task.'
                                : 'Create a maintenance task for a tool. You can refine details later.'}
                        </p>
                    </div>
                    <form onSubmit={handleSubmitSchedule}>
                        <div className="space-y-4 bg-white px-6 py-5 dark:bg-gray-800">
                            <div>
                                <label htmlFor="scheduleTool" className={LABEL_CLS}>
                                    Tool
                                </label>
                                <select
                                    id="scheduleTool"
                                    value={scheduleToolId}
                                    onChange={(e) => setScheduleToolId(e.target.value ? Number(e.target.value) : '')}
                                    className={INPUT_CLS}
                                    required
                                >
                                    <option value="">Select a tool…</option>
                                    {tools.map((tool) => (
                                        <option key={tool.id} value={tool.id}>
                                            {tool.name} (TL-{tool.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="maintenanceType" className={LABEL_CLS}>
                                        Type
                                    </label>
                                    <select
                                        id="maintenanceType"
                                        value={scheduleType}
                                        onChange={(e) => setScheduleType(e.target.value as MaintenanceType)}
                                        className={INPUT_CLS}
                                    >
                                        <option value="routine">Routine</option>
                                        <option value="repair">Repair</option>
                                        <option value="inspection">Inspection</option>
                                        <option value="calibration">Calibration</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="scheduledDate" className={LABEL_CLS}>
                                        Scheduled date
                                    </label>
                                    <input
                                        id="scheduledDate"
                                        type="date"
                                        value={scheduleDate}
                                        onChange={(e) => setScheduleDate(e.target.value)}
                                        className={INPUT_CLS}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="assignee" className={LABEL_CLS}>
                                    Assignee
                                </label>
                                <input
                                    id="assignee"
                                    type="text"
                                    value={scheduleAssignee}
                                    onChange={(e) => setScheduleAssignee(e.target.value)}
                                    className={INPUT_CLS}
                                    placeholder="e.g. Tech Team"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="notes" className={LABEL_CLS}>
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    value={scheduleNotes}
                                    onChange={(e) => setScheduleNotes(e.target.value)}
                                    className={INPUT_CLS}
                                    placeholder="What needs to be checked or fixed?"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800/50">
                            <button
                                type="button"
                                onClick={() => setIsScheduleModalOpen(false)}
                                className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? 'Saving…' : editingScheduleId ? 'Save Changes' : 'Schedule'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ================================================================ */}
            {/* Deprecation Modal (Create / Edit)                                */}
            {/* ================================================================ */}
            <Modal show={isDeprecationModalOpen} maxWidth="md" onClose={() => setIsDeprecationModalOpen(false)}>
                <div className="overflow-hidden rounded-lg">
                    <div className="bg-gradient-to-r from-rose-700 to-rose-500 px-6 py-4 text-white">
                        <h2 className="text-sm font-semibold">{editingDeprecationId ? 'Edit Deprecation' : 'Schedule Deprecation'}</h2>
                        <p className="mt-1 text-[11px] text-rose-100">
                            {editingDeprecationId
                                ? 'Update the deprecation details for this tool.'
                                : 'Mark a tool for retirement and optionally assign a replacement.'}
                        </p>
                    </div>
                    <form onSubmit={handleSubmitDeprecation}>
                        <div className="space-y-4 bg-white px-6 py-5 dark:bg-gray-800">
                            <div>
                                <label htmlFor="deprecationTool" className={LABEL_CLS}>
                                    Tool
                                </label>
                                <select
                                    id="deprecationTool"
                                    value={deprecationToolId}
                                    onChange={(e) => setDeprecationToolId(e.target.value ? Number(e.target.value) : '')}
                                    className={INPUT_CLS}
                                    required
                                >
                                    <option value="">Select a tool…</option>
                                    {tools.map((tool) => (
                                        <option key={tool.id} value={tool.id}>
                                            {tool.name} (TL-{tool.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="deprecationReason" className={LABEL_CLS}>
                                    Reason
                                </label>
                                <textarea
                                    id="deprecationReason"
                                    rows={2}
                                    value={deprecationReason}
                                    onChange={(e) => setDeprecationReason(e.target.value)}
                                    className={INPUT_CLS}
                                    placeholder="Why is this tool being deprecated?"
                                    required
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="retireDate" className={LABEL_CLS}>
                                        Retire date
                                    </label>
                                    <input
                                        id="retireDate"
                                        type="date"
                                        value={deprecationRetireDate}
                                        onChange={(e) => setDeprecationRetireDate(e.target.value)}
                                        className={INPUT_CLS}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="replacementTool" className={LABEL_CLS}>
                                        Replacement tool (optional)
                                    </label>
                                    <select
                                        id="replacementTool"
                                        value={deprecationReplacementId}
                                        onChange={(e) => setDeprecationReplacementId(e.target.value ? Number(e.target.value) : '')}
                                        className={INPUT_CLS}
                                    >
                                        <option value="">None</option>
                                        {tools
                                            .filter((t) => t.id !== deprecationToolId)
                                            .map((tool) => (
                                                <option key={tool.id} value={tool.id}>
                                                    {tool.name} (TL-{tool.id})
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800/50">
                            <button
                                type="button"
                                onClick={() => setIsDeprecationModalOpen(false)}
                                className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-full bg-rose-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                                {submitting ? 'Saving…' : editingDeprecationId ? 'Save Changes' : 'Schedule'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ================================================================ */}
            {/* Delete Confirmation Modal                                        */}
            {/* ================================================================ */}
            <Modal show={deleteTarget !== null} maxWidth="sm" onClose={() => setDeleteTarget(null)}>
                <div className="p-6 dark:bg-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Delete {deleteTarget?.type === 'schedule' ? 'Maintenance Schedule' : 'Deprecation'}
                    </h3>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        Are you sure you want to delete the {deleteTarget?.type === 'schedule' ? 'maintenance schedule' : 'deprecation record'} for{' '}
                        <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={handleDelete}
                            className="rounded-full bg-rose-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                            {submitting ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
