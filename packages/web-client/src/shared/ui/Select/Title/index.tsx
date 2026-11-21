import { Badge } from "../../Badge";
import { Typography } from "../../Typography";
import type { ObjectOption, SelectProps, Value } from "../types";
import { isMultiValue } from "../utils";

import styles from "./Title.module.css";

export type TitleProps<T extends Value> = Pick<
  SelectProps<T>,
  "hasMultiSelect" | "placeholder" | "badgeColor"
> & {
  value: ObjectOption | ObjectOption[] | null;
  size: SelectProps<T>["buttonSize"];
};

export const Title = <T extends Value>({
  hasMultiSelect,
  value,
  placeholder,
  size,
  badgeColor,
}: TitleProps<T>) => {
  const isSingleValueSelect = !hasMultiSelect;
  const isArrayValue = isMultiValue(hasMultiSelect, value);
  const hasFilledMultiValue = isArrayValue && value?.length;
  const textSize = size === "s" ? "text_3" : "text_2";

  if (!isSingleValueSelect) {
    return (
      <Typography className={styles.container} variant={textSize}>
        {hasFilledMultiValue ? (
          <>
            {placeholder} <Badge color={badgeColor}>{value.length}</Badge>
          </>
        ) : (
          placeholder
        )}
      </Typography>
    );
  }

  const currentValue = value as ObjectOption | null;

  return (
    <Typography className={styles.container} variant={textSize}>
      {currentValue ? currentValue.label : placeholder}
    </Typography>
  );
};
