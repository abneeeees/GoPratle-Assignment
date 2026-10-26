import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { allowedOrigins, env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requirementRouter } from "./routes/requirement.routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());

  app.use(
    cors({
      origin(origin, callback) {
        // No origin: server-to-server calls, curl, health checks.
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS: origin ${origin} is not allowed`));
      },
    }),
  );

  app.use(express.json({ limit: "100kb" }));

  if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  app.get("/health", (_req, res) => {
    res.json({
      success: true,
      data: { status: "ok", service: "gopratle-requirements-api", uptime: process.uptime() },
    });
  });

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.NODE_ENV === "test",
    message: {
      success: false,
      error: { code: "RATE_LIMITED", message: "Too many requests, please try again shortly" },
    },
  });

  app.use("/api", limiter);
  app.use("/api/requirements", requirementRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
