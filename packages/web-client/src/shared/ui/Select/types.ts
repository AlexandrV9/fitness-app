import type { BadgeColor } from "../Badge";
import type { ButtonProps } from "../Button";
import type { DropdownContentProps } from "../Dropdown";
import type { SearchProps } from "../Search";
import type { TitleProps } from "./Title";

import type { CSSProperties, ReactNode } from "react";

export type OptionValue = string | number;

export type ObjectOption = {
  value: OptionValue;
  label: string;
  disabled?: boolean | null;
};

export type PlainOption = OptionValue;

export type Option = ObjectOption | PlainOption;

export type OptionProps = {
  className?: string;
  option: Option;
  size: keyof typeof SizeVariant;
};

export const SizeVariant = {
  s: "s",
  m: "m",
} as const;

export type SingleValue<Option> = Option | null;

export type MultiValue<Option> = Option[] | null;

export type Value = SingleValue<Option> | MultiValue<Option>;

export type BaseOptionComponentProps = {
  children: ReactNode;
  className?: string;
  size?: DropdownContentProps["size"];
  checked?: boolean;
  onChange?: (state?: string | boolean) => void;
};

export type OptionComponentProps = {
  children: ReactNode;
  className?: string;
  size?: DropdownContentProps["size"];
  checked?: boolean;
  onChange?: (state?: string | boolean) => void;
  option?: ObjectOption;
};

export type SelectProps<T extends Value> = {
  value?: T | null;
  defaultValue?: T | null;
  onChange?: (value: T) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  options?: Option[];
  className?: string;
  contentClassName?: string;
  titleRenderer?: (props: TitleProps<T>) => React.ReactNode;
  optionRenderer?: (props: OptionComponentProps) => React.ReactNode;
  style?: CSSProperties;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  searchInputFullWidth?: boolean;
  searchInputSize?: SearchProps["size"];
  onSearchInput?: (value: string) => void;
  onReset?: () => void;
  emptyText?: string;
  searchPlaceholder?: string;
  hasMultiSelect?: boolean;
  hasSearch?: boolean;
  hasSelectAll?: boolean;
  showSelectedFirst?: boolean;
  buttonSize?: Exclude<ButtonProps["size"], "xl">;
  contentSize?: DropdownContentProps["size"];
  badgeColor?: keyof typeof BadgeColor;
  itemsToScroll?: number;
  onOptionsEndReached?: () => Promise<void>;
  fullWidth?: boolean;
  withConfirmButton?: boolean;
  withResetAllButton?: boolean;
  dropdownBottomContent?: ReactNode;
  withinPortal?: boolean;
  selectAllLabel?: string;
  resetAllLabel?: string;
  applyLabel?: string;
};
