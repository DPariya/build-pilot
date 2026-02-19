import express from "express";
import cors from "cors";
import morgan from "morgan";
import webhookRoutes from "./routes/webhook.routes.js";
import projectRoutes from "./routes/project.routes.js";
import buildRoutes from "./routes/build.routes.js";
import deploymentRoutes from "./routes/deployment.routes.js";

const app = express();

app.use(cors());

// app.use(express.json());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (req, res, next) => {
  res.status(200).json({
    status: "OK",
    message: "Server is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Webhook routes
app.use("/api/webhooks", webhookRoutes);

// Project routes
app.use("/api/projects", projectRoutes);

// Build routes
app.use("/api/builds", buildRoutes);

// Deployment routes
app.use("/api/deployments", deploymentRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error.message);
  console.error("Stack:", error.stack);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("File:", err.stack?.split("\n")[1]?.trim());
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

export default app;
