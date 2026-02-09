import { getInitData } from "../lib/telegram";

export type ApiError = Error & {
  code?: string;
  status?: number;
};

type ErrorPayload = {
  message?: string;
  code?: string;
};

const getBaseUrl = (): string => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  return envBaseUrl?.trim() || "http://localhost:8080";
};

const buildHeaders = (options?: RequestInit): Headers => {
  const headers = new Headers(options?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const initData = getInitData();
  if (initData.trim() !== "") {
    headers.set("X-Tg-Init-Data", initData);
  }

  return headers;
};

const parseErrorPayload = async (
  response: Response,
): Promise<{ message: string; code?: string }> => {
  const contentType = response.headers.get("content-type") ?? "";
  let errorCode: string | undefined;

  if (contentType.includes("application/json")) {
    const data: unknown = await response.json().catch(() => null);

    if (data && typeof data === "object") {
      const payload = data as ErrorPayload;
      if (typeof payload.code === "string") {
        errorCode = payload.code;
      }
      if (typeof payload.message === "string") {
        return { message: payload.message, code: errorCode };
      }
    }

    if (data !== null) {
      return { message: JSON.stringify(data), code: errorCode };
    }
  }

  const text = await response.text().catch(() => "");
  if (text) {
    return { message: text, code: errorCode };
  }

  return { message: `Request failed with status ${response.status}`, code: errorCode };
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text as T;
};

export const request = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const baseUrl = getBaseUrl();
  const url = new URL(path, baseUrl).toString();
  const headers = buildHeaders(options);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const payload = await parseErrorPayload(response);
    const error: ApiError = new Error(payload.message);
    error.code = payload.code;
    error.status = response.status;
    throw error;
  }

  return parseResponse<T>(response);
};
