/**
 * Standard error codes used across the application
 */
export const ApiErrorCode = {
  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  REQUEST_CANCELLED: "REQUEST_CANCELLED",

  // Authentication errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  ALREADY_EXISTS: "ALREADY_EXISTS",

  // Server errors
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  BAD_GATEWAY: "BAD_GATEWAY",

  // Business logic errors
  BUSINESS_ERROR: "BUSINESS_ERROR",
  OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",

  // Generic
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

/**
 * Structured API error response from backend
 */
export interface ApiErrorResponse {
  message: string;
  detail?: string | Record<string, unknown>;
  errors?: ValidationError[];
  code?: string;
  status?: number;
}

/**
 * Field-level validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Standardized API error class
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly statusCode: number;
  readonly originalError?: unknown;
  readonly details?: Record<string, unknown>;
  readonly validationErrors?: ValidationError[];
  readonly timestamp: Date;
  readonly requestId?: string;

  constructor(options: {
    message: string;
    code: ApiErrorCode;
    statusCode: number;
    originalError?: unknown;
    details?: Record<string, unknown>;
    validationErrors?: ValidationError[];
    requestId?: string;
  }) {
    super(options.message);
    this.name = "ApiError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.originalError = options.originalError;
    this.details = options.details;
    this.validationErrors = options.validationErrors;
    this.timestamp = new Date();
    this.requestId = options.requestId;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if the error is a specific error code
   */
  is(code: ApiErrorCode): boolean {
    return this.code === code;
  }

  /**
   * Check if the error is an authentication error
   */
  isAuthError(): boolean {
    const authCodes: readonly ApiErrorCode[] = [
      ApiErrorCode.UNAUTHORIZED,
      ApiErrorCode.FORBIDDEN,
      ApiErrorCode.TOKEN_EXPIRED,
      ApiErrorCode.INVALID_CREDENTIALS,
    ];
    return authCodes.includes(this.code);
  }

  /**
   * Check if the error is a validation error
   */
  isValidationError(): boolean {
    const validationCodes: readonly ApiErrorCode[] = [
      ApiErrorCode.VALIDATION_ERROR,
      ApiErrorCode.INVALID_INPUT,
      ApiErrorCode.MISSING_REQUIRED_FIELD,
    ];
    return validationCodes.includes(this.code);
  }

  /**
   * Check if the error is a server error
   */
  isServerError(): boolean {
    const serverCodes: readonly ApiErrorCode[] = [
      ApiErrorCode.INTERNAL_SERVER_ERROR,
      ApiErrorCode.SERVICE_UNAVAILABLE,
      ApiErrorCode.BAD_GATEWAY,
    ];
    return serverCodes.includes(this.code);
  }

  /**
   * Check if the error is retryable
   */
  isRetryable(): boolean {
    const retryableCodes: readonly ApiErrorCode[] = [
      ApiErrorCode.NETWORK_ERROR,
      ApiErrorCode.TIMEOUT,
      ApiErrorCode.SERVICE_UNAVAILABLE,
      ApiErrorCode.BAD_GATEWAY,
    ];
    return retryableCodes.includes(this.code);
  }

  /**
   * Convert to a plain object for logging/serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      validationErrors: this.validationErrors,
      timestamp: this.timestamp.toISOString(),
      requestId: this.requestId,
    };
  }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
