import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { ComponentType } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { AuthThemeGuard } from '@/Components/AuthThemeGuard';
import { QuickSwitcherProvider } from '@/Components/QuickSwitcher';
import { ToastProvider } from '@/Components/Toast';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
type InertiaPageModule = { default: ComponentType<Record<string, unknown>> };
const pages = import.meta.glob<InertiaPageModule>('./pages/**/*.tsx');

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(`./pages/${name}.tsx`, pages).then((module) => {
            const Page = module.default;
            return {
                default: (props: object) => (
                    <AuthThemeGuard>
                        <Page {...props} />
                    </AuthThemeGuard>
                ),
            };
        }),
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
