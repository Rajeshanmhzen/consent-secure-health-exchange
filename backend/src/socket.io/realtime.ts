import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { verifyAccessToken } from "../utils/jwt";

type ClientMeta = {
    userId: string;
    role?: string;
};

type RealtimeEvent =
    | { type: "INQUIRY_CHANGED"; payload?: unknown }
    | { type: "DASHBOARD_STATS_CHANGED"; payload?: unknown }
    | { type: "NOTIFICATION_PREFERENCES_CHANGED"; payload: { userId: string } };

const clients = new Map<WebSocket, ClientMeta>();
const aliveClients = new WeakSet<WebSocket>();

const send = (client: WebSocket, event: RealtimeEvent) => {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(event));
    }
};

export const initRealtimeServer = (server: http.Server) => {
    const wss = new WebSocketServer({ server, path: "/ws" });

    wss.on("connection", (socket, req) => {
        try {
            const host = req.headers.host ?? "localhost";
            const url = new URL(req.url ?? "", `http://${host}`);
            const token = url.searchParams.get("token");

            if (!token) {
                socket.close(1008, "Unauthorized");
                return;
            }

            const payload = verifyAccessToken(token);
            clients.set(socket, {
                userId: payload.sub as string,
                role: payload.role as string | undefined
            });

            send(socket, { type: "DASHBOARD_STATS_CHANGED" });

            aliveClients.add(socket);
            socket.on("pong", () => aliveClients.add(socket));

            socket.on("close", () => {
                clients.delete(socket);
            });
        } catch {
            socket.close(1008, "Unauthorized");
        }
    });

    const heartbeat = windowlessInterval(() => {
        for (const client of clients.keys()) {
            if (!aliveClients.has(client)) {
                clients.delete(client);
                client.terminate();
                continue;
            }
            aliveClients.delete(client);
            client.ping();
        }
    }, 30000);

    wss.on("close", () => clearInterval(heartbeat));
};

export const publishRealtimeEvent = (event: RealtimeEvent) => {
    for (const [client, meta] of clients.entries()) {
        if (event.type === "NOTIFICATION_PREFERENCES_CHANGED") {
            if (meta.userId === event.payload.userId) send(client, event);
            continue;
        }

        if (meta.role === "SUPER_ADMIN") {
            send(client, event);
        }
    }
};

const windowlessInterval = (callback: () => void, ms: number) => setInterval(callback, ms);
