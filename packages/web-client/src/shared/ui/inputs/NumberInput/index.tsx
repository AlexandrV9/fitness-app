import cx from "clsx";
import { useId } from "react";

import { Typography } from "../../Typography";
import { MinusButton, PlusButton } from "../../сontrols";
import { TextInput } from "../TextInput";
import styles from "./NumberInput.module.css";

import type { TextInputProps } from "../TextInput";

export type NumberInputProps = Omit<
  TextInputProps,
  | "type"
  | "value"
  | "defaultValue"
  | "onChange"
  | "label"
  | "leftSection"
  | "rightSection"
  | "actionButtonProps"
> & {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
};

export function NumberInput({
  label,
  value,
  onChange,
  id,
  min,
  max,
  step = 1,
  disabled,
  hintMessage,
  errorMessage,
  error,
  className,
  inputClassName,
  ...props
}: NumberInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = inputId + "-hint";
  const raw = String(value ?? "");
  const current = raw === "" ? 0 : Number(raw);
  const lower = min === undefined ? Number.NEGATIVE_INFINITY : Number(min);
  const upper = max === undefined ? Number.POSITIVE_INFINITY : Number(max);
  const bounds = min !== undefined && max !== undefined ? min + "–" + max : "";
  const hint = errorMessage ?? [bounds, hintMessage].filter(Boolean).join(" · ");

  function change(direction: number) {
    const amount = step === "any" ? 1 : Number(step);
    const next = (Number.isFinite(current) ? current : 0) + direction * amount;
    onChange(String(Math.min(upper, Math.max(lower, next))));
  }

  return (
    <div className={cx(styles.field, className)}>
      <div className={styles.caption}>
        <Typography as="label" variant="text_2" htmlFor={inputId}>
          {label}
        </Typography>
        {hint && (
          <Typography
            id={hintId}
            variant="text_3"
            className={cx(styles.hint, error && styles.error)}
          >
            {hint}
          </Typography>
        )}
      </div>
      <div className={styles.controls}>
        <MinusButton
          className={styles.stepButton}
          aria-label={"Уменьшить " + label}
          disabled={disabled || raw === "" || current <= lower}
          onClick={() => change(-1)}
        />
        <TextInput
          {...props}
          id={inputId}
          type="number"
          size="m"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          error={error}
          aria-describedby={hint ? hintId : undefined}
          className={styles.input}
          inputClassName={cx(styles.value, inputClassName)}
          onChange={(event) => onChange(event.target.value)}
          fullWidth
        />
        <PlusButton
          className={styles.stepButton}
          aria-label={"Увеличить " + label}
          disabled={disabled || (raw !== "" && current >= upper)}
          onClick={() => change(1)}
        />
      </div>
    </div>
  );
}
