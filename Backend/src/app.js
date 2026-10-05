import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import fuelRoutes from "./routes/fuel.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import maintenanceRoutes from "./routes/maintenance.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { sql } from "./db/index.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/fuel-events", fuelRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SAARTH API is operational",
    version: "v0.1.0",
    timestamp: new Date(),
  });
});

// Database connectivity check
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({
      success: true,
      message: "Neon PostgreSQL connected successfully",
      databaseTime: result[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SAARTH backend server running on http://localhost:${PORT}`);
});

export default app;