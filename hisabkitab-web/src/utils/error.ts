import type { AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return (
    axiosError?.response?.data?.message ??
    axiosError?.message ??
    fallback
  );
}
