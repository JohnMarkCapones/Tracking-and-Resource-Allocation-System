import { useState, useEffect } from 'react';
import type { Tool, ToolStatus } from '@/Components/Admin/ToolTable';
import Modal from '@/Components/Modal';

const DEFAULT_CATEGORIES = ['IT Equipment', 'Office Equipment', 'Multimedia'];

type CreateEditModalProps = {
    show: boolean;
    tool: Tool | null;
    categories?: string[];
    onClose: () => void;
    onSave: (data: ToolFormData) => void;
};

export type ToolFormData = {
    name: string;
    toolId: string;
    category: string;
    status: ToolStatus;
    quantity: number;
    condition: string;
    description: string;
    specifications: Record<string, string>;
    displayImage?: File | null;
};

/** Single row in the dynamic specifications list (id for React keys). */
type SpecRow = { id: string; label: string; value: string };

function nextSpecId(): string {
    return `spec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const STATUSES: ToolStatus[] = ['Available', 'Borrowed', 'Maintenance'];

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged', 'Functional'];

export function CreateEditModal({ show, tool, categories = DEFAULT_CATEGORIES, onClose, onSave }: CreateEditModalProps) {
    const isEditing = tool !== null;
    const categoryOptions = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

    const [formData, setFormData] = useState<ToolFormData>({
        name: '',
        toolId: '',
        category: categoryOptions[0],
        status: 'Available',
        quantity: 1,
        condition: 'Good',
        description: '',
        specifications: {},
    });

    /** Dynamic spec rows for the UI; id used for React keys. */
    const [specRows, setSpecRows] = useState<SpecRow[]>([]);
    const [displayImageFile, setDisplayImageFile] = useState<File | null>(null);
    const [displayImagePreview, setDisplayImagePreview] = useState<string | null>(null);

    const [errors, setErrors] = useState<Partial<Record<keyof ToolFormData, string>>>({});

    // Sync form when modal opens or when editing a different tool. Only depend on tool so we
    // don't overwrite user input when they change Tool ID or Condition (avoid show in deps).
    useEffect(() => {
        if (!show) return;

        if (tool) {
            const quantity = Number(tool.quantity);
            setFormData({
                name: tool.name,
                toolId: tool.toolId,
                category: tool.category,
                status: tool.status,
                quantity: Number.isFinite(quantity) && quantity >= 1 ? quantity : 1,
                condition: tool.condition,
                description: tool.description ?? '',
                specifications: tool.specifications ?? {},
            });
            const specs = tool.specifications ?? {};
            setSpecRows(
                Object.keys(specs).length > 0
                    ? Object.entries(specs).map(([label, value]) => ({ id: nextSpecId(), label, value }))
                    : [],
            );
        } else {
            setFormData({
                name: '',
                toolId: '',
                category: categoryOptions[0],
                status: 'Available',
                quantity: 1,
                condition: 'Good',
                description: '',
                specifications: {},
            });
            setSpecRows([]);
        }
        setErrors({});
        setDisplayImageFile(null);
        setDisplayImagePreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
    }, [show, tool]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ToolFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tool name is required';
        }

        if (!formData.toolId.trim()) {
            newErrors.toolId = 'Tool ID is required';
        }
        const quantityNum = Number(formData.quantity);
        if (!Number.isFinite(quantityNum) || quantityNum < 1) {
            newErrors.quantity = 'Quantity must be at least 1';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validate()) {
            const specifications: Record<string, string> = {};
            for (const row of specRows) {
                const label = row.label.trim();
                if (label) specifications[label] = row.value.trim();
            }
            onSave({
                ...formData,
                description: formData.description.trim(),
                specifications,
                displayImage: displayImageFile,
            });
        }
    };

    const addSpecRow = () => setSpecRows((prev) => [...prev, { id: nextSpecId(), label: '', value: '' }]);

    const updateSpecRow = (id: string, field: 'label' | 'value', value: string) => {
        setSpecRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    };

    const removeSpecRow = (id: string) => {
        setSpecRows((prev) => prev.filter((row) => row.id !== id));
    };

    const handleDisplayImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setDisplayImageFile(file);
        setDisplayImagePreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return file ? URL.createObjectURL(file) : null;
        });
    };

    return (
        <Modal show={show} maxWidth="xl" onClose={onClose}>
            <div className="overflow-hidden rounded-lg">
                <div className="bg-gradient-to-r from-slate-900 to-blue-600 px-6 py-4 text-white">
                    <h2 className="text-sm font-semibold">{isEditing ? 'Edit Tool' : 'Add New Tool'}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 bg-white px-6 py-5">
                        <div>
                            <label htmlFor="name" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                Tool Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.name ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-gray-50'
                                }`}
                                placeholder="e.g., MacBook Pro 14"
                            />
                            {errors.name && <p className="mt-1 text-[11px] text-rose-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="toolId" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                Tool ID
                            </label>
                            <input
                                type="text"
                                id="toolId"
                                value={formData.toolId}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        toolId: e.target.value,
                                    }))
                                }
                                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.toolId ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-gray-50'
                                }`}
                                placeholder="e.g., LP-0001"
                            />
                            {errors.toolId && <p className="mt-1 text-[11px] text-rose-600">{errors.toolId}</p>}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label htmlFor="category" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            category: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {categoryOptions.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="status" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            status: e.target.value as ToolStatus,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="quantity" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    min={1}
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            quantity: Math.max(1, Number.parseInt(e.target.value || '1', 10) || 1),
                                        }))
                                    }
                                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.quantity ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-gray-50'
                                    }`}
                                    placeholder="e.g., 10"
                                />
                                {errors.quantity && <p className="mt-1 text-[11px] text-rose-600">{errors.quantity}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="condition" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                Condition
                            </label>
                            <select
                                id="condition"
                                value={formData.condition}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        condition: e.target.value,
                                    }))
                                }
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {CONDITIONS.map((cond) => (
                                    <option key={cond} value={cond}>
                                        {cond}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="description" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., A powerful laptop for professionals. Features the M2 Pro chip..."
                            />
                        </div>

                        <div>
                            <label htmlFor="displayImage" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                Display Image
                            </label>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                                    {displayImagePreview ? (
                                        <img src={displayImagePreview} alt="Tool preview" className="h-full w-full rounded-xl object-cover" />
                                    ) : (
                                        <span className="text-[10px] text-gray-400">No image</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="displayImage"
                                        accept="image/*"
                                        onChange={handleDisplayImageChange}
                                        className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-1.5 file:text-[11px] file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <p className="mt-1 text-[11px] text-gray-500">PNG or JPG recommended. Max 2MB.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                    Specifications
                                </label>
                                <button
                                    type="button"
                                    onClick={addSpecRow}
                                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
                                >
                                    + Add specification
                                </button>
                            </div>
                            <p className="mb-2 text-[11px] text-gray-500">
                                Add key-value pairs (e.g. Processor, Memory, Storage). These appear on the tool detail page.
                            </p>
                            {specRows.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-4 text-center text-[11px] text-gray-500">
                                    No specifications added. Click &quot;Add specification&quot; to add one.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {specRows.map((row) => (
                                        <div key={row.id} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={row.label}
                                                onChange={(e) => updateSpecRow(row.id, 'label', e.target.value)}
                                                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Label (e.g. Processor)"
                                            />
                                            <input
                                                type="text"
                                                value={row.value}
                                                onChange={(e) => updateSpecRow(row.id, 'value', e.target.value)}
                                                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Value (e.g. Apple M2 Pro)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSpecRow(row.id)}
                                                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 hover:border-rose-400"
                                                title="Delete this specification row"
                                            >
                                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                                    <path
                                                        d="M4 6h12v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM7 6V4a2 2 0 012-2h2a2 2 0 012 2v2M3 6h14"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700">
                            {isEditing ? 'Save Changes' : 'Add Tool'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
