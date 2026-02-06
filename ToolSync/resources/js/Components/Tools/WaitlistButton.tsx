import { useState } from 'react';
import { toast } from '@/Components/Toast';

type WaitlistButtonProps = {
    toolId: string;
    toolName: string;
    currentPosition?: number;
};

export function WaitlistButton({ toolName, currentPosition }: WaitlistButtonProps) {
    const [isOnWaitlist, setIsOnWaitlist] = useState(currentPosition !== undefined);
    const [position, setPosition] = useState(currentPosition ?? 0);

    const handleToggle = () => {
        if (isOnWaitlist) {
            setIsOnWaitlist(false);
            toast.success(`Removed from waitlist for ${toolName}`);
        } else {
            const newPosition = Math.floor(Math.random() * 5) + 1;
            setIsOnWaitlist(true);
            setPosition(newPosition);
            toast.success(`Added to waitlist for ${toolName}. Position: #${newPosition}`);
        }
    };

    return (
        <div>
            {isOnWaitlist ? (
                <div className="space-y-2">
                    <div className="rounded-2xl bg-blue-50 px-4 py-3 text-center dark:bg-blue-900/20">
                        <p className="text-xs font-medium text-blue-800 dark:text-blue-300">You're on the waitlist</p>
                        <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">#{position}</p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400">in queue</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleToggle}
                        className="w-full rounded-full border border-rose-200 bg-white py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:bg-gray-800 dark:text-rose-400"
                    >
                        Leave Waitlist
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleToggle}
                    className="w-full rounded-full bg-amber-500 py-3 text-sm font-semibold text-white shadow-lg hover:bg-amber-600"
                >
                    Join Waitlist
                </button>
            )}
        </div>
    );
}
