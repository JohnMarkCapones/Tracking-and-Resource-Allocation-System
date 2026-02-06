import { useAccessibilityStore, LANGUAGE_OPTIONS, FONT_SIZE_OPTIONS } from '@/stores/accessibilityStore';
import { useThemeStore } from '@/stores/themeStore';

type AccessibilityPanelProps = {
    show: boolean;
    onClose: () => void;
};

export function AccessibilityPanel({ show, onClose }: AccessibilityPanelProps) {
    const { fontSize, highContrast, language, reducedMotion, setFontSize, setHighContrast, setLanguage, setReducedMotion } = useAccessibilityStore();
    const { theme, setTheme } = useThemeStore();

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-800">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Accessibility Settings</h2>
                    <button type="button" onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Font Size */}
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">Font Size</label>
                        <div className="flex gap-2">
                            {FONT_SIZE_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFontSize(option.value)}
                                    className={`flex-1 rounded-xl py-2 text-xs font-medium transition-colors ${
                                        fontSize === option.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme */}
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">Theme</label>
                        <div className="flex gap-2">
                            {(['light', 'dark', 'system'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTheme(t)}
                                    className={`flex-1 rounded-xl py-2 text-xs font-medium capitalize transition-colors ${
                                        theme === t
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* High Contrast */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">High Contrast</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Increase color contrast for better visibility</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={highContrast}
                                onChange={(e) => setHighContrast(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="peer h-5 w-9 rounded-full bg-gray-300 peer-checked:bg-blue-600 after:absolute after:top-0.5 after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full dark:bg-gray-600" />
                        </label>
                    </div>

                    {/* Reduced Motion */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Reduced Motion</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Minimize animations and transitions</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={reducedMotion}
                                onChange={(e) => setReducedMotion(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="peer h-5 w-9 rounded-full bg-gray-300 peer-checked:bg-blue-600 after:absolute after:top-0.5 after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full dark:bg-gray-600" />
                        </label>
                    </div>

                    {/* Language */}
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as never)}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            {LANGUAGE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label} ({option.nativeLabel})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
