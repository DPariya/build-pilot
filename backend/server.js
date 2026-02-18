import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import "./src/workers/build.worker.js";
import setupWebSocket from "./src/websocket/index.js";

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

setupWebSocket(server);
