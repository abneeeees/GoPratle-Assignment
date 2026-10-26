import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { formatZodIssues } from "../schemas/requirement";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} does not exist`,
    },
  });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Some fields are invalid",
        details: formatZodIssues(error),
      },
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "The requirement could not be saved",
        details: Object.values(error.errors).map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      error: { code: "INVALID_ID", message: "That identifier is not valid" },
    });
    return;
  }

  if (typeof error?.message === "string" && error.message.startsWith("CORS")) {
    res.status(403).json({
      success: false,
      error: { code: "ORIGIN_NOT_ALLOWED", message: "This origin is not allowed to call the API" },
    });
    return;
  }

  console.error("[api] unhandled error:", error);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong on our side",
      ...(env.NODE_ENV === "development" && error instanceof Error
        ? { details: [{ path: "stack", message: error.message }] }
        : {}),
    },
  });
};
