import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { formatZodIssues } from "../schemas/requirement";
import { ApiError } from "../utils/ApiError";

export const validateBody =
  (schema: ZodTypeAny): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        ApiError.unprocessable(
          "Some fields are invalid",
          formatZodIssues(result.error),
        ),
      );
      return;
    }

    req.body = result.data;
    next();
  };
