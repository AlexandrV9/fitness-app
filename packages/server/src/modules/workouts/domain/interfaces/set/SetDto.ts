export type SetStatusDto = "pending" | "completed" | "skipped";

export type SetStatus = "pending" | "completed" | "skipped";

export type SetParameterValues = Record<string, number | string | boolean>;

export type SetResultInput =
  | { status: "completed"; parameterValues: unknown }
  | { status: "skipped" };

export type SetResult = {
  status: Exclude<SetStatus, "pending">;
  parameterValues: SetParameterValues;
};

/**
 * Один подход в упражнении тренировки
 */
export type SetDto = {
  id: string;
  /**
   * Номер подхода в упражнении
   */
  setNumber: number;
  status: SetStatusDto;
  /**
   * Значения одного подхода (вес, повторы и т.д)
   * (То, что реально ввели)
   */
  parameterValues: Record<string, number | string | boolean>;
};
