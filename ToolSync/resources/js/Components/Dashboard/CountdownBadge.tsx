import { differenceInDays, parseISO } from 'date-fns';

type CountdownBadgeProps = {
    dueDate: string;
};

export function CountdownBadge({ dueDate }: CountdownBadgeProps) {
    const today = new Date();
    const due = parseISO(dueDate);
    const daysRemaining = differenceInDays(due, today);

    if (daysRemaining > 7) {
        return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{daysRemaining} days left</span>;
    }

    if (daysRemaining > 3) {
        return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{daysRemaining} days left</span>;
    }

    if (daysRemaining > 0) {
        return (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
            </span>
        );
    }

    if (daysRemaining === 0) {
        return <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">Due today</span>;
    }

    return (
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">{Math.abs(daysRemaining)} days overdue</span>
    );
}
