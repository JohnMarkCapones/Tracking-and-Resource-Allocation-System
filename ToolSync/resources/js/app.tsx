import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { QuickSwitcherProvider } from '@/Components/QuickSwitcher';
import { ToastProvider } from '@/Components/Toast';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            hydrateRoot(
                el,
                <QuickSwitcherProvider>
                    <App {...props} />
                    <ToastProvider />
                </QuickSwitcherProvider>,
            );
            return;
        }

        createRoot(el).render(
            <QuickSwitcherProvider>
                <App {...props} />
                <ToastProvider />
            </QuickSwitcherProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
