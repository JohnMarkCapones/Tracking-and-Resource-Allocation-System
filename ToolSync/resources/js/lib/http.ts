type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiRequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    signal?: AbortSignal;
};

async function handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') ?? '';

    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const message =
            (isJson && typeof payload === 'object' && payload && 'message' in payload && typeof (payload as any).message === 'string'
                ? (payload as any).message
                : response.statusText) || 'Request failed';

        // Throw a structured error so callers can decide how to handle it.
        const error = new Error(message) as Error & {
            status?: number;
            payload?: unknown;
        };
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload as T;
}

export async function apiRequest<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
    const { method = 'GET', body, signal } = options;

    const init: RequestInit = {
        method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        signal,
    };

    if (body !== undefined) {
        init.body = JSON.stringify(body);
    }

    const response = await fetch(url, init);

    return handleResponse<T>(response);
}

