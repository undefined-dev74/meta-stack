// =============================================================================
// Common Schemas (local - generic schemas)
// =============================================================================

export { coercedDateSchema, createPaginatedResponseSchema, dateRangeSchema, dateStringSchema, datetimeStringSchema, emailSchema, entityStatusSchema, errorResponseSchema, fileMetadataSchema, nonEmptyString, nonNegativeInt, nullable, nullish, optional, paginationParamsSchema, percentageSchema, phoneSchema, positiveInt, requestStatusSchema, searchParamsSchema, sortParamsSchema, successResponseSchema, timestampsSchema, uploadResponseSchema, urlSchema, uuidSchema, type DateRange, type EntityStatus, type ErrorResponse, type FileMetadata, type RequestStatus, type SuccessResponse, type Timestamps, type UploadResponse } from "./common.schema";

// =============================================================================
// Validator Utilities (local - generic utilities)
// =============================================================================

export {
    createPartialValidator,
    createResponseValidator,
    validate,
    validateArray,
    validateArrayFilter,
    validateOrDefault,
    validateOrThrow,
    validateWithLogging,
    type ValidationIssue,
    type ValidationResult
} from "./validator";

