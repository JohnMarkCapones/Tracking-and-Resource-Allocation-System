import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FontSize = 'small' | 'normal' | 'large' | 'xlarge';
type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'fil';

type AccessibilityState = {
    fontSize: FontSize;
    highContrast: boolean;
    language: Language;
    reducedMotion: boolean;
    setFontSize: (size: FontSize) => void;
    setHighContrast: (enabled: boolean) => void;
    setLanguage: (lang: Language) => void;
    setReducedMotion: (enabled: boolean) => void;
};

const FONT_SIZE_MAP: Record<FontSize, string> = {
    small: '14px',
    normal: '16px',
    large: '18px',
    xlarge: '20px',
};

function applyFontSize(size: FontSize) {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[size];
}

function applyHighContrast(enabled: boolean) {
    if (enabled) {
        document.documentElement.classList.add('high-contrast');
    } else {
        document.documentElement.classList.remove('high-contrast');
    }
}

export const useAccessibilityStore = create<AccessibilityState>()(
    persist(
        (set) => ({
            fontSize: 'normal',
            highContrast: false,
            language: 'en',
            reducedMotion: false,

            setFontSize: (fontSize) => {
                applyFontSize(fontSize);
                set({ fontSize });
            },

            setHighContrast: (highContrast) => {
                applyHighContrast(highContrast);
                set({ highContrast });
            },

            setLanguage: (language) => {
                document.documentElement.lang = language;
                set({ language });
            },

            setReducedMotion: (reducedMotion) => {
                if (reducedMotion) {
                    document.documentElement.classList.add('reduce-motion');
                } else {
                    document.documentElement.classList.remove('reduce-motion');
                }
                set({ reducedMotion });
            },
        }),
        {
            name: 'toolsync-accessibility',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    applyFontSize(state.fontSize);
                    applyHighContrast(state.highContrast);
                    document.documentElement.lang = state.language;
                }
            },
        },
    ),
);

export const LANGUAGE_OPTIONS: { value: Language; label: string; nativeLabel: string }[] = [
    { value: 'en', label: 'English', nativeLabel: 'English' },
    { value: 'es', label: 'Spanish', nativeLabel: 'Espanol' },
    { value: 'fr', label: 'French', nativeLabel: 'Francais' },
    { value: 'de', label: 'German', nativeLabel: 'Deutsch' },
    { value: 'ja', label: 'Japanese', nativeLabel: '\u65E5\u672C\u8A9E' },
    { value: 'fil', label: 'Filipino', nativeLabel: 'Filipino' },
];

export const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
    { value: 'small', label: 'Small' },
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Large' },
    { value: 'xlarge', label: 'Extra Large' },
];
