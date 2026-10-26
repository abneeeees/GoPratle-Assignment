export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static unprocessable(message: string, details?: unknown) {
    return new ApiError(422, "VALIDATION_ERROR", message, details);
  }
}
