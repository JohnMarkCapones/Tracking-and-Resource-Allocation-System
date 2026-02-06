import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

type UnavailableDate = {
    from: Date;
    to: Date;
    borrower?: string;
};

type AvailabilityCalendarProps = {
    unavailableDates?: UnavailableDate[];
};

export function AvailabilityCalendar({ unavailableDates = [] }: AvailabilityCalendarProps) {
    const disabledDays = unavailableDates.map((d) => ({
        from: d.from,
        to: d.to,
    }));

    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Availability Calendar</h3>
            <p className="mb-4 text-[11px] text-gray-500">Gray dates indicate the tool is already booked.</p>

            <DayPicker
                mode="single"
                numberOfMonths={1}
                disabled={disabledDays}
                showOutsideDays
                classNames={{
                    root: 'text-xs',
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
                    day_selected: 'bg-blue-600 text-white hover:bg-blue-700',
                    day_today: 'font-semibold text-blue-600',
                    day_outside: 'text-gray-300',
                    day_disabled: 'text-gray-300 bg-gray-100 rounded-full',
                    day_hidden: 'invisible',
                }}
            />

            <div className="mt-4 flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-gray-200" />
                    <span className="text-gray-600">Booked</span>
                </div>
            </div>
        </div>
    );
}
