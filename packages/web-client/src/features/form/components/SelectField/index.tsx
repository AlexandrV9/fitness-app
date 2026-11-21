import {
  type FieldValues,
  type Path,
  type PathValue,
  type UseControllerProps,
} from "react-hook-form";

import {
  Select,
  toPlainSelectValue,
  type SelectProps,
  type Value as SelectValueType,
} from "~/shared/ui";

import { useField } from "../../hooks";

export type SelectFieldProps<T extends FieldValues, S extends SelectValueType> = Omit<
  SelectProps<S>,
  "value" | "defaultValue" | "ref"
> &
  UseControllerProps<T>;

export const SelectField = <T extends FieldValues, S extends SelectValueType = SelectValueType>({
  name,
  control,
  onChange,
  disabled,
  defaultValue,
  rules,
  shouldUnregister,
  ...props
}: SelectFieldProps<T, S>) => {
  const {
    value,
    onChange: fieldOnChange,
    disabled: fieldDisabled,
    name: _name,
    onBlur: _onBlur,
    ref: _ref,
    checked: _checked,
    errorMessage: _errorMessage,
    error: _error,
  } = useField({
    control,
    name,
    onChange,
    defaultValue,
    rules,
    shouldUnregister,
    disabled,
  });

  return (
    <Select
      {...props}
      value={value}
      disabled={fieldDisabled || disabled}
      onChange={(nextValue) => {
        fieldOnChange(toPlainSelectValue(nextValue) as PathValue<T, Path<T>>);
      }}
    />
  );
};
