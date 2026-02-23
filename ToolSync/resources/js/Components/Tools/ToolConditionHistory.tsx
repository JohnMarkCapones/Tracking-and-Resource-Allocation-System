import { useMemo, useState } from 'react';
import Modal from '@/Components/Modal';

type HistoryActor = {
    id: number | null;
    name: string | null;
    email: string | null;
};

type HistoryAllocation = {
    borrow_date: string | null;
    expected_return_date: string | null;
    actual_return_date: string | null;
    status: string | null;
};

export type ToolConditionHistoryEntry = {
    id: number;
    allocation_id: number;
    created_at: string | null;
    updated_at: string | null;
    borrower: HistoryActor;
    admin: HistoryActor;
    allocation: HistoryAllocation;
    borrower_condition: string;
    borrower_notes: string | null;
    borrower_images: string[];
    admin_condition: string | null;
    admin_notes: string | null;
    admin_images: string[];
    admin_reviewed_at: string | null;
};

type ToolConditionHistoryProps = {
    entries: ToolConditionHistoryEntry[];
};

function tone(condition: string | null | undefined): string {
    const key = (condition ?? '').toLowerCase();
    if (key === 'damaged') return 'bg-rose-100 text-rose-700';
    if (key === 'poor') return 'bg-amber-100 text-amber-700';
    if (key === 'excellent') return 'bg-emerald-100 text-emerald-700';
    return 'bg-slate-100 text-slate-700';
}

function formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ToolConditionHistory({ entries }: ToolConditionHistoryProps) {
    const [activeImage, setActiveImage] = useState<{ src: string; label: string } | null>(null);

    const sortedEntries = useMemo(
        () => [...entries].sort((a, b) => (new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())),
        [entries],
    );

    return (
        <section id="condition-history" className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Condition history</p>
                    <h3 className="text-base font-semibold text-gray-900">Return condition timeline</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                    {sortedEntries.length} record{sortedEntries.length === 1 ? '' : 's'}
                </span>
            </div>

            {sortedEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-gray-700">No condition history yet</p>
                    <p className="mt-1 text-xs text-gray-500">History will appear once this tool is returned and reviewed.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedEntries.map((entry) => (
                        <article key={entry.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                                    Return #{entry.id}
                                </span>
                                <span className="text-[11px] text-gray-500">
                                    Submitted {formatDate(entry.created_at)} | Borrowed by {entry.borrower.name ?? 'Unknown user'}
                                </span>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="rounded-xl bg-white p-3">
                                    <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Borrower report</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone(entry.borrower_condition)}`}>
                                            {entry.borrower_condition}
                                        </span>
                                        <span className="text-[11px] text-gray-500">
                                            Due {formatDate(entry.allocation.expected_return_date)}
                                        </span>
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap text-xs text-gray-700">
                                        {entry.borrower_notes?.trim() ? entry.borrower_notes : 'No borrower notes provided.'}
                                    </p>
                                    {entry.borrower_images.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {entry.borrower_images.map((img, index) => (
                                                <button
                                                    key={`${entry.id}-borrower-${index}`}
                                                    type="button"
                                                    className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200"
                                                    onClick={() => setActiveImage({ src: img, label: `Borrower photo ${index + 1}` })}
                                                >
                                                    <img src={img} alt={`Borrower proof ${index + 1}`} className="h-full w-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl bg-white p-3">
                                    <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Admin review</p>
                                    {entry.admin_condition ? (
                                        <>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone(entry.admin_condition)}`}>
                                                    {entry.admin_condition}
                                                </span>
                                                <span className="text-[11px] text-gray-500">
                                                    Reviewed by {entry.admin.name ?? 'Admin'} on {formatDate(entry.admin_reviewed_at)}
                                                </span>
                                            </div>
                                            <p className="mt-2 whitespace-pre-wrap text-xs text-gray-700">
                                                {entry.admin_notes?.trim() ? entry.admin_notes : 'No admin notes provided.'}
                                            </p>
                                            {entry.admin_images.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {entry.admin_images.map((img, index) => (
                                                        <button
                                                            key={`${entry.id}-admin-${index}`}
                                                            type="button"
                                                            className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200"
                                                            onClick={() => setActiveImage({ src: img, label: `Admin photo ${index + 1}` })}
                                                        >
                                                            <img src={img} alt={`Admin verification ${index + 1}`} className="h-full w-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="mt-2 text-xs text-amber-700">Pending admin verification.</p>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <Modal show={Boolean(activeImage)} maxWidth="xl" onClose={() => setActiveImage(null)}>
                {activeImage && (
                    <div className="overflow-hidden rounded-lg bg-white">
                        <div className="border-b border-gray-100 px-4 py-2">
                            <p className="text-xs font-semibold text-gray-700">{activeImage.label}</p>
                        </div>
                        <img src={activeImage.src} alt={activeImage.label} className="max-h-[75vh] w-full object-contain bg-black/90" />
                    </div>
                )}
            </Modal>
        </section>
    );
}
