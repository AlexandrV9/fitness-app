import { useCallback, useState } from "react";

type UseUncontrolledParams<T> = {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
};

export function useUncontrolled<T>({
  value,
  defaultValue,
  onChange,
}: UseUncontrolledParams<T>): [T, (next: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue as T);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? (value as T) : uncontrolledValue;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [currentValue, setValue];
}
