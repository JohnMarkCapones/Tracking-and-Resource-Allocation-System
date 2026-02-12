import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/Components/Breadcrumb';
import { EmptyState } from '@/Components/EmptyState';
import Modal from '@/Components/Modal';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import { apiRequest } from '@/lib/http';

type CategoryItem = {
    id: number;
    name: string;
    tools_count?: number;
};

type CategoriesApiResponse = { data: CategoryItem[]; meta?: { table_missing?: string } };

export default function IndexPage() {
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
    const [formName, setFormName] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<CategoryItem | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [tableMissing, setTableMissing] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await apiRequest<CategoriesApiResponse>('/api/tool-categories');
                if (cancelled) return;
                setCategories(res.data ?? []);
                setTableMissing(res.meta?.table_missing === 'tool_categories');
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load categories');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const openCreate = () => {
        setEditingCategory(null);
        setFormName('');
        setModalOpen(true);
    };

    const openEdit = (cat: CategoryItem) => {
        setEditingCategory(cat);
        setFormName(cat.name);
        setModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = formName.trim();
        if (!name) {
            toast.error('Category name is required');
            return;
        }
        setSaving(true);
        try {
            if (editingCategory) {
                await apiRequest(`/api/tool-categories/${editingCategory.id}`, {
                    method: 'PUT',
                    body: { name },
                });
                setCategories((prev) =>
                    prev.map((c) => (c.id === editingCategory.id ? { ...c, name } : c)),
                );
                toast.success('Category updated');
            } else {
                const res = await apiRequest<{ data: CategoryItem }>('/api/tool-categories', {
                    method: 'POST',
                    body: { name },
                });
                setCategories((prev) => [{ ...res.data, tools_count: res.data.tools_count ?? 0 }, ...prev]);
                toast.success('Category created');
            }
            setModalOpen(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            await apiRequest(`/api/tool-categories/${deleteConfirm.id}`, {
                method: 'DELETE',
            });
            setCategories((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
            toast.success('Category deleted');
            setDeleteConfirm(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Could not delete category';
            toast.error(message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AppLayout
            variant="admin"
            activeRoute="admin-categories"
            header={
                <>
                    <Breadcrumb className="mb-2">
                        <Breadcrumb.Home href="/admin/dashboard" />
                        <Breadcrumb.Item isCurrent>Categories</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tool Categories</h1>
                </>
            }
        >
            <Head title="Categories" />

            {loading && (
                <div className="rounded-3xl bg-white px-5 py-12 text-center text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                    Loading categories…
                </div>
            )}
            {error && (
                <div className="rounded-3xl bg-red-50 px-5 py-4 text-red-700 shadow-sm dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}
            {!loading && !error && (
                <div className="space-y-6">
                    {tableMissing && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                            <p className="font-medium">Categories are not set up yet.</p>
                            <p className="mt-1 text-[12px]">
                                Run <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">php artisan migrate</code> to create the table.
                            </p>
                        </div>
                    )}
                    <div className="flex flex-col gap-3 rounded-3xl bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between dark:bg-gray-800/70">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}. Categories group tools in the catalog.
                        </p>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            <span className="text-sm">+</span>
                            Add Category
                        </button>
                    </div>

                    {categories.length === 0 ? (
                        <EmptyState
                            icon={
                                <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M8 12H32M8 20H32M8 28H24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                    <rect x="4" y="6" width="32" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            }
                            title="No categories yet"
                            description="Add a category to organize tools in the catalog (e.g. Electronics, Computing)."
                            action={{ label: 'Add Category', onClick: openCreate }}
                        />
                    ) : (
                        <div className="space-y-3">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                            {cat.tools_count ?? 0} tool{(cat.tools_count ?? 0) === 1 ? '' : 's'} in this category
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(cat)}
                                            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteConfirm(cat)}
                                            className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:bg-gray-700 dark:text-rose-400 dark:hover:bg-rose-900/20"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <Modal show={modalOpen} maxWidth="sm" onClose={() => !saving && setModalOpen(false)}>
                <div className="overflow-hidden rounded-lg">
                    <div className="bg-gradient-to-r from-slate-900 to-blue-700 px-6 py-3 text-white">
                        <h2 className="text-sm font-semibold">
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                        </h2>
                    </div>
                    <form onSubmit={handleSave}>
                        <div className="space-y-4 bg-white px-6 py-5 dark:bg-gray-800">
                            <div>
                                <label
                                    htmlFor="category-name"
                                    className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
                                >
                                    Name
                                </label>
                                <input
                                    id="category-name"
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. Electronics"
                                    maxLength={100}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-700/50">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                disabled={saving}
                                className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !formName.trim()}
                                className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving…' : editingCategory ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {deleteConfirm && (
                <Modal show={true} maxWidth="sm" onClose={() => !deleting && setDeleteConfirm(null)}>
                    <div className="overflow-hidden rounded-lg">
                        <div className="bg-gradient-to-r from-rose-700 to-rose-600 px-6 py-3 text-white">
                            <h2 className="text-sm font-semibold">Delete category?</h2>
                        </div>
                        <div className="space-y-3 bg-white px-6 py-5 dark:bg-gray-800">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
                                {((deleteConfirm.tools_count ?? 0) > 0) && (
                                    <span className="mt-2 block text-rose-600 dark:text-rose-400">
                                        This category has {deleteConfirm.tools_count} tool(s). Move or remove them first, or the server will reject the delete.
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-700/50">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirm(null)}
                                className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="rounded-full bg-rose-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                            >
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </AppLayout>
    );
}
