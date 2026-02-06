import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { useSwipeable } from 'react-swipeable';

type SwipeAction = {
    label: string;
    color: string;
    icon?: ReactNode;
    onAction: () => void;
};

type SwipeableCardProps = PropsWithChildren<{
    leftAction?: SwipeAction;
    rightAction?: SwipeAction;
    threshold?: number;
}>;

export function SwipeableCard({ children, leftAction, rightAction, threshold = 80 }: SwipeableCardProps) {
    const [offsetX, setOffsetX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);

    const handlers = useSwipeable({
        onSwiping: (e) => {
            setIsSwiping(true);
            const maxSwipe = 120;
            const clamp = Math.min(Math.abs(e.deltaX), maxSwipe);
            if (e.dir === 'Right' && leftAction) {
                setOffsetX(clamp);
            } else if (e.dir === 'Left' && rightAction) {
                setOffsetX(-clamp);
            }
        },
        onSwipedRight: () => {
            if (offsetX > threshold && leftAction) {
                leftAction.onAction();
            }
            setOffsetX(0);
            setIsSwiping(false);
        },
        onSwipedLeft: () => {
            if (Math.abs(offsetX) > threshold && rightAction) {
                rightAction.onAction();
            }
            setOffsetX(0);
            setIsSwiping(false);
        },
        onSwiped: () => {
            setOffsetX(0);
            setIsSwiping(false);
        },
        trackMouse: false,
        trackTouch: true,
        preventScrollOnSwipe: true,
    });

    return (
        <div className="swipe-action-container relative overflow-hidden rounded-2xl" {...handlers}>
            {/* Left swipe background */}
            {leftAction && offsetX > 0 && (
                <div
                    className="absolute inset-y-0 left-0 flex items-center px-4"
                    style={{ backgroundColor: leftAction.color, width: `${Math.abs(offsetX)}px` }}
                >
                    <div className="flex items-center gap-2 text-white">
                        {leftAction.icon}
                        <span className="text-xs font-semibold">{leftAction.label}</span>
                    </div>
                </div>
            )}

            {/* Right swipe background */}
            {rightAction && offsetX < 0 && (
                <div
                    className="absolute inset-y-0 right-0 flex items-center justify-end px-4"
                    style={{ backgroundColor: rightAction.color, width: `${Math.abs(offsetX)}px` }}
                >
                    <div className="flex items-center gap-2 text-white">
                        <span className="text-xs font-semibold">{rightAction.label}</span>
                        {rightAction.icon}
                    </div>
                </div>
            )}

            {/* Content */}
            <div
                className="relative bg-white dark:bg-gray-800"
                style={{
                    transform: `translateX(${offsetX}px)`,
                    transition: isSwiping ? 'none' : 'transform 0.3s ease',
                }}
            >
                {children}
            </div>
        </div>
    );
}
