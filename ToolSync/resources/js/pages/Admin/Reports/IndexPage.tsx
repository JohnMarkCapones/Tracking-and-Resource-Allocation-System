import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/Components/Breadcrumb';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import type { ReportDataApiResponse, ReportType } from '@/lib/apiTypes';
import { apiRequest } from '@/lib/http';
import { exportToCSV, exportToPDF } from '@/utils/exportUtils';

type SavedReport = {
    id: number;
    name: string;
    type: ReportType;
    schedule?: string;
    lastGenerated?: string;
    columns: string[];
    isPreset?: boolean;
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
        id: -1,
        name: 'Monthly Borrowing Summary',
        type: 'borrowing_summary',
        schedule: 'Monthly',
        lastGenerated: 'Feb 1, 2026',
        columns: ['tool_name', 'borrower_name', 'borrow_date', 'return_date', 'borrow_status'],
    },
    {
        id: -2,
        name: 'Tool Utilization Report',
        type: 'tool_utilization',
        schedule: 'Weekly',
        lastGenerated: 'Feb 3, 2026',
        columns: ['tool_name', 'category', 'usage_count', 'utilization_rate', 'condition'],
    },
    {
        id: -3,
        name: 'Overdue Items Report',
        type: 'overdue_report',
        lastGenerated: 'Feb 6, 2026',
        columns: ['tool_name', 'borrower_name', 'borrower_email', 'borrow_date', 'overdue_days'],
    },
    {
        id: -4,
        name: 'User Activity Report',
        type: 'user_activity',
        schedule: 'Monthly',
        lastGenerated: 'Feb 1, 2026',
        columns: ['borrower_name', 'department', 'tool_name', 'borrow_date', 'duration'],
    },
];

type BackendSavedReport = {
    id: number;
    name: string;
    report_type: ReportType;
    schedule?: string | null;
    last_generated_at?: string | null;
    columns: string[];
};

const formatDisplayDate = (iso: string): string =>
    new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const normalizeBackendReport = (report: BackendSavedReport): SavedReport => ({
    id: report.id,
    name: report.name,
    type: report.report_type,
    schedule: report.schedule ?? undefined,
    lastGenerated: report.last_generated_at ? formatDisplayDate(report.last_generated_at) : undefined,
    columns: report.columns,
});

export default function IndexPage() {
    const [activeTab, setActiveTab] = useState<'saved' | 'builder'>('saved');
    const [savedReports, setSavedReports] = useState<SavedReport[]>(PRESET_REPORTS);
    const [selectedFields, setSelectedFields] = useState<string[]>(['tool_name', 'borrower_name', 'borrow_date', 'borrow_status']);
    const [reportType, setReportType] = useState<ReportType>('borrowing_summary');
    const [reportName, setReportName] = useState('');
    const [schedule, setSchedule] = useState('none');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadTemplates = async () => {
            try {
                const response = await apiRequest<{ data: BackendSavedReport[] }>('/api/report-templates');
                const templates = response.data.map(normalizeBackendReport);
                if (!isMounted) return;
                setSavedReports((prev) => [...templates, ...prev]);
            } catch (error) {
                console.error(error);
            }
        };

        void loadTemplates();

        return () => {
            isMounted = false;
        };
    }, []);

    const toggleField = (key: string) => {
        setSelectedFields((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));
    };

    const getColumnDefinitions = (columns: string[]) =>
        columns.map((key) => {
            const field = AVAILABLE_FIELDS.find((f) => f.key === key);
            return { key, label: field?.label ?? key };
        });

    const fetchReportData = async (type: ReportType, columns: string[]) => {
        const response = await apiRequest<ReportDataApiResponse>('/api/reports/data', {
            method: 'POST',
            body: {
                report_type: type,
                columns,
                from: fromDate || undefined,
                to: toDate || undefined,
                limit: 1000,
            },
        });

        return response.data;
    };

    const sanitizeFileName = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const scheduleLabel = (value: string) => (value === 'none' ? undefined : value.charAt(0).toUpperCase() + value.slice(1));

    const stampLastGenerated = async (report: SavedReport) => {
        const iso = new Date().toISOString();
        const display = formatDisplayDate(iso);

        setSavedReports((prev) =>
            prev.map((item) => (item.id === report.id ? { ...item, lastGenerated: display } : item)),
        );

        if (report.isPreset) {
            return;
        }

        try {
            await apiRequest<{ data: BackendSavedReport }>(`/api/report-templates/${report.id}`, {
                method: 'PATCH',
                body: {
                    last_generated_at: iso,
                },
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to update last generated timestamp for this template');
        }
    };

    const handleSaveReportTemplate = async () => {
        if (!reportName.trim()) {
            toast.error('Enter a report name before saving');
            return;
        }

        if (selectedFields.length === 0) {
            toast.error('Select at least one field before saving');
            return;
        }

        try {
            const response = await apiRequest<{ data: BackendSavedReport }>('/api/report-templates', {
                method: 'POST',
                body: {
                    name: reportName.trim(),
                    report_type: reportType,
                    schedule: scheduleLabel(schedule),
                    columns: selectedFields,
                },
            });

            const saved = normalizeBackendReport(response.data);
            setSavedReports((prev) => [saved, ...prev]);
            setActiveTab('saved');
            toast.success('Report template saved');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save report template');
        }
    };

    const handleExportCSV = async (columns: string[], type: ReportType, filenameBase: string, template?: SavedReport) => {
        if (columns.length === 0) {
            toast.error('Select at least one field before exporting');
            return;
        }

        setIsExporting(true);
        try {
            const data = await fetchReportData(type, columns);
            if (data.length === 0) {
                toast.error('No report data found for the selected filters');
                return;
            }

            exportToCSV(data, sanitizeFileName(filenameBase) || 'report', getColumnDefinitions(columns));
            toast.success('CSV exported successfully');
            if (template) {
                await stampLastGenerated(template);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate CSV report');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportPDF = async (
        columns: string[],
        type: ReportType,
        filenameBase: string,
        title: string,
        template?: SavedReport,
    ) => {
        if (columns.length === 0) {
            toast.error('Select at least one field before exporting');
            return;
        }

        setIsExporting(true);
        try {
            const data = await fetchReportData(type, columns);
            if (data.length === 0) {
                toast.error('No report data found for the selected filters');
                return;
            }

            await exportToPDF(data, sanitizeFileName(filenameBase) || 'report', title, getColumnDefinitions(columns));
            toast.success('PDF exported successfully');
            if (template) {
                await stampLastGenerated(template);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate PDF report');
        } finally {
            setIsExporting(false);
        }
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
                        {savedReports.map((report) => (
                            <div key={report.id} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{report.name}</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                            {report.columns.length} columns · Last generated: {report.lastGenerated ?? 'Never'}
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
                                            onClick={() => void handleExportCSV(report.columns, report.type, report.name, report)}
                                            disabled={isExporting}
                                            className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                                        >
                                            CSV
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleExportPDF(
                                                    report.columns,
                                                    report.type,
                                                    report.name,
                                                    `${report.name} - EquipIT`,
                                                    report,
                                                )
                                            }
                                            disabled={isExporting}
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
                                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Report Type</label>
                                        <select
                                            value={reportType}
                                            onChange={(e) => setReportType(e.target.value as ReportType)}
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="borrowing_summary">Borrowing Summary</option>
                                            <option value="tool_utilization">Tool Utilization</option>
                                            <option value="user_activity">User Activity</option>
                                            <option value="overdue_report">Overdue Report</option>
                                            <option value="maintenance_log">Maintenance Log</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                                        <div className="mt-1 grid grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                value={fromDate}
                                                onChange={(e) => setFromDate(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                            <input
                                                type="date"
                                                value={toDate}
                                                onChange={(e) => setToDate(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
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
                                    onClick={() =>
                                        void handleExportCSV(
                                            selectedFields,
                                            reportType,
                                            reportName || `${reportType}_report`,
                                        )
                                    }
                                    disabled={isExporting}
                                    className="w-full rounded-full bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                                >
                                    {isExporting ? 'Generating...' : 'Generate CSV'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        void handleExportPDF(
                                            selectedFields,
                                            reportType,
                                            reportName || `${reportType}_report`,
                                            reportName || 'EquipIT Report',
                                        )
                                    }
                                    disabled={isExporting}
                                    className="w-full rounded-full border border-gray-200 bg-white py-2.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                >
                                    {isExporting ? 'Generating...' : 'Generate PDF'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveReportTemplate}
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
