// Error types and classes
export { ApiError, ApiErrorCode, isApiError, type ApiErrorResponse, type ValidationError } from "./types";

// Error messages and mappings
export { ERROR_MESSAGES, HTTP_STATUS_TO_ERROR_CODE, getErrorCodeFromStatus, getErrorMessage } from "./messages";

// Error handling utilities
export { getApiErrorMessage, handleApiError, isAuthenticationError, shouldRetryRequest } from "./handler";
