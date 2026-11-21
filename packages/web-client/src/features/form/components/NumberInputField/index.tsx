import { NumberInput } from "~/shared/ui";

import { useField } from "../../hooks";

import type { FieldValues, Path, PathValue, UseControllerProps } from "react-hook-form";

import type { NumberInputProps } from "~/shared/ui";

type Props<T extends FieldValues> = UseControllerProps<T> &
  Omit<NumberInputProps, "value" | "onChange" | "ref"> & {
    onChange?: (value: string) => void;
  };

export function NumberInputField<T extends FieldValues>({
  name,
  control,
  defaultValue = "" as PathValue<T, Path<T>>,
  onChange,
  disabled,
  rules,
  shouldUnregister,
  ...props
}: Props<T>) {
  const field = useField({
    name,
    control,
    defaultValue,
    onChange,
    disabled,
    rules,
    shouldUnregister,
  });
  return <NumberInput {...field} {...props} />;
}
