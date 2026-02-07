import { getInitData } from "../lib/telegram";

type ErrorPayload = {
  message?: string;
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
  if (initData) {
    headers.set("X-Tg-Init-Data", initData);
  }

  return headers;
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data: unknown = await response.json().catch(() => null);

    if (data && typeof data === "object" && "message" in data) {
      const payload = data as ErrorPayload;
      if (typeof payload.message === "string") {
        return payload.message;
      }
    }

    if (data !== null) {
      return JSON.stringify(data);
    }
  }

  const text = await response.text().catch(() => "");
  if (text) {
    return text;
  }

  return `Request failed with status ${response.status}`;
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
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }

  return parseResponse<T>(response);
};
