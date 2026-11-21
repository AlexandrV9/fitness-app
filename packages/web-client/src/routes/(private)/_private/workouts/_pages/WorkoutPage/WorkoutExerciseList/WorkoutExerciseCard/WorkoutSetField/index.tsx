import { useId, useState } from "react";

import { parameterLabel } from "~/features/fitness/parameters";
import { Flex, TextInput, Typography } from "~/shared/ui";
import { MinusButton, PlusButton } from "~/shared/ui/сontrols";

import styles from "./WorkoutSetField.module.css";

import type { ParameterField } from "~/shared/api/fitnessTypes";

type Props = {
  field: ParameterField;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

export function WorkoutSetField({ field, value, error, disabled, onChange }: Props) {
  const id = useId();
  const [rejected, setRejected] = useState(false);
  const label = parameterLabel(field);

  function step(direction: number, amount: number) {
    const current = value === "" ? 0 : Number(value);
    const next = (Number.isFinite(current) ? current : 0) + direction * amount;
    setRejected(false);
    onChange(String(Math.min(field.max ?? 999, Math.max(field.min ?? 0, next))));
  }

  function renderNumeric(amount: number, inputMode: "numeric" | "decimal") {
    return (
      <div className={styles.field}>
        <Typography
          as="label"
          htmlFor={id}
          variant="h_5"
          className={styles.label}
          hasTextOverflow
          title={label}
        >
          {label}
        </Typography>
        <Flex columnGap={12}>
          <TextInput
            id={id}
            type="number"
            size="m"
            value={value}
            className={styles.inputWrapper}
            error={Boolean(error) || rejected}
            disabled={disabled}
            placeholder="—"
            autoComplete="off"
            min={field.min}
            max={field.max}
            step={amount}
            inputMode={inputMode}
            onChange={(event) => {
              const input = event.target;
              if (
                input.validity.badInput ||
                (input.value !== "" && Number(input.value) > (field.max ?? 999))
              ) {
                input.value = value;
                setRejected(true);
                return;
              }
              setRejected(false);
              onChange(input.value);
            }}
            onBlur={() => setRejected(false)}
          />
          <Flex align="center" columnGap={12}>
            <MinusButton
              disabled={disabled || value === "" || Number(value) <= (field.min ?? 0)}
              onClick={() => step(-1, amount)}
            />
            <PlusButton
              disabled={disabled || (value !== "" && Number(value) >= (field.max ?? 999))}
              onClick={() => step(1, amount)}
            />
          </Flex>
        </Flex>
      </div>
    );
  }

  if (field.type === "boolean" || field.type === "string" || field.type === "text") {
    return null;
  }

  if (field.type === "integer") {
    return renderNumeric(1, "numeric");
  }

  if (field.type === "number") {
    return renderNumeric(0.5, "decimal");
  }

  return null;
}
