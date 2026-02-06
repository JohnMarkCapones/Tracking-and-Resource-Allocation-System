import { format } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';

type DateRangePickerProps = {
    value?: DateRange;
    onChange: (range: DateRange | undefined) => void;
    placeholder?: string;
};

export function DateRangePicker({ value, onChange, placeholder = 'Select date range' }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDateRange = () => {
        if (!value?.from) return placeholder;

        if (!value.to) {
            return format(value.from, 'MMM d, yyyy');
        }

        return `${format(value.from, 'MMM d')} - ${format(value.to, 'MMM d, yyyy')}`;
    };

    const handleClear = () => {
        onChange(undefined);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm hover:bg-gray-50"
            >
                <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M2 6H14" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M5 1V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M11 1V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span className={value?.from ? 'font-medium text-gray-900' : ''}>{formatDateRange()}</span>
                {value?.from && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                        className="ml-1 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5">
                    <DayPicker
                        mode="range"
                        selected={value}
                        onSelect={onChange}
                        numberOfMonths={2}
                        showOutsideDays
                        classNames={{
                            root: 'text-xs',
                            months: 'flex gap-4',
                            month: 'space-y-2',
                            caption: 'flex justify-center relative items-center h-8',
                            caption_label: 'text-xs font-semibold text-gray-900',
                            nav: 'flex items-center gap-1',
                            nav_button: 'h-6 w-6 bg-transparent p-0 text-gray-500 hover:text-gray-700',
                            table: 'w-full border-collapse',
                            head_row: 'flex',
                            head_cell: 'text-gray-500 rounded w-8 font-medium text-[10px] uppercase',
                            row: 'flex w-full mt-1',
                            cell: 'text-center text-xs p-0 relative',
                            day: 'h-8 w-8 p-0 font-normal rounded-full hover:bg-gray-100',
                            day_selected: 'bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700',
                            day_today: 'font-semibold text-blue-600',
                            day_outside: 'text-gray-300',
                            day_disabled: 'text-gray-300',
                            day_range_middle: 'bg-blue-50 text-blue-900 rounded-none',
                            day_hidden: 'invisible',
                        }}
                    />
                    <div className="mt-3 flex items-center justify-between border-t pt-3">
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                                    onChange({ from: weekAgo, to: today });
                                }}
                                className="rounded-full border border-gray-200 px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Last 7 days
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                                    onChange({ from: monthAgo, to: today });
                                }}
                                className="rounded-full border border-gray-200 px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Last 30 days
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-semibold text-white hover:bg-blue-700"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
