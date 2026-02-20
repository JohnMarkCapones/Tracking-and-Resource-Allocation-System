import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@/Components/EmptyState';
import Modal from '@/Components/Modal';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import type {
    ApprovalBorrowRequest,
    ApprovalReturnRequest,
    ApprovalsApiResponse,
} from '@/lib/apiTypes';
import { apiRequest } from '@/lib/http';

type Tab = 'borrow' | 'return';
type ReturnCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged' | 'Functional';

const RETURN_CONDITIONS: ReturnCondition[] = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged', 'Functional'];

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
}

function isReturnCondition(value: string | null | undefined): value is ReturnCondition {
    return RETURN_CONDITIONS.includes((value ?? '') as ReturnCondition);
}

function conditionTone(condition: string | null | undefined): string {
    const key = (condition ?? '').toLowerCase();
    if (key === 'damaged') return 'bg-rose-100 text-rose-700';
    if (key === 'poor') return 'bg-amber-100 text-amber-700';
    if (key === 'excellent') return 'bg-emerald-100 text-emerald-700';
    return 'bg-slate-100 text-slate-700';
}

export default function IndexPage() {
    const [tab, setTab] = useState<Tab>('borrow');
    const [borrowRequests, setBorrowRequests] = useState<ApprovalBorrowRequest[]>([]);
    const [returnRequests, setReturnRequests] = useState<ApprovalReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionId, setActionId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [reviewRequest, setReviewRequest] = useState<ApprovalReturnRequest | null>(null);
    const [reviewCondition, setReviewCondition] = useState<ReturnCondition | null>(null);
    const [reviewNote, setReviewNote] = useState('');
    const [reviewAdminImages, setReviewAdminImages] = useState<File[]>([]);
    const [reviewAdminImagePreviews, setReviewAdminImagePreviews] = useState<string[]>([]);
    const [reviewError, setReviewError] = useState<string | null>(null);

    const loadApprovals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiRequest<ApprovalsApiResponse>('/api/admin/approvals');
            setBorrowRequests(res.data.borrow_requests);
            setReturnRequests(res.data.return_requests);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load approvals');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadApprovals();
    }, [loadApprovals]);

    useEffect(() => {
        return () => {
            reviewAdminImagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [reviewAdminImagePreviews]);

    const handleApproveBorrow = useCallback(
        async (id: number) => {
            setActionId(`borrow-${id}`);
            try {
                await apiRequest(`/api/reservations/${id}/approve`, { method: 'POST' });
                toast.success('Borrow request approved.');
                await loadApprovals();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to approve');
            } finally {
                setActionId(null);
            }
        },
        [loadApprovals],
    );

    const handleDeclineBorrow = useCallback(
        async (id: number) => {
            setActionId(`borrow-${id}`);
            try {
                await apiRequest(`/api/reservations/${id}/decline`, { method: 'POST' });
                toast.success('Borrow request declined.');
                await loadApprovals();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to decline');
            } finally {
                setActionId(null);
            }
        },
        [loadApprovals],
    );
    const handleOpenReturnReview = useCallback((request: ApprovalReturnRequest) => {
        setReviewRequest(request);
        setReviewCondition(isReturnCondition(request.admin_condition) ? request.admin_condition : null);
        setReviewNote(request.admin_review_note ?? '');
        setReviewAdminImages([]);
        setReviewAdminImagePreviews((prev) => {
            prev.forEach((url) => URL.revokeObjectURL(url));
            return [];
        });
        setReviewError(null);
    }, []);

    const handleCloseReturnReview = useCallback(() => {
        setReviewRequest(null);
        setReviewCondition(null);
        setReviewNote('');
        setReviewAdminImages([]);
        setReviewAdminImagePreviews((prev) => {
            prev.forEach((url) => URL.revokeObjectURL(url));
            return [];
        });
        setReviewError(null);
    }, []);

    const handleAdminImagesChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        setReviewAdminImages(files);
        setReviewAdminImagePreviews((prev) => {
            prev.forEach((url) => URL.revokeObjectURL(url));
            return files.map((file) => URL.createObjectURL(file));
        });
        setReviewError(null);
    }, []);

    const handleApproveReturn = useCallback(async () => {
        if (!reviewRequest) return;

        const noteValue = reviewNote.trim();
        const isAdminPhotoRequired = reviewCondition === 'Poor' || reviewCondition === 'Damaged';
        const existingAdminImageCount = reviewRequest.admin_image_urls.length;

        if (!reviewCondition) {
            setReviewError('Please select an admin condition grade before approval.');
            return;
        }

        if (!noteValue) {
            setReviewError('Please provide admin review notes before approval.');
            return;
        }

        if (isAdminPhotoRequired && reviewAdminImages.length === 0 && existingAdminImageCount === 0) {
            setReviewError('Admin verification photos are required when grading Poor or Damaged.');
            return;
        }

        setActionId(`return-${reviewRequest.id}`);
        setReviewError(null);

        try {
            const payload = new FormData();
            payload.append('_method', 'PUT');
            payload.append('status', 'RETURNED');
            payload.append('admin_condition', reviewCondition);
            payload.append('admin_review_note', noteValue);
            for (const file of reviewAdminImages) {
                payload.append('admin_proof_images[]', file);
            }

            await apiRequest(`/api/tool-allocations/${reviewRequest.id}`, {
                method: 'POST',
                body: payload,
            });
            toast.success('Return approved and condition recorded.');
            handleCloseReturnReview();
            await loadApprovals();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to approve return';
            setReviewError(msg);
            toast.error(msg);
        } finally {
            setActionId(null);
        }
    }, [reviewRequest, reviewCondition, reviewNote, reviewAdminImages, loadApprovals, handleCloseReturnReview]);

    const handleDeclineReturn = useCallback(
        async (id: number) => {
            setActionId(`return-${id}`);
            try {
                await apiRequest(`/api/tool-allocations/${id}`, {
                    method: 'PUT',
                    body: { status: 'BORROWED' },
                });
                if (reviewRequest?.id === id) {
                    handleCloseReturnReview();
                }
                toast.success('Return request declined. Tool stays on borrower.');
                await loadApprovals();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to decline return');
            } finally {
                setActionId(null);
            }
        },
        [loadApprovals, reviewRequest, handleCloseReturnReview],
    );

    const query = search.toLowerCase().trim();

    const filteredBorrow = useMemo(
        () =>
            query
                ? borrowRequests.filter(
                      (r) =>
                          r.tool_name.toLowerCase().includes(query) ||
                          r.user_name.toLowerCase().includes(query) ||
                          (r.user_email?.toLowerCase().includes(query) ?? false),
                  )
                : borrowRequests,
        [borrowRequests, query],
    );

    const filteredReturn = useMemo(
        () =>
            query
                ? returnRequests.filter(
                      (r) =>
                          r.tool_name.toLowerCase().includes(query) ||
                          r.user_name.toLowerCase().includes(query) ||
                          (r.user_email?.toLowerCase().includes(query) ?? false),
                  )
                : returnRequests,
        [returnRequests, query],
    );

    const totalPending = borrowRequests.length + returnRequests.length;
    const reviewBorrowerImages = reviewRequest
        ? reviewRequest.borrower_image_urls.length > 0
            ? reviewRequest.borrower_image_urls
            : reviewRequest.return_proof_image_url
              ? [reviewRequest.return_proof_image_url]
              : []
        : [];
    const reviewHasExistingAdminImages = (reviewRequest?.admin_image_urls.length ?? 0) > 0;
    const reviewRequiresAdminPhotos = reviewCondition === 'Poor' || reviewCondition === 'Damaged';
    const reviewCanApprove = Boolean(reviewCondition) &&
        reviewNote.trim().length > 0 &&
        (!reviewRequiresAdminPhotos || reviewAdminImages.length > 0 || reviewHasExistingAdminImages);

    return (
        <AppLayout
            variant="admin"
            activeRoute="admin-approvals"
            header={
                <>
                    <p className="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">Approval center</p>
                    <h1 className="text-2xl font-semibold text-gray-900">Review and manage pending requests</h1>
                </>
            }
        >
            <Head title="Approvals" />

            <div className="space-y-6">
                <section className="flex flex-col gap-3 rounded-3xl bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500">Pending requests</p>
                        <p className="text-sm text-gray-700">
                            {totalPending === 0
                                ? 'No pending requests at this time.'
                                : `${totalPending} request${totalPending !== 1 ? 's' : ''} awaiting your review.`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500">
                            <svg className="h-3 w-3 shrink-0 text-gray-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="7" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
                                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                            <input
                                type="search"
                                placeholder="Search by tool or user..."
                                className="w-40 border-none bg-transparent text-xs outline-none placeholder:text-gray-400 sm:w-56"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={loadApprovals}
                            disabled={loading}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                            <svg className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M14 8A6 6 0 1 1 8 2"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        Loading approvals...
                    </div>
                )}
                {!loading && (
                    <>
                        <div className="flex items-center gap-1 rounded-full bg-white px-1 py-1 text-[11px] text-gray-600 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setTab('borrow')}
                                className={`rounded-full px-4 py-1.5 font-medium ${
                                    tab === 'borrow' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Borrow requests
                                {borrowRequests.length > 0 && (
                                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-100 px-1 text-[10px] font-semibold text-blue-700">
                                        {borrowRequests.length}
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab('return')}
                                className={`rounded-full px-4 py-1.5 font-medium ${
                                    tab === 'return' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Return requests
                                {returnRequests.length > 0 && (
                                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">
                                        {returnRequests.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {tab === 'borrow' && (
                            <section className="space-y-3">
                                {filteredBorrow.length === 0 ? (
                                    <EmptyState
                                        icon={
                                            <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M10 6H30V28L20 34L10 28V6Z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path d="M15 19L19 23L26 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        }
                                        title={query ? 'No matching borrow requests' : 'No pending borrow requests'}
                                        description={query ? 'Try adjusting your search.' : 'When users request to borrow tools, their requests will appear here.'}
                                    />
                                ) : (
                                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                                    <th className="px-4 py-3">Tool</th>
                                                    <th className="px-4 py-3">Requested by</th>
                                                    <th className="hidden px-4 py-3 md:table-cell">Date range</th>
                                                    <th className="hidden px-4 py-3 sm:table-cell">Submitted</th>
                                                    <th className="px-4 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredBorrow.map((req) => (
                                                    <BorrowRow
                                                        key={req.id}
                                                        request={req}
                                                        isActing={actionId === `borrow-${req.id}`}
                                                        onApprove={() => handleApproveBorrow(req.id)}
                                                        onDecline={() => handleDeclineBorrow(req.id)}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        )}

                        {tab === 'return' && (
                            <section className="space-y-3">
                                {filteredReturn.length === 0 ? (
                                    <EmptyState
                                        icon={
                                            <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M28 12L12 28M12 12L28 28"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                                <rect x="6" y="6" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                        }
                                        title={query ? 'No matching return requests' : 'No pending return requests'}
                                        description={query ? 'Try adjusting your search.' : 'When users request to return tools, their requests will appear here.'}
                                    />
                                ) : (
                                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                                    <th className="px-4 py-3">Tool</th>
                                                    <th className="px-4 py-3">Borrower</th>
                                                    <th className="hidden px-4 py-3 md:table-cell">Borrow period</th>
                                                    <th className="hidden px-4 py-3 lg:table-cell">Return report</th>
                                                    <th className="px-4 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredReturn.map((req) => (
                                                    <ReturnRow
                                                        key={req.id}
                                                        request={req}
                                                        isActing={actionId === `return-${req.id}`}
                                                        onReview={() => handleOpenReturnReview(req)}
                                                        onDecline={() => handleDeclineReturn(req.id)}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}
            </div>

            <Modal show={Boolean(reviewRequest)} maxWidth="2xl" onClose={handleCloseReturnReview}>
                {reviewRequest && (
                    <div className="overflow-hidden rounded-xl bg-white">
                        <div className="border-b border-gray-100 bg-slate-900 px-6 py-4 text-white">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Return review</p>
                            <h2 className="mt-1 text-lg font-semibold">{reviewRequest.tool_name}</h2>
                            <p className="text-xs text-slate-300">Borrower: {reviewRequest.user_name}</p>
                        </div>

                        <div className="space-y-5 px-6 py-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-700">
                                    <p><span className="font-semibold text-gray-900">Borrow period:</span> {formatDate(reviewRequest.borrow_date)} - {formatDate(reviewRequest.expected_return_date)}</p>
                                    <p className="mt-1"><span className="font-semibold text-gray-900">Submitted:</span> {timeAgo(reviewRequest.created_at)}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">User condition:</span>
                                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${conditionTone(reviewRequest.reported_condition)}`}>
                                            {reviewRequest.reported_condition ?? 'Not set'}
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-700">
                                    <p className="font-semibold text-gray-900">User notes</p>
                                    <p className="mt-1 whitespace-pre-wrap text-gray-600">{reviewRequest.note?.trim() ? reviewRequest.note : 'No notes provided.'}</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-3">
                                <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Borrower proof photos</p>
                                {reviewBorrowerImages.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {reviewBorrowerImages.map((img, index) => (
                                            <a
                                                key={`${reviewRequest.id}-borrower-${index}`}
                                                href={img}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block h-20 w-20 overflow-hidden rounded-xl border border-gray-200 hover:border-blue-300"
                                                title={`Open borrower image ${index + 1}`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Borrower proof ${index + 1} for ${reviewRequest.tool_name}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-1 text-xs text-gray-500">No proof image attached.</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Admin condition grade (required)</label>
                                <div className="flex flex-wrap gap-2">
                                    {RETURN_CONDITIONS.map((condition) => (
                                        <button
                                            key={condition}
                                            type="button"
                                            onClick={() => {
                                                setReviewCondition(condition);
                                                setReviewError(null);
                                            }}
                                            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                                                reviewCondition === condition
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {condition}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="admin-review-note" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                    Admin review note (required)
                                </label>
                                <textarea
                                    id="admin-review-note"
                                    rows={3}
                                    value={reviewNote}
                                    onChange={(e) => {
                                        setReviewNote(e.target.value);
                                        setReviewError(null);
                                    }}
                                    placeholder="Record findings, damage details, and maintenance instructions..."
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="admin-proof-images" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                    Admin verification photos {reviewRequiresAdminPhotos ? '(required)' : '(optional)'}
                                </label>
                                <input
                                    id="admin-proof-images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAdminImagesChange}
                                    className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-1.5 file:text-[11px] file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <p className="mt-1 text-[11px] text-gray-500">
                                    Upload up to 5 photos. JPG/PNG/WEBP, max 5MB each.
                                    {reviewRequiresAdminPhotos ? ' Required for Poor or Damaged grade.' : ''}
                                </p>
                                {reviewRequest.admin_image_urls.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {reviewRequest.admin_image_urls.map((url, index) => (
                                            <a
                                                key={`existing-admin-${index}`}
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block h-16 w-16 overflow-hidden rounded-lg border border-gray-200 hover:border-blue-300"
                                                title={`Open existing admin image ${index + 1}`}
                                            >
                                                <img src={url} alt={`Existing admin image ${index + 1}`} className="h-full w-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                                {reviewAdminImagePreviews.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {reviewAdminImagePreviews.map((url, index) => (
                                            <div key={`admin-preview-${index}`} className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
                                                <img src={url} alt={`Admin preview ${index + 1}`} className="h-full w-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {!reviewCanApprove && (
                                <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                    {!reviewCondition && <p>Select an admin condition grade.</p>}
                                    {reviewCondition && !reviewNote.trim() && <p>Add admin review notes.</p>}
                                    {reviewCondition && reviewRequiresAdminPhotos && reviewAdminImages.length === 0 && !reviewHasExistingAdminImages && (
                                        <p>Add at least one admin verification photo for Poor or Damaged grade.</p>
                                    )}
                                </div>
                            )}

                            {reviewError && (
                                <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{reviewError}</div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-3">
                            <button
                                type="button"
                                onClick={handleCloseReturnReview}
                                disabled={actionId === `return-${reviewRequest.id}`}
                                className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeclineReturn(reviewRequest.id)}
                                disabled={actionId === `return-${reviewRequest.id}`}
                                className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                            >
                                Decline return
                            </button>
                            <button
                                type="button"
                                onClick={handleApproveReturn}
                                disabled={actionId === `return-${reviewRequest.id}` || !reviewCanApprove}
                                className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                                {actionId === `return-${reviewRequest.id}` ? 'Saving...' : 'Approve return'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}

function BorrowRow({
    request,
    isActing,
    onApprove,
    onDecline,
}: {
    request: ApprovalBorrowRequest;
    isActing: boolean;
    onApprove: () => void;
    onDecline: () => void;
}) {
    const toolCode = request.tool_code?.trim() ? request.tool_code : `TL-${request.tool_id}`;

    return (
        <tr className="hover:bg-gray-50/50">
            <td className="px-4 py-3">
                <p className="font-semibold text-gray-900">{request.tool_name}</p>
                <p className="text-[11px] text-gray-500">{toolCode}</p>
            </td>
            <td className="px-4 py-3">
                <p className="font-medium text-gray-800">{request.user_name}</p>
                {request.user_email && (
                    <p className="text-[11px] text-gray-500">{request.user_email}</p>
                )}
            </td>
            <td className="hidden px-4 py-3 md:table-cell">
                <p className="text-gray-700">
                    {formatDate(request.start_date)} - {formatDate(request.end_date)}
                </p>
            </td>
            <td className="hidden px-4 py-3 sm:table-cell">
                <p className="text-gray-500">{timeAgo(request.created_at)}</p>
            </td>
            <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={onApprove}
                        disabled={isActing}
                        className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                        {isActing ? '...' : 'Approve'}
                    </button>
                    <button
                        type="button"
                        onClick={onDecline}
                        disabled={isActing}
                        className="rounded-full border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                    >
                        Decline
                    </button>
                </div>
            </td>
        </tr>
    );
}

function ReturnRow({
    request,
    isActing,
    onReview,
    onDecline,
}: {
    request: ApprovalReturnRequest;
    isActing: boolean;
    onReview: () => void;
    onDecline: () => void;
}) {
    const toolCode = request.tool_code?.trim() ? request.tool_code : `TL-${request.tool_id}`;

    return (
        <tr className="hover:bg-gray-50/50">
            <td className="px-4 py-3">
                <p className="font-semibold text-gray-900">{request.tool_name}</p>
                <p className="text-[11px] text-gray-500">{toolCode}</p>
            </td>
            <td className="px-4 py-3">
                <p className="font-medium text-gray-800">{request.user_name}</p>
                {request.user_email && (
                    <p className="text-[11px] text-gray-500">{request.user_email}</p>
                )}
            </td>
            <td className="hidden px-4 py-3 md:table-cell">
                <p className="text-gray-700">
                    {formatDate(request.borrow_date)} - {formatDate(request.expected_return_date)}
                </p>
            </td>
            <td className="hidden px-4 py-3 lg:table-cell">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${conditionTone(request.reported_condition)}`}>
                            {request.reported_condition ?? 'No condition'}
                        </span>
                        {(request.borrower_image_urls.length > 0 || request.return_proof_image_url) && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Photo attached</span>
                        )}
                    </div>
                    <p className="max-w-[200px] truncate text-gray-500" title={request.note ?? undefined}>
                        {request.note || '-'}
                    </p>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={onReview}
                        disabled={isActing}
                        className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                        {isActing ? '...' : 'Review & Approve'}
                    </button>
                    <button
                        type="button"
                        onClick={onDecline}
                        disabled={isActing}
                        className="rounded-full border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                    >
                        Decline
                    </button>
                </div>
            </td>
        </tr>
    );
}
