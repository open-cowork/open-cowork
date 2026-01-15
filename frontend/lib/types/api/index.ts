/**
 * API Types - matching backend schemas
 * Auto-generated based on OpenAPI specification from /openapi.json
 */

// Response wrapper
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
}

// Export all API type modules
export * from "./session";
export * from "./run";
export * from "./callback";
export * from "./file";
