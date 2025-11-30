import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import logger from "./utils/logger";

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import promptRoutes from "./modules/prompts/prompt.routes";
import imageRoutes from "./modules/images/image.routes";

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      success: false,
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests, please try again later.",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/", limiter);

  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Logging
  if (!config.server.isProduction) {
    app.use(
      morgan("dev", {
        stream: {
          write: (message) => logger.info(message.trim()),
        },
      })
    );
  } else {
    app.use(
      morgan("combined", {
        stream: {
          write: (message) => logger.info(message.trim()),
        },
      })
    );
  }

  // Health check
  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/prompts", promptRoutes);
  app.use("/api/images", imageRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
};

export default createApp;
