import { useState, useEffect, useCallback, type PropsWithChildren } from 'react';
import { QuickSwitcherContext } from '@/hooks/useQuickSwitcher';
import { QuickSwitcher } from './QuickSwitcher';

export function QuickSwitcherProvider({ children }: PropsWithChildren) {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggle();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggle]);

    return (
        <QuickSwitcherContext.Provider value={{ isOpen, open, close, toggle }}>
            {children}
            <QuickSwitcher isOpen={isOpen} onClose={close} />
        </QuickSwitcherContext.Provider>
    );
}
