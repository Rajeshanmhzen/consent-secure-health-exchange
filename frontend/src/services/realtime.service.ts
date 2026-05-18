export type RealtimeEvent =
    | { type: 'INQUIRY_CHANGED'; payload?: unknown }
    | { type: 'DASHBOARD_STATS_CHANGED'; payload?: unknown }
    | { type: 'NOTIFICATION_PREFERENCES_CHANGED'; payload: { userId: string } }

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

const getRealtimeUrl = () => {
    const token = localStorage.getItem('accessToken')
    const apiUrl = new URL(API_BASE)
    apiUrl.protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:'
    apiUrl.pathname = '/ws'
    apiUrl.search = token ? `token=${encodeURIComponent(token)}` : ''
    return apiUrl.toString()
}

export const createRealtimeConnection = (onEvent: (event: RealtimeEvent) => void) => {
    let reconnectTimer: number | undefined
    let socket: WebSocket | undefined
    let closedByClient = false

    const connect = () => {
        const token = localStorage.getItem('accessToken')
        if (!token || closedByClient) return

        socket = new WebSocket(getRealtimeUrl())

        socket.onmessage = (message) => {
            try {
                onEvent(JSON.parse(message.data) as RealtimeEvent)
            } catch {
                // Ignore malformed events.
            }
        }

        socket.onclose = () => {
            if (closedByClient) return
            reconnectTimer = window.setTimeout(connect, 3000)
        }
    }

    connect()

    return () => {
        closedByClient = true
        if (reconnectTimer) window.clearTimeout(reconnectTimer)
        socket?.close()
    }
}
