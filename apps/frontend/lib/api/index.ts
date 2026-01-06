// =============================================================================
// Schemas (Zod)
// =============================================================================

export {
    // Common schemas
    coercedDateSchema,
    createPaginatedResponseSchema,
    // Validator utilities
    createPartialValidator,
    createResponseValidator, dateRangeSchema,
    dateStringSchema,
    datetimeStringSchema,
    emailSchema,
    entityStatusSchema,
    errorResponseSchema,
    fileMetadataSchema,
    nonEmptyString,
    nonNegativeInt,
    nullable,
    nullish,
    optional,
    paginationParamsSchema,
    percentageSchema,
    phoneSchema,
    positiveInt,
    requestStatusSchema,
    searchParamsSchema,
    sortParamsSchema,
    successResponseSchema,
    timestampsSchema,
    uploadResponseSchema,
    urlSchema,
    uuidSchema, validate,
    validateArray,
    validateArrayFilter,
    validateOrDefault,
    validateOrThrow,
    validateWithLogging,
    type ValidationIssue,
    type ValidationResult
} from "./schemas";

