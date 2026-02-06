import { createContext, useContext } from 'react';

type QuickSwitcherContextValue = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
};

export const QuickSwitcherContext = createContext<QuickSwitcherContextValue>({
    isOpen: false,
    open: () => {},
    close: () => {},
    toggle: () => {},
});

export function useQuickSwitcher() {
    return useContext(QuickSwitcherContext);
}
