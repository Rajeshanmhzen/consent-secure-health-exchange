const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
    refreshSubscribers.push(cb)
}

function onRefreshed(token: string) {
    refreshSubscribers.forEach(cb => cb(token))
    refreshSubscribers = []
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const getHeaders = () => {
        const token = localStorage.getItem('accessToken')
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options?.headers || {})
        } as HeadersInit
    }

    const makeFetch = async () => {
        return fetch(`${BASE}${path}`, {
            ...options,
            headers: getHeaders()
        })
    }

    let res = await makeFetch()

    if (res.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
            handleAuthFailure()
            throw new Error('Session expired. Please log in again.')
        }

        if (!isRefreshing) {
            isRefreshing = true
            try {
                const refreshRes = await fetch(`${BASE}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                })

                if (!refreshRes.ok) {
                    throw new Error('Refresh failed')
                }

                const refreshJson = await refreshRes.json()
                const newAccess = refreshJson.data.accessToken
                const newRefresh = refreshJson.data.refreshToken

                localStorage.setItem('accessToken', newAccess)
                localStorage.setItem('refreshToken', newRefresh)

                isRefreshing = false
                onRefreshed(newAccess)
            } catch (err) {
                isRefreshing = false
                handleAuthFailure()
                throw new Error('Session expired. Please log in again.')
            }
        }

        return new Promise<T>((resolve, reject) => {
            subscribeTokenRefresh(async (newToken) => {
                try {
                    const retryRes = await fetch(`${BASE}${path}`, {
                        ...options,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${newToken}`,
                            ...(options?.headers || {})
                        } as HeadersInit
                    })
                    const json = await retryRes.json()
                    if (!retryRes.ok) throw new Error(json.message ?? 'Request failed after refresh')
                    resolve(json)
                } catch (retryErr) {
                    reject(retryErr)
                }
            })
        })
    }

    const json = await res.json()
    if (!res.ok) throw new Error(json.message ?? 'Request failed')
    return json
}

function handleAuthFailure() {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    window.dispatchEvent(new Event('auth_failure'))

    if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
    }
}
