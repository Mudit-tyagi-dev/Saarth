import express from "express";
import cors from "cors";
import { sql } from "./db/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  res.json({
    success: true,
    message: "SAARTH API is running",
  });
});
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SAARTH server running on port ${PORT}`);
});