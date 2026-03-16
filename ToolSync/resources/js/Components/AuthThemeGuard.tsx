import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

const AUTH_PATHS = ['/', '/login', '/register', '/forgot-password'];
const AUTH_PREFIXES = ['/register/', '/reset-password/'];

function isAuthPage(path: string): boolean {
    if (AUTH_PATHS.includes(path)) return true;
    return AUTH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function applyThemeForRoute(path: string): void {
    const { resolvedTheme } = useThemeStore.getState();
    if (isAuthPage(path)) {
        document.documentElement.classList.remove('dark');
    } else {
        if (resolvedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}

export function AuthThemeGuard({ children }: { children: React.ReactNode }) {
    const { url } = usePage();

    useEffect(() => {
        applyThemeForRoute(url);
    }, [url]);

    useEffect(() => {
        const cleanup = router.on('finish', () => {
            applyThemeForRoute(window.location.pathname);
        });
        return () => cleanup();
    }, []);

    return <>{children}</>;
}
