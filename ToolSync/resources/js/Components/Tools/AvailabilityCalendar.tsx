import { DayPicker, getDefaultClassNames } from 'react-day-picker';
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

    const defaultClassNames = getDefaultClassNames();

    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Availability Calendar</h3>
            <p className="mb-4 text-[11px] text-gray-500">Gray dates indicate the tool is already booked.</p>

            {/*
             * react-day-picker v9 classNames — keys changed from v8.
             * We extend the defaults so the base layout stays intact,
             * then layer Tailwind utilities on top.
             */}
            <DayPicker
                mode="single"
                numberOfMonths={1}
                disabled={disabledDays}
                showOutsideDays
                navLayout="around"
                classNames={{
                    root: `${defaultClassNames.root} text-xs`,
                    month_caption: `${defaultClassNames.month_caption} mb-1 flex items-center justify-center text-xs font-semibold text-gray-900`,
                    nav: `${defaultClassNames.nav}`,
                    button_previous: `${defaultClassNames.button_previous} h-7 w-7 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800`,
                    button_next: `${defaultClassNames.button_next} h-7 w-7 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800`,
                    chevron: `${defaultClassNames.chevron} fill-gray-500`,
                    month_grid: `${defaultClassNames.month_grid} w-full border-collapse`,
                    weekdays: `${defaultClassNames.weekdays}`,
                    weekday: `${defaultClassNames.weekday} text-[10px] font-medium uppercase text-gray-500`,
                    week: `${defaultClassNames.week}`,
                    day: `${defaultClassNames.day} text-center text-xs`,
                    // Keep DayPicker's layout, but use a simple circular highlight for the selected day.
                    day_button: `${defaultClassNames.day_button} rounded-full font-normal hover:bg-gray-100`,
                    selected: 'bg-blue-600 text-white hover:bg-blue-700 rounded-full',
                    today: `${defaultClassNames.today} font-semibold text-blue-600`,
                    outside: `${defaultClassNames.outside} text-gray-300`,
                    disabled: `${defaultClassNames.disabled} rounded-full bg-gray-100 text-gray-300`,
                    hidden: `${defaultClassNames.hidden} invisible`,
                }}
                styles={{
                    // Force navigation chevrons to render in solid black.
                    chevron: { fill: '#000000' },
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
