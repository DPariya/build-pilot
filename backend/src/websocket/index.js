import { WebSocketServer } from "ws";
import Redis from "ioredis";
import { logError } from "../utils/logger.js";

const redisUrl = process.env.REDIS_URL || "redis://redis:6379";

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    let channel = null;
    const sub = new Redis(redisUrl); // new subscriber per connection

    ws.on("message", async (raw) => {
      try {
        const { buildId } = JSON.parse(raw.toString());
        if (!buildId) return;

        channel = `build-logs:${buildId}`;
        await sub.subscribe(channel);

        sub.on("message", (subscribedChannel, message) => {
          if (subscribedChannel === channel) {
            ws.send(JSON.stringify({ log: message }));
          }
        });
      } catch (err) {
        // console.error("WebSocket error:", err);
        logError("WebSocket error", err);
      }
    });

    ws.on("close", async () => {
      if (channel) {
        await sub.unsubscribe(channel);
      }
      sub.disconnect();
    });
  });

  console.log("WebSocket server attached");
}

export default setupWebSocket;
