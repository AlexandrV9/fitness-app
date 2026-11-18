import {
  useController,
  useFormContext,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

type UseFieldProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues> & {
  onChange?: (...event: any[]) => void;
};

export const useField = <TFieldValues extends FieldValues>({
  control,
  name,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  onChange: customOnChange,
}: UseFieldProps<TFieldValues>) => {
  const context = useFormContext<TFieldValues>();
  const {
    field: { value, onChange: fieldOnChange, ...field },
    fieldState,
  } = useController<TFieldValues>({
    name,
    control: control ?? context?.control,
    defaultValue,
    rules,
    shouldUnregister,
    disabled,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onChange = (...event: any[]) => {
    fieldOnChange(...event);
    customOnChange?.(...event);
  };

  return {
    ...field,
    value,
    checked: value,
    errorMessage: fieldState.error?.message,
    error: Boolean(fieldState.error),
    onChange,
  };
};
