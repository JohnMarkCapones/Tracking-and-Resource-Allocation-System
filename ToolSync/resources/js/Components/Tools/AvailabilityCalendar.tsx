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
        <div className="min-w-[320px] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Header: minimal, no gradient */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 2v2M14 2v2M3 8h14M5 4h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Availability</h3>
                    <p className="text-xs text-gray-500">When this tool is free to reserve</p>
                </div>
            </div>

            <div className="flex flex-col items-center px-3 py-4">
                {/*
                 * Extend default classNames so DayPicker's built-in flex layout
                 * for the nav row stays intact (prev | month caption | next).
                 * The wrapper centers the calendar; the grid stretches via w-full.
                 */}
                <DayPicker
                    mode="single"
                    numberOfMonths={1}
                    disabled={disabledDays}
                    showOutsideDays
                    navLayout="around"
                    classNames={{
                        root: `${defaultClassNames.root} w-full text-sm`,
                        months: `${defaultClassNames.months} w-full`,
                        month: `${defaultClassNames.month} w-full`,
                        month_caption: `${defaultClassNames.month_caption} mb-3 text-center text-base font-semibold text-gray-900`,
                        nav: `${defaultClassNames.nav}`,
                        button_previous: `${defaultClassNames.button_previous} h-8 w-8 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors`,
                        button_next: `${defaultClassNames.button_next} h-8 w-8 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors`,
                        chevron: `${defaultClassNames.chevron}`,
                        month_grid: `${defaultClassNames.month_grid} w-full table-fixed`,
                        weekdays: `${defaultClassNames.weekdays}`,
                        weekday: `${defaultClassNames.weekday} text-[11px] font-medium uppercase tracking-wider text-slate-400 pb-2`,
                        week: `${defaultClassNames.week}`,
                        day: `${defaultClassNames.day} text-center`,
                        day_button: `${defaultClassNames.day_button} mx-auto h-9 w-9 rounded-lg text-gray-700 font-medium hover:bg-slate-100 hover:text-gray-900 transition-colors`,
                        selected: `${defaultClassNames.selected} !bg-blue-600 !text-white hover:!bg-blue-700 rounded-lg`,
                        today: `${defaultClassNames.today} ring-2 ring-blue-400 ring-offset-1 rounded-lg font-semibold text-blue-600`,
                        outside: `${defaultClassNames.outside} text-gray-300`,
                        disabled: `${defaultClassNames.disabled} rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed`,
                        hidden: `${defaultClassNames.hidden} invisible`,
                    }}
                    styles={{ chevron: { fill: 'currentColor' } }}
                />

                {/* Legend */}
                <div className="mt-4 flex items-center justify-center gap-5 border-t border-gray-100 pt-3 text-[11px]">
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded border border-gray-200 bg-white" aria-hidden />
                        <span className="text-gray-500">Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded bg-slate-100" aria-hidden />
                        <span className="text-gray-500">Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded ring-2 ring-blue-400 ring-offset-1 bg-white" aria-hidden />
                        <span className="text-gray-500">Today</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
