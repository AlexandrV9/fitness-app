export type AuthUserDTO = {
  id: string;
  login: string;
};

export type AuthSessionDTO = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDTO;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  message?: string;
  data?: unknown;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
