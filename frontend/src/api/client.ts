const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code = "API_ERROR",
    details?: unknown,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let body: ApiErrorBody | undefined;

    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = undefined;
    }

    throw new ApiError(
      body?.error?.message ?? "The request could not be completed.",
      response.status,
      body?.error?.code,
      body?.error?.details,
    );
  }

  return response.json() as Promise<T>;
}
