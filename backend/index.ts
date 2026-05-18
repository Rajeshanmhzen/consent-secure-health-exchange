import "dotenv/config";

import http from "http";
import app from "./src/app";
import { initRealtimeServer } from "./src/socket.io/realtime";

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

initRealtimeServer(server);

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
