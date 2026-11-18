import axios from "axios";

const messages: Record<string, string> = {
  ACTIVE_WORKOUT_EXISTS: "У вас уже есть активная тренировка. Продолжите её на главной странице.",
  WORKOUT_FINISHED: "Тренировка уже завершена. Обновите страницу.",
  WORKOUT_EXERCISE_SKIPPED: "Это упражнение уже пропущено.",
  INVALID_WORKOUT_SET_VALUES: "Проверьте значения параметров подхода.",
  EXERCISE_USED_IN_WORKOUT_TEMPLATE: "Сначала удалите упражнение из шаблонов тренировок.",
  WORKOUT_TEMPLATE_EXERCISE_NOT_FOUND: "Упражнение удалено. Обновите состав шаблона.",
  WORKOUT_TEMPLATE_NOT_FOUND: "Шаблон тренировки не найден.",
  WORKOUT_NOT_FOUND: "Тренировка не найдена.",
  EXERCISE_NOT_FOUND: "Упражнение не найдено.",
  INVALID_CREDENTIALS: "Неверный логин или пароль.",
};

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Не удалось выполнить запрос. Попробуйте ещё раз.";
  }
  if (!error.response) {
    return "Не удалось связаться с сервером. Проверьте подключение и повторите запрос.";
  }
  const body = error.response.data;
  const code = typeof body === "string" ? body : (body?.code ?? body?.message);
  return messages[code] ?? "Не удалось выполнить запрос. Попробуйте ещё раз.";
}
