import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { useProfileStore } from "@/store";

/**
 * Valid Axios config keys - only these properties will be passed to axios.
 * This prevents React Query options (like `select`) from being serialized as URL params.
 */
const AXIOS_CONFIG_KEYS = new Set([
  // Core request config
  "url",
  "method",
  "baseURL",
  "headers",
  "params",
  "data",
  "timeout",
  "timeoutErrorMessage",
  // Auth and credentials
  "withCredentials",
  "auth",
  "withXSRFToken",
  "xsrfCookieName",
  "xsrfHeaderName",
  // Response handling
  "responseType",
  "responseEncoding",
  "validateStatus",
  // Request/response transformation
  "transformRequest",
  "transformResponse",
  "paramsSerializer",
  // Upload/download progress
  "onUploadProgress",
  "onDownloadProgress",
  // Size limits
  "maxContentLength",
  "maxBodyLength",
  "maxRedirects",
  "maxRate",
  // Network config
  "socketPath",
  "transport",
  "httpAgent",
  "httpsAgent",
  "proxy",
  "decompress",
  // Cancellation
  "cancelToken",
  "signal",
  // Adapters and misc
  "adapter",
  "transitional",
  "env",
  "formSerializer",
  "lookup",
  "family",
]);

/**
 * Recursively strips function values and empty objects from params.
 * This prevents functions (like React Query's `select`) from being serialized
 * as URL params if they accidentally end up in the params object.
 *
 * Also removes empty objects/arrays that result from stripping functions,
 * to keep the URL clean.
 */
function stripFunctionsFromParams(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (typeof obj === "function") {
    return undefined;
  }

  if (Array.isArray(obj)) {
    const filtered = obj.map(stripFunctionsFromParams).filter((v) => v !== undefined);
    return filtered.length > 0 ? filtered : undefined;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value !== "function") {
      const sanitized = stripFunctionsFromParams(value);
      // Only include non-undefined values and non-empty objects
      if (sanitized !== undefined) {
        if (typeof sanitized === "object" && sanitized !== null && !Array.isArray(sanitized)) {
          // Skip empty objects
          if (Object.keys(sanitized).length > 0) {
            result[key] = sanitized;
          }
        } else {
          result[key] = sanitized;
        }
      }
    } else if (import.meta.env.DEV) {
      console.warn(
        `[axios] Stripped function "${key}" from params - this indicates a bug in how options are passed to the API`,
      );
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Sanitizes axios config by only keeping valid axios properties.
 * Drops unknown properties (like React Query's `select`) that would otherwise
 * be incorrectly serialized as URL params.
 *
 * Also strips functions from the `params` object as a safety measure.
 */
function sanitizeAxiosConfig(options: AxiosRequestConfig): AxiosRequestConfig {
  const result: AxiosRequestConfig = {};

  for (const [key, value] of Object.entries(options)) {
    if (AXIOS_CONFIG_KEYS.has(key)) {
      // Special handling for params - strip any functions that might have leaked
      if (key === "params" && value !== undefined) {
        const sanitizedParams = stripFunctionsFromParams(value);
        // Only include params if it has any keys left after stripping
        if (
          typeof sanitizedParams === "object" &&
          sanitizedParams !== null &&
          Object.keys(sanitizedParams).length > 0
        ) {
          (result as Record<string, unknown>)[key] = sanitizedParams;
        }
      } else {
        (result as Record<string, unknown>)[key] = value;
      }
    } else if (import.meta.env.DEV) {
      console.warn(`[axios] Dropped unknown property from request config: "${key}"`);
    }
  }

  return result;
}

function stripApiSuffix(url?: string): string {
  if (!url) return "";
  return url.replace(/\/api(?:\/v1)?\/?$/, "");
}

const resolvedBaseUrl = stripApiSuffix(import.meta.env.VITE_API_URL);

/**
 * Base Axios instance with default configuration
 */
export const AXIOS_INSTANCE = axios.create({
  // Orval-generated paths already include /api/v1.
  baseURL: resolvedBaseUrl || "",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor - automatically includes authentication token
 */
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    const token = useProfileStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor - handles authentication errors and token refresh
 */
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const responseStatus = error.response?.status;

    // Handle 401 Unauthorized
    if ((responseStatus === 401 || responseStatus === 403) && originalRequest) {
      // Clear token and profile on auth failure
      const { setToken, setProfile } = useProfileStore.getState();
      setToken("");
      setProfile(null);

      // Optionally redirect to sign-in (can be enabled based on requirements)
      // window.location.href = '/auth/sign-in';
    }

    return Promise.reject(error);
  },
);

/**
 * Custom Axios instance for Orval
 *
 * This mutator function is used by Orval-generated code to make API requests.
 * It wraps the base Axios instance and extracts the response data.
 *
 * @template T - The expected response data type
 * @param config - Axios request configuration
 * @param options - Additional Axios options (merged with config)
 * @returns Promise resolving to the response data
 *
 * @example
 * // This is used internally by Orval-generated hooks
 * const data = await customInstance<User>({ url: '/users/1', method: 'GET' });
 */
export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();

  // Sanitize options to prevent non-axios properties (like React Query's `select`)
  // from being serialized as URL params
  const safeConfig = sanitizeAxiosConfig(config);
  const safeOptions = options ? sanitizeAxiosConfig(options) : {};

  const promise = AXIOS_INSTANCE({
    ...safeConfig,
    ...safeOptions,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // Attach cancel method to promise for React Query signal support
  // @ts-expect-error - Adding cancel method to promise
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

/**
 * Error type for Axios errors
 * Used by Orval for proper error typing in generated code
 */
export type ErrorType<Error> = AxiosError<Error>;

/**
 * Body type for requests
 * Used by Orval for proper body typing in generated code
 */
export type BodyType<BodyData> = BodyData;

export default customInstance;
