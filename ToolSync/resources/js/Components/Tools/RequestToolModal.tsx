import { format } from 'date-fns';
import { useState } from 'react';
import { DayPicker, getDefaultClassNames, type DateRange } from 'react-day-picker';
import Modal from '@/Components/Modal';
import 'react-day-picker/style.css';

type RequestToolModalProps = {
    show: boolean;
    toolName: string;
    toolId: string;
    /** 'borrow' = Request to Borrow, 'reservation' = Request a Reservation */
    intent?: 'borrow' | 'reservation';
    onClose: () => void;
    onSubmit: (data: { dateRange: DateRange; purpose: string }) => void;
    /** When true, disables submit to prevent spamming multiple requests. */
    submitting?: boolean;
};

export function RequestToolModal({
    show,
    toolName,
    toolId,
    intent = 'reservation',
    onClose,
    onSubmit,
    submitting = false,
}: RequestToolModalProps) {
    const isBorrow = intent === 'borrow';
    const title = isBorrow ? 'Request to Borrow' : 'Request a Reservation';
    const purposeLabel = isBorrow ? 'Purpose of borrowing' : 'Purpose of reservation';
    const purposePlaceholder = isBorrow
        ? 'Briefly describe why you need to borrow this tool...'
        : 'Briefly describe why you need this reservation...';
    const submitLabel = isBorrow ? 'Submit Borrow Request' : 'Submit Reservation';
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [purpose, setPurpose] = useState('');
    const [error, setError] = useState('');

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) {
            setDateRange(undefined);
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate);
        endDate.setHours(0, 0, 0, 0);

        // Always create a range from today to the selected date
        setDateRange({ from: today, to: endDate });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (submitting) {
            // Guard against double-submit while a request is already in-flight.
            return;
        }
        setError('');

        if (!dateRange?.from || !dateRange?.to) {
            setError('Please select a date range');
            return;
        }

        if (!purpose.trim()) {
            setError(isBorrow ? 'Please enter the purpose of borrowing.' : 'Please enter the purpose of your reservation.');
            return;
        }

        onSubmit({ dateRange, purpose });
    };

    const handleClose = () => {
        setDateRange(undefined);
        setPurpose('');
        setError('');
        onClose();
    };

    return (
        <Modal show={show} maxWidth="md" onClose={handleClose}>
            <div className="overflow-hidden rounded-lg">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <p className="mt-1 text-[11px] text-blue-100">
                        {toolName} ({toolId})
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 bg-white px-6 py-5">
                        <div>
                            <label className="mb-2 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Select Dates</label>
                            <div className="rounded-xl border border-gray-200 p-3">
                                {/*
                                 * Use the same DayPicker v9 styling as the tool detail calendar,
                                 * so arrows, spacing, and selection feel consistent across the app.
                                 */}
                                <DayPicker
                                    mode="single"
                                    selected={dateRange?.to}
                                    onSelect={handleDateSelect}
                                    numberOfMonths={1}
                                    disabled={{ before: new Date() }}
                                    modifiers={{ 
                                        range_start: dateRange?.from ? [dateRange.from] : [],
                                        range_end: dateRange?.to ? [dateRange.to] : [],
                                        range_middle: dateRange?.from && dateRange?.to ? (date) => {
                                            if (!dateRange.from || !dateRange.to) return false;
                                            return date > dateRange.from && date < dateRange.to;
                                        } : []
                                    }}
                                    modifiersClassNames={{
                                        range_start: 'bg-blue-600 text-white hover:bg-blue-700 rounded-full',
                                        range_end: 'bg-blue-600 text-white hover:bg-blue-700 rounded-full',
                                        range_middle: 'bg-blue-50 text-blue-900'
                                    }}
                                    navLayout="around"
                                    classNames={(() => {
                                        const defaultClassNames = getDefaultClassNames();
                                        return {
                                            root: `${defaultClassNames.root} text-xs`,
                                            month_caption: `${defaultClassNames.month_caption} mb-1 flex items-center justify-center text-xs font-semibold text-gray-900`,
                                            nav: `${defaultClassNames.nav}`,
                                            button_previous: `${defaultClassNames.button_previous} h-7 w-7 rounded-full text-gray-700 hover:bg-gray-100 hover:text-gray-900`,
                                            button_next: `${defaultClassNames.button_next} h-7 w-7 rounded-full text-gray-700 hover:bg-gray-100 hover:text-gray-900`,
                                            chevron: `${defaultClassNames.chevron} fill-black`,
                                            month_grid: `${defaultClassNames.month_grid} w-full border-collapse`,
                                            weekdays: `${defaultClassNames.weekdays}`,
                                            weekday: `${defaultClassNames.weekday} text-[10px] font-medium uppercase text-gray-500`,
                                            week: `${defaultClassNames.week}`,
                                            day: `${defaultClassNames.day} text-center text-xs`,
                                            day_button: `${defaultClassNames.day_button} rounded-full font-normal hover:bg-gray-100`,
                                            selected: 'bg-blue-600 text-white hover:bg-blue-700 rounded-full',
                                            today: `${defaultClassNames.today} font-semibold text-blue-600`,
                                            outside: `${defaultClassNames.outside} text-gray-300`,
                                            disabled: `${defaultClassNames.disabled} text-gray-300`,
                                            range_middle: `${defaultClassNames.range_middle} bg-blue-50 text-blue-900`,
                                            hidden: `${defaultClassNames.hidden} invisible`,
                                        };
                                    })()}
                                    styles={{
                                        chevron: { fill: '#000000' },
                                    }}
                                />
                            </div>
                            {dateRange?.from && dateRange?.to && (
                                <p className="mt-2 text-[11px] text-gray-600">
                                    Selected:{' '}
                                    <span className="font-medium">
                                        {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                                    </span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="purpose" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                {purposeLabel}
                            </label>
                            <textarea
                                id="purpose"
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={purposePlaceholder}
                            />
                        </div>

                        {error && <p className="text-[11px] text-rose-600">{error}</p>}
                    </div>

                    <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? 'Submitting…' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
