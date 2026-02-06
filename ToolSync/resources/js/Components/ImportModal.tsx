import { useState, useRef } from 'react';
import Modal from '@/Components/Modal';
import { toast } from '@/Components/Toast';
import { parseCSV } from '@/utils/exportUtils';

type ImportModalProps = {
    show: boolean;
    onClose: () => void;
    onImport: (data: Record<string, string>[]) => void;
    entityName: string;
    requiredColumns: string[];
    templateColumns: { key: string; label: string }[];
};

export function ImportModal({ show, onClose, onImport, entityName, requiredColumns, templateColumns }: ImportModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<Record<string, string>[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const data = parseCSV(text);

            if (data.length === 0) {
                setError('No data found in CSV file');
                setPreview(null);
                return;
            }

            const headers = Object.keys(data[0]);
            const missingColumns = requiredColumns.filter((col) => !headers.includes(col));
            if (missingColumns.length > 0) {
                setError(`Missing required columns: ${missingColumns.join(', ')}`);
                setPreview(null);
                return;
            }

            setPreview(data.slice(0, 5));
        };
        reader.readAsText(file);
    };

    const handleImport = () => {
        if (!preview) return;

        // Re-read the full file
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const data = parseCSV(text);
            onImport(data);
            toast.success(`${data.length} ${entityName}(s) imported successfully`);
            handleClose();
        };
        reader.readAsText(file);
    };

    const handleClose = () => {
        setPreview(null);
        setError(null);
        setFileName('');
        onClose();
    };

    const handleDownloadTemplate = () => {
        const headers = templateColumns.map((c) => c.label).join(',');
        const blob = new Blob([headers + '\n'], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${entityName}-import-template.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Import {entityName}s</h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Upload a CSV file to bulk import {entityName}s</p>

                <div className="mt-4">
                    <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M8 2V10M8 10L5 7M8 10L11 7"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M2 12V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                        Download Template CSV
                    </button>
                </div>

                <div className="mt-4">
                    <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 transition-colors hover:border-blue-400 dark:border-gray-600">
                        <svg className="h-10 w-10 text-gray-400" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M20 8V24M20 8L14 14M20 8L26 14"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M6 28V32C6 33.1046 6.89543 34 8 34H32C33.1046 34 34 33.1046 34 32V28"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{fileName || 'Click to upload or drag and drop'}</p>
                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">CSV files only</p>
                        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>

                {error && (
                    <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">{error}</div>
                )}

                {preview && (
                    <div className="mt-4">
                        <p className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Preview (first 5 rows):</p>
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-left text-[11px]">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        {Object.keys(preview[0]).map((key) => (
                                            <th key={key} className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-300">
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row, i) => (
                                        <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                                            {Object.values(row).map((value, j) => (
                                                <td key={j} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                                                    {value}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleImport}
                        disabled={!preview}
                        className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                        Import {preview ? `(${preview.length}+ rows)` : ''}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
