export class ApiError<T = unknown> extends Error {
  code?: number;
  data?: T;

  constructor(params: { message?: string; code?: number; data?: T }) {
    super(params.message ?? "Unknown error");

    this.name = "ApiError";
    this.code = params.code;
    this.data = params.data;
  }

  static fromResponse<T = unknown>(params: { message?: string; code?: number; data?: T }) {
    return new ApiError<T>(params);
  }
}
