import { format } from 'date-fns';
import { useState } from 'react';
import { DayPicker, getDefaultClassNames, type DateRange } from 'react-day-picker';
import Modal from '@/Components/Modal';
import 'react-day-picker/style.css';

type RequestToolModalProps = {
    show: boolean;
    toolName: string;
    toolId: string;
    onClose: () => void;
    onSubmit: (data: { dateRange: DateRange; purpose: string }) => void;
};

export function RequestToolModal({ show, toolName, toolId, onClose, onSubmit }: RequestToolModalProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [purpose, setPurpose] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!dateRange?.from || !dateRange?.to) {
            setError('Please select a date range');
            return;
        }

        if (!purpose.trim()) {
            setError('Please enter the purpose of borrowing');
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
                    <h2 className="text-sm font-semibold">Request to Borrow</h2>
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
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={1}
                                    disabled={{ before: new Date() }}
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
                                Purpose
                            </label>
                            <textarea
                                id="purpose"
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Briefly describe why you need this tool..."
                            />
                        </div>

                        {error && <p className="text-[11px] text-rose-600">{error}</p>}
                    </div>

                    <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700">
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
