export type WorkoutFieldErrorCode =
  | "REQUIRED"
  | "INVALID_TYPE"
  | "OUT_OF_RANGE"
  | "INVALID_LENGTH"
  | "UNKNOWN_FIELD"
  | "DUPLICATE_KEY"
  | "INVALID_KEY"
  | "UNEXPECTED_KEY"
  | "INVALID_FIELD_CONFIG";

export type WorkoutFieldError = {
  key: string;
  code: WorkoutFieldErrorCode;
};
