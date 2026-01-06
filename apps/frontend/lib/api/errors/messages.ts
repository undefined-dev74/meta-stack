import { ApiErrorCode } from "./types";

/**
 * User-friendly error messages mapped to error codes
 * These messages are safe to display to end users
 */
export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  // Network errors
  [ApiErrorCode.NETWORK_ERROR]: "Unable to connect to the server. Please check your internet connection and try again.",
  [ApiErrorCode.TIMEOUT]: "The request took too long to complete. Please try again.",
  [ApiErrorCode.REQUEST_CANCELLED]: "The request was cancelled.",

  // Authentication errors
  [ApiErrorCode.UNAUTHORIZED]: "Your session has expired. Please sign in again.",
  [ApiErrorCode.FORBIDDEN]: "You do not have permission to perform this action.",
  [ApiErrorCode.TOKEN_EXPIRED]: "Your session has expired. Please sign in again.",
  [ApiErrorCode.INVALID_CREDENTIALS]: "Invalid email or password. Please try again.",

  // Validation errors
  [ApiErrorCode.VALIDATION_ERROR]: "Please check your input and correct any errors.",
  [ApiErrorCode.INVALID_INPUT]: "The provided data is invalid.",
  [ApiErrorCode.MISSING_REQUIRED_FIELD]: "Please fill in all required fields.",

  // Resource errors
  [ApiErrorCode.NOT_FOUND]: "The requested resource was not found.",
  [ApiErrorCode.CONFLICT]: "This operation conflicts with existing data. Please refresh and try again.",
  [ApiErrorCode.ALREADY_EXISTS]: "This item already exists.",

  // Server errors
  [ApiErrorCode.INTERNAL_SERVER_ERROR]: "Something went wrong on our end. Please try again later.",
  [ApiErrorCode.SERVICE_UNAVAILABLE]: "The service is temporarily unavailable. Please try again later.",
  [ApiErrorCode.BAD_GATEWAY]: "Unable to reach the server. Please try again later.",

  // Business logic errors
  [ApiErrorCode.BUSINESS_ERROR]: "The operation could not be completed.",
  [ApiErrorCode.OPERATION_NOT_ALLOWED]: "This operation is not allowed.",

  // Generic
  [ApiErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again.",
};

/**
 * HTTP status code to error code mapping
 */
export const HTTP_STATUS_TO_ERROR_CODE: Record<number, ApiErrorCode> = {
  400: ApiErrorCode.VALIDATION_ERROR,
  401: ApiErrorCode.UNAUTHORIZED,
  403: ApiErrorCode.FORBIDDEN,
  404: ApiErrorCode.NOT_FOUND,
  409: ApiErrorCode.CONFLICT,
  422: ApiErrorCode.VALIDATION_ERROR,
  429: ApiErrorCode.SERVICE_UNAVAILABLE, // Rate limited
  500: ApiErrorCode.INTERNAL_SERVER_ERROR,
  502: ApiErrorCode.BAD_GATEWAY,
  503: ApiErrorCode.SERVICE_UNAVAILABLE,
  504: ApiErrorCode.TIMEOUT,
};

/**
 * Get user-friendly message for an error code
 */
export function getErrorMessage(code: ApiErrorCode): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ApiErrorCode.UNKNOWN_ERROR];
}

/**
 * Get error code from HTTP status
 */
export function getErrorCodeFromStatus(status: number): ApiErrorCode {
  return HTTP_STATUS_TO_ERROR_CODE[status] || ApiErrorCode.UNKNOWN_ERROR;
}
