import { expect } from "vitest";

export type TestApp = {
  request: (
    input: string | URL | Request,
    init?: RequestInit,
  ) => Response | Promise<Response>;
};

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** Valid UUID v4 that is extremely unlikely to exist in DB. */
export const MISSING_UUID = "550e8400-e29b-41d4-a716-446655440000";

export const jsonRequest = (
  app: TestApp,
  method: string,
  path: string,
  options?: {
    token?: string;
    body?: unknown;
    query?: Record<string, string | number | undefined>;
  },
) => {
  const url = new URL(path, "http://localhost");
  for (const [key, value] of Object.entries(options?.query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const headers = new Headers();
  if (options?.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  if (options?.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  return app.request(url.pathname + url.search, {
    method,
    headers,
    body: options?.body === undefined ? undefined : JSON.stringify(options.body),
  });
};

export const readJson = async <T = Json>(response: Response): Promise<T> => {
  return (await response.json()) as T;
};

export const expectStatus = async (response: Response, status: number) => {
  if (response.status !== status) {
    const body = await response.clone().text();
    throw new Error(`Expected status ${status}, got ${response.status}: ${body}`);
  }
};

export const expectErrorMessage = async (
  response: Response,
  status: number,
  message: string,
) => {
  await expectStatus(response, status);
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await readJson<{ message?: string }>(response);
    expect(body).toMatchObject({ message });
    return;
  }

  expect(await response.text()).toBe(message);
};

export const expectErrorCode = async (response: Response, status: number, code: string) => {
  await expectStatus(response, status);
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await readJson<{ code?: string }>(response);
    expect(body).toMatchObject({ code });
    return;
  }

  expect(await response.text()).toBe(code);
};
