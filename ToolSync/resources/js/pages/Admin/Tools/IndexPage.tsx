import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ToolTable, type Tool } from '@/Components/Admin/ToolTable';
import { EmptyState } from '@/Components/EmptyState';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import { CreateEditModal, type ToolFormData } from './CreateEditModal';

type AdminToolsPageProps = {
    tools: Tool[];
};

export default function IndexPage() {
    const { tools: initialTools } = usePage<AdminToolsPageProps>().props;

    const [tools, setTools] = useState<Tool[]>(initialTools);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTool, setEditingTool] = useState<Tool | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Tool | null>(null);

    const handleEdit = (tool: Tool) => {
        setEditingTool(tool);
        setIsModalOpen(true);
    };

    const handleDelete = (tool: Tool) => {
        setDeleteConfirm(tool);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            setTools((prev) => prev.filter((t) => t.id !== deleteConfirm.id));
            setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirm.id));
            toast.success(`${deleteConfirm.name} has been deleted`);
            setDeleteConfirm(null);
        }
    };

    const handleSave = (data: ToolFormData) => {
        if (editingTool) {
            setTools((prev) => prev.map((tool) => (tool.id === editingTool.id ? { ...tool, ...data } : tool)));
            toast.success(`${data.name} has been updated`);
        } else {
            const newTool: Tool = {
                id: Math.max(...tools.map((t) => t.id), 0) + 1,
                ...data,
                lastMaintenance: 'N/A',
                totalBorrowings: 0,
            };
            setTools((prev) => [...prev, newTool]);
            toast.success(`${data.name} has been added`);
        }

        setIsModalOpen(false);
        setEditingTool(null);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        setTools((prev) => prev.filter((tool) => !selectedIds.includes(tool.id)));
        toast.success(`${selectedIds.length} tools have been deleted`);
        setSelectedIds([]);
    };

    const handleBulkMaintenance = () => {
        if (selectedIds.length === 0) return;

        setTools((prev) => prev.map((tool) => (selectedIds.includes(tool.id) ? { ...tool, status: 'Maintenance' as const } : tool)));
        toast.success(`${selectedIds.length} tools marked for maintenance`);
        setSelectedIds([]);
    };

    return (
        <AppLayout
            variant="admin"
            activeRoute="admin-tools"
            header={
                <>
                    <p className="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">Tool management</p>
                    <h1 className="text-2xl font-semibold text-gray-900">Manage your equipment inventory</h1>
                </>
            }
        >
            <Head title="Tool Management" />

            <div className="space-y-6">
                <section className="flex flex-col gap-3 rounded-3xl bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500">Tools inventory</p>
                        <p className="text-sm text-gray-700">
                            {tools.length} tools in the system. {tools.filter((t) => t.status === 'Available').length} available for borrowing.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setEditingTool(null);
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                            Add Tool
                        </button>
                    </div>
                </section>

                {selectedIds.length > 0 && (
                    <section className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3 text-sm">
                        <p className="text-blue-800">
                            <span className="font-semibold">{selectedIds.length}</span> {selectedIds.length === 1 ? 'tool' : 'tools'} selected
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleBulkMaintenance}
                                className="rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-50"
                            >
                                Mark for Maintenance
                            </button>
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                className="rounded-full border border-rose-200 bg-white px-3 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                            >
                                Delete Selected
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </section>
                )}

                {tools.length === 0 ? (
                    <EmptyState
                        icon={
                            <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M14 10L8 16L12 20L18 14"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M22 10L30 18L26 22L18 14"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path d="M10 28L18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M22 24L28 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        }
                        title="No tools in inventory"
                        description="Get started by adding your first tool to the system."
                        action={{
                            label: 'Add Your First Tool',
                            onClick: () => {
                                setEditingTool(null);
                                setIsModalOpen(true);
                            },
                        }}
                    />
                ) : (
                    <ToolTable
                        tools={tools}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                    />
                )}
            </div>

            <CreateEditModal
                show={isModalOpen}
                tool={editingTool}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTool(null);
                }}
                onSave={handleSave}
            />

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-white p-6 text-sm text-gray-800 shadow-xl">
                        <h2 className="text-base font-semibold text-gray-900">Delete {deleteConfirm.name}?</h2>
                        <p className="mt-2 text-xs text-gray-600">
                            This action cannot be undone. The tool will be permanently removed from the inventory.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirm(null)}
                                className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="rounded-full bg-rose-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-rose-700"
                            >
                                Delete Tool
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
