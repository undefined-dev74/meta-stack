/**
 * Response Validator
 *
 * Utilities for validating API responses with Zod schemas.
 * Provides safe parsing with detailed error logging.
 */

import { z, type ZodError, type ZodSchema } from "zod";

// =============================================================================
// Types
// =============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: ZodError;
  issues?: ValidationIssue[];
}

export interface ValidationIssue {
  path: string;
  message: string;
  code: string;
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate data against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with data or error details
 *
 * @example
 * const result = validate(userSchema, apiResponse);
 * if (result.success) {
 *   console.log(result.data); // Typed data
 * } else {
 *   console.error(result.issues); // Validation issues
 * }
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const issues: ValidationIssue[] = result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));

  return {
    success: false,
    error: result.error,
    issues,
  };
}

/**
 * Validate data and throw on failure
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and typed data
 * @throws ZodError if validation fails
 *
 * @example
 * try {
 *   const user = validateOrThrow(userSchema, apiResponse);
 * } catch (error) {
 *   if (error instanceof ZodError) {
 *     console.error('Validation failed:', error.issues);
 *   }
 * }
 */
export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validate data with a default fallback on failure
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param defaultValue - Value to return if validation fails
 * @returns Validated data or default value
 *
 * @example
 * const users = validateOrDefault(usersArraySchema, response, []);
 */
export function validateOrDefault<T>(schema: ZodSchema<T>, data: unknown, defaultValue: T): T {
  const result = schema.safeParse(data);
  return result.success ? result.data : defaultValue;
}

/**
 * Validate response and log errors in development
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param context - Context string for logging
 * @returns Validation result
 */
export function validateWithLogging<T>(schema: ZodSchema<T>, data: unknown, context: string): ValidationResult<T> {
  const result = validate(schema, data);

  if (!result.success && import.meta.env.DEV) {
    console.group(`[Validation Error] ${context}`);
    console.error("Data:", data);
    console.error("Issues:", result.issues);
    console.groupEnd();
  }

  return result;
}

/**
 * Create a validated response handler for API hooks
 *
 * @param schema - Zod schema to validate against
 * @returns Function that validates response data
 *
 * @example
 * const validateUser = createResponseValidator(userSchema);
 *
 * // In React Query
 * useQuery({
 *   queryKey: ['user', id],
 *   queryFn: async () => {
 *     const response = await api.get(`/users/${id}`);
 *     return validateUser(response.data);
 *   },
 * });
 */
export function createResponseValidator<T>(schema: ZodSchema<T>) {
  return (data: unknown): T => {
    const result = schema.safeParse(data);

    if (!result.success) {
      if (import.meta.env.DEV) {
        console.error("[API Response Validation Failed]", {
          data,
          errors: result.error.issues,
        });
      }
      // In development, throw to surface issues
      // In production, log and return the data as-is (with type assertion)
      if (import.meta.env.DEV) {
        throw result.error;
      }
    }

    return result.success ? result.data : (data as T);
  };
}

/**
 * Create a partial validator that only validates present fields
 *
 * @param schema - Zod schema (will be made partial)
 * @returns Partial validation function
 */
export function createPartialValidator<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  const partialSchema = schema.partial();
  return (data: unknown) => partialSchema.parse(data);
}

// =============================================================================
// Array Validation
// =============================================================================

/**
 * Validate an array of items
 *
 * @param schema - Zod schema for array items
 * @param data - Array data to validate
 * @returns Object with valid items and any invalid items with errors
 */
export function validateArray<T>(
  schema: ZodSchema<T>,
  data: unknown[],
): {
  valid: T[];
  invalid: Array<{ index: number; data: unknown; error: ZodError }>;
} {
  const valid: T[] = [];
  const invalid: Array<{ index: number; data: unknown; error: ZodError }> = [];

  data.forEach((item, index) => {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({ index, data: item, error: result.error });
    }
  });

  return { valid, invalid };
}

/**
 * Validate an array and filter out invalid items
 *
 * @param schema - Zod schema for array items
 * @param data - Array data to validate
 * @returns Array of valid items only
 */
export function validateArrayFilter<T>(schema: ZodSchema<T>, data: unknown[]): T[] {
  return data
    .map((item) => schema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => (result as { success: true; data: T }).data);
}

// =============================================================================
// Exports
// =============================================================================

export default {
  validate,
  validateOrThrow,
  validateOrDefault,
  validateWithLogging,
  createResponseValidator,
  createPartialValidator,
  validateArray,
  validateArrayFilter,
};
