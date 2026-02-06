import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Breadcrumb } from '@/Components/Breadcrumb';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import { exportToCSV, exportToPDF } from '@/utils/exportUtils';

type ReportType = 'borrowing_summary' | 'tool_utilization' | 'user_activity' | 'overdue_report' | 'maintenance_log' | 'custom';

type SavedReport = {
    id: number;
    name: string;
    type: ReportType;
    schedule?: string;
    lastGenerated?: string;
    columns: string[];
};

type ReportField = {
    key: string;
    label: string;
    category: string;
};

const AVAILABLE_FIELDS: ReportField[] = [
    { key: 'tool_name', label: 'Tool Name', category: 'Tool' },
    { key: 'tool_id', label: 'Tool ID', category: 'Tool' },
    { key: 'category', label: 'Category', category: 'Tool' },
    { key: 'status', label: 'Status', category: 'Tool' },
    { key: 'condition', label: 'Condition', category: 'Tool' },
    { key: 'borrower_name', label: 'Borrower Name', category: 'User' },
    { key: 'borrower_email', label: 'Borrower Email', category: 'User' },
    { key: 'department', label: 'Department', category: 'User' },
    { key: 'borrow_date', label: 'Borrow Date', category: 'Borrowing' },
    { key: 'return_date', label: 'Return Date', category: 'Borrowing' },
    { key: 'duration', label: 'Duration (Days)', category: 'Borrowing' },
    { key: 'borrow_status', label: 'Borrowing Status', category: 'Borrowing' },
    { key: 'overdue_days', label: 'Overdue Days', category: 'Borrowing' },
    { key: 'maintenance_date', label: 'Maintenance Date', category: 'Maintenance' },
    { key: 'maintenance_type', label: 'Maintenance Type', category: 'Maintenance' },
    { key: 'usage_count', label: 'Usage Count', category: 'Analytics' },
    { key: 'utilization_rate', label: 'Utilization Rate', category: 'Analytics' },
];

const PRESET_REPORTS: SavedReport[] = [
    {
        id: 1,
        name: 'Monthly Borrowing Summary',
        type: 'borrowing_summary',
        schedule: 'Monthly',
        lastGenerated: 'Feb 1, 2026',
        columns: ['tool_name', 'borrower_name', 'borrow_date', 'return_date', 'borrow_status'],
    },
    {
        id: 2,
        name: 'Tool Utilization Report',
        type: 'tool_utilization',
        schedule: 'Weekly',
        lastGenerated: 'Feb 3, 2026',
        columns: ['tool_name', 'category', 'usage_count', 'utilization_rate', 'condition'],
    },
    {
        id: 3,
        name: 'Overdue Items Report',
        type: 'overdue_report',
        lastGenerated: 'Feb 6, 2026',
        columns: ['tool_name', 'borrower_name', 'borrower_email', 'borrow_date', 'overdue_days'],
    },
    {
        id: 4,
        name: 'User Activity Report',
        type: 'user_activity',
        schedule: 'Monthly',
        lastGenerated: 'Feb 1, 2026',
        columns: ['borrower_name', 'department', 'tool_name', 'borrow_date', 'duration'],
    },
];

const MOCK_REPORT_DATA = [
    {
        tool_name: 'MacBook Pro',
        tool_id: 'LP-0001',
        category: 'Laptops',
        borrower_name: 'Jane Doe',
        borrow_date: '2026-01-15',
        return_date: '2026-01-22',
        duration: '7',
        borrow_status: 'Returned',
        overdue_days: '0',
        usage_count: '24',
        utilization_rate: '80%',
        condition: 'Excellent',
    },
    {
        tool_name: 'Oscilloscope',
        tool_id: 'EL-0003',
        category: 'Electronics',
        borrower_name: 'John Smith',
        borrow_date: '2026-01-20',
        return_date: '2026-02-01',
        duration: '12',
        borrow_status: 'Returned',
        overdue_days: '2',
        usage_count: '38',
        utilization_rate: '63%',
        condition: 'Good',
    },
    {
        tool_name: 'Canon EOS R6',
        tool_id: 'CM-0001',
        category: 'Cameras',
        borrower_name: 'Alice Johnson',
        borrow_date: '2026-02-01',
        return_date: '',
        duration: '5',
        borrow_status: 'Active',
        overdue_days: '0',
        usage_count: '15',
        utilization_rate: '25%',
        condition: 'Fair',
    },
];

export default function IndexPage() {
    const [activeTab, setActiveTab] = useState<'saved' | 'builder'>('saved');
    const [selectedFields, setSelectedFields] = useState<string[]>(['tool_name', 'borrower_name', 'borrow_date', 'borrow_status']);
    const [reportName, setReportName] = useState('');
    const [schedule, setSchedule] = useState('none');

    const toggleField = (key: string) => {
        setSelectedFields((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));
    };

    const handleExportCSV = (columns: string[]) => {
        const cols = columns.map((key) => {
            const field = AVAILABLE_FIELDS.find((f) => f.key === key);
            return { key, label: field?.label ?? key };
        });
        exportToCSV(MOCK_REPORT_DATA, 'report', cols);
        toast.success('CSV exported successfully');
    };

    const handleExportPDF = async (columns: string[]) => {
        const cols = columns.map((key) => {
            const field = AVAILABLE_FIELDS.find((f) => f.key === key);
            return { key, label: field?.label ?? key };
        });
        await exportToPDF(MOCK_REPORT_DATA, 'report', 'ToolSync Report', cols);
        toast.success('PDF exported successfully');
    };

    const categories = [...new Set(AVAILABLE_FIELDS.map((f) => f.category))];

    return (
        <AppLayout
            activeRoute="admin-reports"
            variant="admin"
            header={
                <>
                    <Breadcrumb className="mb-2">
                        <Breadcrumb.Home href="/admin/dashboard" />
                        <Breadcrumb.Item isCurrent>Reports</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Report Builder</h1>
                </>
            }
        >
            <Head title="Reports" />

            <div className="space-y-6">
                <div className="inline-flex items-center gap-1 rounded-full bg-white px-1 py-1 text-[11px] shadow-sm dark:bg-gray-800">
                    <button
                        type="button"
                        onClick={() => setActiveTab('saved')}
                        className={`rounded-full px-4 py-1.5 font-medium ${activeTab === 'saved' ? 'bg-gray-900 text-white dark:bg-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                        Saved Reports
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('builder')}
                        className={`rounded-full px-4 py-1.5 font-medium ${activeTab === 'builder' ? 'bg-gray-900 text-white dark:bg-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                        Report Builder
                    </button>
                </div>

                {activeTab === 'saved' && (
                    <div className="space-y-3">
                        {PRESET_REPORTS.map((report) => (
                            <div key={report.id} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{report.name}</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                            {report.columns.length} columns · Last generated: {report.lastGenerated}
                                        </p>
                                        {report.schedule && (
                                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                                                    <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1" />
                                                    <path d="M6 4V6L7.5 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                                                </svg>
                                                {report.schedule}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleExportCSV(report.columns)}
                                            className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                                        >
                                            CSV
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleExportPDF(report.columns)}
                                            className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                                        >
                                            PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'builder' && (
                    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                        {/* Field Selection */}
                        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
                            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Select Fields</h3>
                            <p className="mb-4 text-[11px] text-gray-500 dark:text-gray-400">Choose which columns to include in your report</p>

                            {categories.map((category) => (
                                <div key={category} className="mb-4">
                                    <h4 className="mb-2 text-[10px] font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                        {category}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {AVAILABLE_FIELDS.filter((f) => f.category === category).map((field) => (
                                            <button
                                                key={field.key}
                                                type="button"
                                                onClick={() => toggleField(field.key)}
                                                className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                                                    selectedFields.includes(field.key)
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                {field.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Report Config */}
                        <div className="space-y-4">
                            <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-gray-800">
                                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Report Configuration</h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Report Name</label>
                                        <input
                                            type="text"
                                            value={reportName}
                                            onChange={(e) => setReportName(e.target.value)}
                                            placeholder="My Custom Report"
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Schedule</label>
                                        <select
                                            value={schedule}
                                            onChange={(e) => setSchedule(e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="none">No schedule</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Selected Fields ({selectedFields.length})
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {selectedFields.map((key) => {
                                                const field = AVAILABLE_FIELDS.find((f) => f.key === key);
                                                return (
                                                    <span
                                                        key={key}
                                                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                    >
                                                        {field?.label ?? key}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleField(key)}
                                                            className="ml-0.5 text-blue-400 hover:text-blue-600"
                                                        >
                                                            &times;
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => handleExportCSV(selectedFields)}
                                    className="w-full rounded-full bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                                >
                                    Generate CSV
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExportPDF(selectedFields)}
                                    className="w-full rounded-full border border-gray-200 bg-white py-2.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                >
                                    Generate PDF
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toast.success('Report saved')}
                                    className="w-full rounded-full border border-gray-200 bg-white py-2.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                >
                                    Save Report Template
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
