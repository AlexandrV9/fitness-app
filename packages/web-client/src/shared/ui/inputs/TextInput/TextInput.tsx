import cx from "clsx";
import { useId } from "react";

import { Typography } from "../../Typography";
import typographyStyles from "../../Typography/Typography.module.css";
import { ActionButton, type ActionButtonProps } from "./ActionButton";
import styles from "./TextInput.module.css";

export const SizeVariant = {
  s: "s",
  m: "m",
  l: "l",
  xl: "xl",
} as const;

export type TextInputProps = Omit<React.ComponentPropsWithoutRef<"input">, "size"> & {
  inputClassName?: string;
  label?: React.ReactNode;
  placeholder?: string;
  name?: string;
  hintMessage?: string;
  error?: boolean;
  errorMessage?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  ref?: React.Ref<HTMLInputElement>;
  size?: keyof typeof SizeVariant;
  value?: string | number;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  actionButtonProps?: ActionButtonProps;
  fullWidth?: boolean;
};

export const TextInput = ({
  className,
  inputClassName,
  ref,
  type,
  name,
  label,
  style,
  hintMessage,
  error,
  errorMessage,
  leftSection,
  rightSection,
  value,
  autoComplete,
  size = "l",
  onChange,
  onBlur,
  onKeyDown,
  actionButtonProps,
  disabled,
  fullWidth,
  ...props
}: TextInputProps) => {
  const id = useId();
  const hint = errorMessage ?? hintMessage;

  return (
    <div
      className={cx(
        styles.field,
        styles.size,
        fullWidth && styles.fullWidth,
        size && styles[`size__${size}`],
        (actionButtonProps || label) && styles.hasLabel,
        hint && styles.hasHint,
        {
          [typographyStyles.h_5]: size === "xl" || size === "l",
          [typographyStyles.text_2]: size === "m",
          [typographyStyles.text_3]: size === "s",
        },
        className,
      )}
      style={style}
    >
      <input
        className={cx(styles.input, inputClassName, error && styles.error)}
        ref={ref}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        type={type}
        autoComplete={autoComplete}
        id={id}
        disabled={disabled}
        aria-invalid={error || undefined}
        aria-describedby={hint ? (props.id ?? id) + "-hint" : undefined}
        onKeyDown={onKeyDown}
        {...props}
      />
      {leftSection ? (
        <div className={cx(styles.leftSection, error && styles.error)}>{leftSection}</div>
      ) : null}
      {rightSection ? (
        <div className={cx(styles.rightSection, error && styles.error)}>{rightSection}</div>
      ) : null}
      {label && (
        <Typography
          as="label"
          className={cx(styles.label, typographyStyles.text_2)}
          htmlFor={props.id ?? id}
          variant={size === "s" ? "text_controls" : "h_4"}
          hasTextOverflow
        >
          {label}
        </Typography>
      )}
      {actionButtonProps && (
        <ActionButton {...actionButtonProps} disabled={disabled || actionButtonProps.disabled} />
      )}
      {hint && (
        <Typography
          id={(props.id ?? id) + "-hint"}
          className={cx(styles.hint, error && styles.error)}
          variant="text_3"
          hasTextOverflow
        >
          {hint}
        </Typography>
      )}
    </div>
  );
};
