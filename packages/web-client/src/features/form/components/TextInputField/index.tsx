import {
  type FieldValues,
  type Path,
  type PathValue,
  type UseControllerProps,
} from "react-hook-form";

import { TextInput, type TextInputProps } from "~/shared/ui";

import { useField } from "../../hooks/useField";

export type TextInputFieldProps<T extends FieldValues = FieldValues> =
  UseControllerProps<T> &
    Omit<TextInputProps, "value" | "defaultValue" | "ref">;

export const TextInputField = <T extends FieldValues>({
  name,
  control,
  defaultValue = "" as PathValue<T, Path<T>>,
  onChange,
  ...props
}: TextInputFieldProps<T>) => {
  const fieldProps = useField({ control, defaultValue, name, onChange });

  return <TextInput {...fieldProps} {...props} />;
};
