// types/api.types.ts

// Generic error (ApiError)
interface ApiErrorData {
  success: false;
  message: string;
}

// Validation error (schema validation)
interface ApiValidationErrorData {
  success: false;
  errors: {
    field: string;
    message: string;
  }[];
}

export interface ApiErrorResponse {
  status: number;
  data: ApiErrorData | ApiValidationErrorData;
}

// Type guards
export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "data" in error
  );
}

export function isValidationError(
  data: ApiErrorData | ApiValidationErrorData,
): data is ApiValidationErrorData {
  return "errors" in data;
}

export function isMessageError(
  data: ApiErrorData | ApiValidationErrorData,
): data is ApiErrorData {
  return "message" in data;
}
