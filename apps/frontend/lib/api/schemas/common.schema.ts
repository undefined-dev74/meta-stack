/**
 * Common Zod Schemas
 *
 * Reusable schemas for common data patterns across the application.
 * Uses Zod v4 API with enhanced validation and error messages.
 */

import { z } from "zod";

// =============================================================================
// Primitive Schemas
// =============================================================================

/**
 * Non-empty string schema
 */
export const nonEmptyString = z.string().min(1, { message: "This field is required" });

/**
 * Email schema with proper validation
 */
export const emailSchema = z.string().email({ message: "Please enter a valid email address" });

/**
 * URL schema
 */
export const urlSchema = z.string().url({ message: "Please enter a valid URL" });

/**
 * UUID schema
 */
export const uuidSchema = z.string().uuid({ message: "Invalid UUID format" });

/**
 * Phone number schema (international format)
 */
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number" });

/**
 * Positive integer schema
 */
export const positiveInt = z.number().int().positive();

/**
 * Non-negative integer schema
 */
export const nonNegativeInt = z.number().int().nonnegative();

/**
 * Percentage schema (0-100)
 */
export const percentageSchema = z.number().min(0).max(100);

// =============================================================================
// Date Schemas
// =============================================================================

/**
 * ISO date string schema (YYYY-MM-DD)
 */
export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Date must be in YYYY-MM-DD format",
});

/**
 * ISO datetime string schema
 */
export const datetimeStringSchema = z.string().datetime({
  message: "Invalid datetime format",
});

/**
 * Date coercion schema (accepts string or Date, returns Date)
 */
export const coercedDateSchema = z.coerce.date();

// =============================================================================
// Pagination Schemas
// =============================================================================

/**
 * Pagination params schema
 */
export const paginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationParamsSchema>;

/**
 * Paginated response schema factory
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });
}

// =============================================================================
// Search & Filter Schemas
// =============================================================================

/**
 * Search params schema
 */
export const searchParamsSchema = paginationParamsSchema.extend({
  search: z.string().optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  startDate: dateStringSchema,
  endDate: dateStringSchema,
});

export type DateRange = z.infer<typeof dateRangeSchema>;

/**
 * Sort params schema
 */
export const sortParamsSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type SortParams = z.infer<typeof sortParamsSchema>;

// =============================================================================
// Status Schemas
// =============================================================================

/**
 * Common request status
 */
export const requestStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type RequestStatus = z.infer<typeof requestStatusSchema>;

/**
 * Common entity status
 */
export const entityStatusSchema = z.enum(["active", "inactive"]);
export type EntityStatus = z.infer<typeof entityStatusSchema>;

// =============================================================================
// File Schemas
// =============================================================================

/**
 * File metadata schema
 */
export const fileMetadataSchema = z.object({
  fileName: z.string(),
  fileSize: z.number().nonnegative(),
  fileType: z.string(),
  mimeType: z.string(),
});

export type FileMetadata = z.infer<typeof fileMetadataSchema>;

/**
 * Upload response schema
 */
export const uploadResponseSchema = z.object({
  id: z.number().or(z.string()),
  url: z.string().url(),
  fileName: z.string(),
  fileSize: z.number(),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;

// =============================================================================
// Timestamp Schemas
// =============================================================================

/**
 * Timestamps schema (for entities with created/updated timestamps)
 */
export const timestampsSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Timestamps = z.infer<typeof timestampsSchema>;

// =============================================================================
// API Response Schemas
// =============================================================================

/**
 * Success response schema
 */
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type SuccessResponse = z.infer<typeof successResponseSchema>;

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
  message: z.string(),
  detail: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
        code: z.string().optional(),
      }),
    )
    .optional(),
  code: z.string().optional(),
  status: z.number().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create an optional schema that defaults to undefined
 */
export function optional<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional();
}

/**
 * Create a nullable schema
 */
export function nullable<T extends z.ZodTypeAny>(schema: T) {
  return schema.nullable();
}

/**
 * Create a schema that accepts null or undefined and transforms to undefined
 */
export function nullish<T extends z.ZodTypeAny>(schema: T) {
  return schema.nullish();
}

export default {
  // Primitives
  nonEmptyString,
  emailSchema,
  urlSchema,
  uuidSchema,
  phoneSchema,
  positiveInt,
  nonNegativeInt,
  percentageSchema,

  // Dates
  dateStringSchema,
  datetimeStringSchema,
  coercedDateSchema,

  // Pagination
  paginationParamsSchema,
  searchParamsSchema,
  sortParamsSchema,
  dateRangeSchema,
  createPaginatedResponseSchema,

  // Status
  requestStatusSchema,
  entityStatusSchema,

  // Files
  fileMetadataSchema,
  uploadResponseSchema,

  // Timestamps
  timestampsSchema,

  // API Responses
  successResponseSchema,
  errorResponseSchema,
};
