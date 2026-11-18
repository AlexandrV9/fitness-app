import cn from "clsx";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import type { ChangeEvent, MouseEvent } from "react";

import { SearchIcon } from "../icons/Search";
import { TextInput, type TextInputProps } from "../inputs/TextInput";
import { RemoveButton } from "../сontrols";

import typographyStyles from "../Typography/Typography.module.css";
import styles from "./Search.module.css";

export type SearchProps = Omit<
  TextInputProps,
  "icon" | "onIconClick" | "label" | "errorMessage" | "hintMessage" | "onReset"
> & {
  onSearch?: (value: string) => void;
  onReset?: (event?: MouseEvent<HTMLButtonElement>) => void;
};

function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

export const Search = forwardRef<HTMLInputElement, SearchProps>(
  function SearchInput(
    { value, onReset, disabled, size, onSearch, onChange, fullWidth, ...props },
    ref
  ) {
    const isEmptyValue = value === "" || value === undefined;
    const onKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    };

    const debouncedChangeHandler = useDebouncedCallback(
      ((event: ChangeEvent<HTMLInputElement>) => {
        onSearch?.(event.target.value);
      }) as (event: ChangeEvent<HTMLInputElement>) => void,
      500
    );

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        if (onSearch) {
          debouncedChangeHandler(e);
        }
        onChange?.(e);
      },
      [debouncedChangeHandler, onChange, onSearch]
    );

    return (
      <div className={cn(styles.wrapper, fullWidth && styles.fullWidth)}>
        <TextInput
          ref={ref}
          className={cn(styles.input, typographyStyles.text_2)}
          value={value}
          onKeyDown={onKeyDown}
          rightSection={
            isEmptyValue ? (
              <SearchIcon size={12} />
            ) : (
              <RemoveButton className={styles.button} onClick={onReset} />
            )
          }
          size={size}
          disabled={disabled}
          onChange={handleChange}
          {...props}
          errorMessage={undefined}
          hintMessage={undefined}
          label={undefined}
          fullWidth={fullWidth}
        />
      </div>
    );
  }
);
