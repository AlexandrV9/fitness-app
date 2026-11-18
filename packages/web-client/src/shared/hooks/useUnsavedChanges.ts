import { useBlocker } from "@tanstack/react-router";

export function useUnsavedChanges(hasChanges: boolean) {
  useBlocker({
    shouldBlockFn: () =>
      hasChanges && !window.confirm("Есть несохранённые изменения. Покинуть страницу?"),
    enableBeforeUnload: hasChanges,
  });
}
