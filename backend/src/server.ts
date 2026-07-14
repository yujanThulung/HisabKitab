import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import { errorHandler } from "./middleware/errorHandler";

import authRoute from "./routes/auth.route";
import expanseRoute from "./routes/expanse.route";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL : (origin, callback) => callback(null, true),
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()} ]${req.method} ${req.originalUrl}`)
  next();
})

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: Date.now().toString()
  });
});

app.use("/api", authRoute);
app.use("/api", expanseRoute);

// Backward compat: /api/login -> /api/auth/login
app.all("/api/login", (req, res) => {
  res.redirect(307, "/api/auth/login");
});


app.get("/", (_req, res) => {
  res.send("Server is running")
})

// Global error handler for multer errors
app.use((err: any, req: any, res: any, next: any) => {
  if (err) {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      message: err.message || "Internal server error"
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found"
  })
})

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });

    const shutdown = (signal: string) => {
      console.log(`${signal} received, gracefully shutting down...`)
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      })

      setTimeout(() => {
        console.error("Forcing server shutdown...");
        process.exit(0);
      }, 1000)
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);

  }
}

startServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});