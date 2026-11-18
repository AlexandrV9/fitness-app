import { useId } from "react";

import styles from "./Select.module.css";

import type { ReactNode, SelectHTMLAttributes } from "react";

export function Select({
  label,
  children,
  id,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  const generatedId = useId();

  const inputId = id ?? generatedId;

  return (
    <label htmlFor={inputId} className={styles.field}>
      <span>{label}</span>
      <select {...props} id={inputId} className={styles.select}>
        {children}
      </select>
    </label>
  );
}
