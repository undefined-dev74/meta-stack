import type { AxiosError } from "axios";
import { ApiError, ApiErrorCode, type ApiErrorResponse, type ValidationError } from "./types";
import { getErrorCodeFromStatus, getErrorMessage, HTTP_STATUS_TO_ERROR_CODE } from "./messages";

/**
 * Extract validation errors from API response
 */
function extractValidationErrors(detail: unknown): ValidationError[] | undefined {
  if (!detail) return undefined;

  // Handle FastAPI validation error format
  if (Array.isArray(detail)) {
    return detail.map((err: { loc?: string[]; msg?: string; type?: string }) => ({
      field: err.loc?.slice(1).join(".") || "unknown",
      message: err.msg || "Validation error",
      code: err.type,
    }));
  }

  // Handle object format { field: message }
  if (typeof detail === "object") {
    return Object.entries(detail as Record<string, string>).map(([field, message]) => ({
      field,
      message: String(message),
    }));
  }

  return undefined;
}

/**
 * Extract error message from various response formats
 */
function extractErrorMessage(data: unknown): string {
  if (!data) return "";

  if (typeof data === "string") return data;

  const errorData = data as ApiErrorResponse;

  // Check common message fields
  if (errorData.message) return errorData.message;
  if (errorData.detail) {
    if (typeof errorData.detail === "string") return errorData.detail;
    // For validation errors, create a summary message
    if (Array.isArray(errorData.detail)) {
      return errorData.detail
        .map((e: { msg?: string }) => e.msg)
        .filter(Boolean)
        .join(", ");
    }
  }

  return "";
}

/**
 * Determine error code from error response
 */
function determineErrorCode(status: number | undefined, data: unknown): ApiErrorCode {
  // First check status code
  if (status && HTTP_STATUS_TO_ERROR_CODE[status]) {
    // Special case: 401 could be invalid credentials or token expired
    if (status === 401) {
      const message = extractErrorMessage(data).toLowerCase();
      if (message.includes("invalid") || message.includes("incorrect") || message.includes("wrong")) {
        return ApiErrorCode.INVALID_CREDENTIALS;
      }
      if (message.includes("expired")) {
        return ApiErrorCode.TOKEN_EXPIRED;
      }
    }
    return getErrorCodeFromStatus(status);
  }

  return ApiErrorCode.UNKNOWN_ERROR;
}

/**
 * Handle Axios errors and convert to standardized ApiError
 *
 * @param error - The Axios error to handle
 * @returns ApiError with standardized format
 *
 * @example
 * try {
 *   await api.get('/users');
 * } catch (error) {
 *   const apiError = handleApiError(error);
 *   toast.error(apiError.message);
 * }
 */
export function handleApiError(error: unknown): ApiError {
  // Handle cancellation
  if (error instanceof Error && (error.name === "CanceledError" || error.message === "canceled")) {
    return new ApiError({
      message: getErrorMessage(ApiErrorCode.REQUEST_CANCELLED),
      code: ApiErrorCode.REQUEST_CANCELLED,
      statusCode: 0,
      originalError: error,
    });
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    const { response, request, message } = error;

    // Response received but with error status
    if (response) {
      const { status, data } = response;
      const errorCode = determineErrorCode(status, data);
      const errorMessage = extractErrorMessage(data) || getErrorMessage(errorCode);
      const validationErrors = extractValidationErrors((data as ApiErrorResponse)?.detail);

      // Extract request ID if available (common in production APIs)
      const requestId = response.headers["x-request-id"] || response.headers["x-correlation-id"];

      return new ApiError({
        message: errorMessage,
        code: errorCode,
        statusCode: status,
        originalError: error,
        details: typeof data === "object" ? (data as Record<string, unknown>) : { raw: data },
        validationErrors,
        requestId,
      });
    }

    // Request made but no response received (network error)
    if (request) {
      // Check for timeout
      if (error.code === "ECONNABORTED" || message.includes("timeout")) {
        return new ApiError({
          message: getErrorMessage(ApiErrorCode.TIMEOUT),
          code: ApiErrorCode.TIMEOUT,
          statusCode: 0,
          originalError: error,
        });
      }

      return new ApiError({
        message: getErrorMessage(ApiErrorCode.NETWORK_ERROR),
        code: ApiErrorCode.NETWORK_ERROR,
        statusCode: 0,
        originalError: error,
      });
    }

    // Error setting up the request
    return new ApiError({
      message: message || getErrorMessage(ApiErrorCode.UNKNOWN_ERROR),
      code: ApiErrorCode.UNKNOWN_ERROR,
      statusCode: 0,
      originalError: error,
    });
  }

  // Handle generic errors
  if (error instanceof Error) {
    return new ApiError({
      message: error.message || getErrorMessage(ApiErrorCode.UNKNOWN_ERROR),
      code: ApiErrorCode.UNKNOWN_ERROR,
      statusCode: 0,
      originalError: error,
    });
  }

  // Unknown error type
  return new ApiError({
    message: getErrorMessage(ApiErrorCode.UNKNOWN_ERROR),
    code: ApiErrorCode.UNKNOWN_ERROR,
    statusCode: 0,
    originalError: error,
  });
}

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError<unknown> {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Extract user-friendly error message from any error
 * Convenience function for use in UI components
 */
export function getApiErrorMessage(error: unknown): string {
  const apiError = handleApiError(error);
  return apiError.message;
}

/**
 * Check if error is due to authentication failure
 * Useful for redirecting to login
 */
export function isAuthenticationError(error: unknown): boolean {
  const apiError = handleApiError(error);
  return apiError.isAuthError();
}

/**
 * Check if error should trigger a retry
 */
export function shouldRetryRequest(error: unknown): boolean {
  const apiError = handleApiError(error);
  return apiError.isRetryable();
}
