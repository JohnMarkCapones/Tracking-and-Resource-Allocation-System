import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Breadcrumb } from '@/Components/Breadcrumb';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';

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

const MOCK_MAINTENANCE: MaintenanceRecord[] = [
    {
        id: 1,
        toolName: 'Canon EOS R6',
        toolId: 'CM-0001',
        type: 'repair',
        scheduledDate: '2026-02-08',
        assignee: 'Tech Team',
        status: 'in_progress',
        notes: 'Sensor cleaning required',
        usageCount: 45,
        triggerThreshold: 50,
    },
    {
        id: 2,
        toolName: '3D Printer',
        toolId: 'PR-0010',
        type: 'routine',
        scheduledDate: '2026-02-15',
        assignee: 'Lab Admin',
        status: 'scheduled',
        notes: 'Monthly nozzle and bed check',
        usageCount: 28,
        triggerThreshold: 30,
    },
    {
        id: 3,
        toolName: 'Oscilloscope',
        toolId: 'EL-0003',
        type: 'calibration',
        scheduledDate: '2026-02-01',
        assignee: 'QA Team',
        status: 'overdue',
        notes: 'Annual calibration due',
        usageCount: 55,
        triggerThreshold: 50,
    },
    {
        id: 4,
        toolName: 'Multimeter',
        toolId: 'EL-0001',
        type: 'inspection',
        scheduledDate: '2026-01-28',
        completedDate: '2026-01-28',
        assignee: 'Tech Team',
        status: 'completed',
        notes: 'All readings accurate',
        usageCount: 38,
        triggerThreshold: 50,
    },
    {
        id: 5,
        toolName: 'Drill Press',
        toolId: 'ME-0001',
        type: 'routine',
        scheduledDate: '2026-02-20',
        assignee: 'Shop Manager',
        status: 'scheduled',
        notes: 'Belt and blade inspection',
        usageCount: 12,
        triggerThreshold: 25,
    },
];

type DeprecationItem = {
    id: number;
    toolName: string;
    toolId: string;
    reason: string;
    retireDate: string;
    replacementId?: string;
    status: 'pending' | 'approved' | 'retired';
};

const MOCK_DEPRECATIONS: DeprecationItem[] = [
    {
        id: 1,
        toolName: 'Old Oscilloscope',
        toolId: 'OS-0001',
        reason: 'End of life - no parts available',
        retireDate: '2026-03-01',
        replacementId: 'EL-0003',
        status: 'approved',
    },
    { id: 2, toolName: 'Legacy Multimeter', toolId: 'EL-0099', reason: 'Accuracy below standards', retireDate: '2026-04-15', status: 'pending' },
];

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

export default function IndexPage() {
    const [activeTab, setActiveTab] = useState<'schedule' | 'deprecation'>('schedule');
    const [filterStatus, setFilterStatus] = useState<'all' | MaintenanceStatus>('all');

    const filteredMaintenance = filterStatus === 'all' ? MOCK_MAINTENANCE : MOCK_MAINTENANCE.filter((m) => m.status === filterStatus);

    const handleComplete = () => {
        toast.success('Maintenance marked as completed');
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
                                    count: MOCK_MAINTENANCE.filter((m) => m.status === 'scheduled').length,
                                    color: 'text-blue-600',
                                },
                                {
                                    label: 'In Progress',
                                    count: MOCK_MAINTENANCE.filter((m) => m.status === 'in_progress').length,
                                    color: 'text-amber-600',
                                },
                                { label: 'Overdue', count: MOCK_MAINTENANCE.filter((m) => m.status === 'overdue').length, color: 'text-rose-600' },
                                {
                                    label: 'Completed',
                                    count: MOCK_MAINTENANCE.filter((m) => m.status === 'completed').length,
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
                        {MOCK_DEPRECATIONS.map((item) => (
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
        </AppLayout>
    );
}
