import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '@/Components/Modal';

type CancelReservationModalProps = {
    show: boolean;
    toolName: string;
    pickupDate: string;
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
};

const CANCELLATION_MIN_DAYS = 3;

function formatDateLabel(ymd: string): string {
    const safeYmd = ymd.slice(0, 10);
    const parsed = parseISO(safeYmd);
    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function CancelReservationModal({ show, toolName, pickupDate, submitting = false, onClose, onSubmit }: CancelReservationModalProps) {
    const [reason, setReason] = useState('');
    const prevShowRef = useRef(false);

    useEffect(() => {
        if (show && !prevShowRef.current) {
            setReason('');
        }
        prevShowRef.current = show;
    }, [show]);

    const policyState = useMemo(() => {
        const pickupYmd = pickupDate.slice(0, 10);
        const pickup = parseISO(pickupYmd);
        const today = new Date();
        const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todayStart = parseISO(todayYmd);
        const daysUntilPickup = differenceInCalendarDays(pickup, todayStart);

        return {
            daysUntilPickup,
            canCancel: daysUntilPickup >= CANCELLATION_MIN_DAYS,
            pickupLabel: formatDateLabel(pickupYmd),
        };
    }, [pickupDate]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!policyState.canCancel || submitting) {
            return;
        }

        onSubmit(reason.trim());
    };

    const handleClose = () => {
        if (submitting) {
            return;
        }

        setReason('');
        onClose();
    };

    return (
        <Modal show={show} maxWidth="md" onClose={handleClose}>
            <div className="overflow-hidden rounded-lg">
                <div className="bg-gradient-to-r from-rose-600 to-rose-800 px-6 py-4 text-white">
                    <h2 className="text-sm font-semibold">Cancel Reservation</h2>
                    <p className="mt-1 text-[11px] text-rose-100">
                        {toolName} - Pickup: {policyState.pickupLabel}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 bg-white px-6 py-5">
                        <div className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                            You can only cancel reservations at least {CANCELLATION_MIN_DAYS} days before pickup.
                        </div>

                        {!policyState.canCancel && (
                            <div className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                                {policyState.daysUntilPickup >= 0
                                    ? `Cancellation is no longer allowed for this reservation. Pickup is in ${policyState.daysUntilPickup} day${policyState.daysUntilPickup === 1 ? '' : 's'}.`
                                    : 'Cancellation is no longer allowed because the pickup date has already passed.'}
                            </div>
                        )}

                        <div>
                            <label htmlFor="cancellation-reason" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                Reason (Optional)
                            </label>
                            <textarea
                                id="cancellation-reason"
                                value={reason}
                                onChange={(event) => setReason(event.target.value)}
                                rows={3}
                                maxLength={1000}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                                placeholder="Reason for cancellation..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Keep Reservation
                        </button>
                        <button
                            type="submit"
                            disabled={!policyState.canCancel || submitting}
                            className="rounded-full bg-rose-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
