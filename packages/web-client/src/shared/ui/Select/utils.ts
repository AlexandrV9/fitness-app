import type {
  MultiValue,
  ObjectOption,
  Option,
  OptionValue,
  PlainOption,
  SingleValue,
} from "./types";

export const getOptionValue = (option: Option): OptionValue => {
  return typeof option === "string" || typeof option === "number" ? option : option.value;
};

export const getOptionText = (option: Option) => {
  return typeof option === "string" || typeof option === "number" ? option : option.label;
};

export function isMultiValue<Option, IsMulti extends boolean>(
  isMulti: IsMulti | undefined,
  value: MultiValue<Option> | SingleValue<Option>,
): value is MultiValue<Option> {
  return !!isMulti && Array.isArray(value);
}

export function isPlainOptions(options: Option[]): options is PlainOption[] {
  return options.every(
    (option) => typeof option === "string" || typeof option === "number",
  );
}

export const transformOptionValue = (
  value?: Option | Option[] | null,
  options?: Option[],
): ObjectOption | ObjectOption[] | null => {
  if (!value) return null;

  if (Array.isArray(value)) {
    return value.map((item) => transformValueToObjectValue(item, options));
  }

  return transformValueToObjectValue(value, options);
};

export const transformValueToObjectValue = (
  value: Option,
  options?: Option[],
): ObjectOption => {
  if (typeof value === "object") {
    return value;
  }

  const selectedOption = options?.find((option) => {
    if (typeof option === "object" && option.value === value) {
      return true;
    }

    if (
      (typeof option === "string" && option === value) ||
      (typeof option === "number" && option === value)
    ) {
      return true;
    }

    return false;
  });

  const label =
    typeof selectedOption === "object" ? selectedOption.label : String(selectedOption);

  return { value, label: label ?? String(value) };
};

export const transformOptionsToObjectOptions = (values: Option[]): ObjectOption[] => {
  return values.map((item) => {
    if (typeof item === "object") {
      return item;
    }

    return { value: item, label: String(item) };
  });
};

export const getValueAsArray = (
  value: ObjectOption | ObjectOption[] | null,
): ObjectOption[] => {
  if (value === null) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

export const toPlainSelectValue = (value: Option | Option[] | null | undefined): string => {
  if (value == null || Array.isArray(value)) {
    return "";
  }

  return String(getOptionValue(value));
};
