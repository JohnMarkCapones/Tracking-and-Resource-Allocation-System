type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiRequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    signal?: AbortSignal;
};

/** Error with status and payload for API callers (e.g. 401 → redirect to login). */
export type ApiError = Error & { status?: number; payload?: unknown };

function isApiError(err: unknown): err is ApiError {
    return err instanceof Error && 'status' in err;
}

/** 401 Unauthorized – caller can redirect to login when this is thrown. */
export function isUnauthorized(err: unknown): boolean {
    return isApiError(err) && err.status === 401;
}

function getCsrfToken(): string | null {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

async function handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') ?? '';

    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const msg =
            isJson &&
            typeof payload === 'object' &&
            payload !== null &&
            'message' in payload &&
            typeof (payload as { message?: string }).message === 'string'
                ? (payload as { message: string }).message
                : response.statusText;
        const message = msg || 'Request failed';

        const error = new Error(message) as ApiError;
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload as T;
}

export async function apiRequest<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
    const { method = 'GET', body, signal } = options;

    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    // Required for Laravel Sanctum stateful (cookie) auth on same-origin.
    if (method !== 'GET') {
        const token = getCsrfToken();
        if (token) {
            headers['X-XSRF-TOKEN'] = token;
        }
    }

    const init: RequestInit = {
        method,
        headers,
        credentials: 'same-origin',
        signal,
    };

    if (body !== undefined) {
        init.body = JSON.stringify(body);
    }

    const response = await fetch(url, init);

    try {
        return await handleResponse<T>(response);
    } catch (err) {
        if (isUnauthorized(err)) {
            window.location.href = '/profile/login';
        }
        throw err;
    }
}

