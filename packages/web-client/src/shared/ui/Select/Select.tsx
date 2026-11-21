import { Portal } from "@ark-ui/react/portal";
import {
  Select as BaseSelect,
  createListCollection,
  type SelectRootProps,
} from "@ark-ui/react/select";
import cn from "clsx";
import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent,
} from "react";

import { useInView } from "~/shared/libs/useInView";
import { useUncontrolled } from "~/shared/libs/useUncontrolled";

import { Button } from "../Button";
import { Content as DropdownContent, Trigger as DropdownTrigger } from "../Dropdown";
import { Toggle } from "../inputs/Toggle";
import { Search } from "../Search";
import { Typography } from "../Typography";
import { Title } from "./Title";
import type { ObjectOption, SelectProps, Value } from "./types";
import {
  getOptionText,
  getOptionValue,
  isMultiValue,
  isPlainOptions,
  transformOptionsToObjectOptions,
  transformOptionValue,
} from "./utils";

import styles from "./Select.module.css";

const minimalItemsAmountForSortingEnabled = 10;

const defaultPositioning: SelectRootProps<ObjectOption>["positioning"] = {
  placement: "bottom",
  gutter: 8,
  sameWidth: true,
  flip: false,
  fitViewport: true,
};

const isEqual = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

export const Select = <T extends Value>({
  value: initialValue,
  defaultValue,
  onChange,
  placeholder,
  label,
  disabled,
  options = [],
  className,
  contentClassName,
  inputValue: initialInputValue,
  searchInputFullWidth = false,
  onInputChange,
  onSearchInput,
  searchPlaceholder,
  titleRenderer: TitleRenderer = Title,
  optionRenderer: OptionRenderer = Toggle,
  searchInputSize = "l",
  buttonSize = "m",
  contentSize = "s",
  hasMultiSelect = false,
  hasSelectAll = false,
  showSelectedFirst,
  hasSearch = false,
  badgeColor,
  itemsToScroll: itemsToScroll = 6,
  withinPortal = true,
  onOptionsEndReached,
  style,
  fullWidth = false,
  withConfirmButton = false,
  withResetAllButton = false,
  dropdownBottomContent = null,
  selectAllLabel = "Выбрать все",
  resetAllLabel = "Сбросить",
  applyLabel = "Применить",
}: SelectProps<T>) => {
  const _initialValue = transformOptionValue(initialValue, options);
  const _defaultValue = transformOptionValue(defaultValue, options);

  const handleChangeExternalValue = (value: ObjectOption[] | ObjectOption | null) => {
    if (value === null) {
      onChange?.(value as T);
      return;
    }

    let newValue: T;
    const isPlain = isPlainOptions(options);

    if (Array.isArray(value)) {
      newValue = isPlain ? (value.map(getOptionValue) as T) : (value as T);
    } else {
      newValue = isPlain ? (getOptionValue(value) as T) : (value as T);
    }

    onChange?.(newValue);
  };

  const [innerValue, setInnerValue] = useState(
    defaultValue !== undefined ? _defaultValue : _initialValue,
  );

  const [value, setValue] = useUncontrolled({
    onChange: withConfirmButton ? setInnerValue : handleChangeExternalValue,
    value: _initialValue,
    defaultValue: _defaultValue,
  });

  const currentValue = withConfirmButton ? innerValue : value;

  const [inputValue, setInputValue] = useUncontrolled({
    value: initialInputValue,
    defaultValue: initialInputValue || "",
    onChange: onInputChange,
  });

  const [isOpen, setIsOpen] = useState(false);
  const { ref: fetchRef, inView: isLastElementInView } = useInView();
  const isArrayValue = isMultiValue(hasMultiSelect, currentValue);

  const rootValues = currentValue
    ? Array.isArray(currentValue)
      ? currentValue.map(getOptionValue).map(String)
      : [String(getOptionValue(currentValue))]
    : [];

  const collection = useMemo(() => {
    return createListCollection<ObjectOption>({
      items: transformOptionsToObjectOptions(options),
    });
  }, [options]);

  const visibleOptions = useMemo(() => {
    return collection.items.filter(({ label: optionLabel }) =>
      inputValue === "" || !hasSearch
        ? true
        : String(optionLabel).toLowerCase().includes(inputValue.toLowerCase()),
    );
  }, [collection.items, inputValue, hasSearch]);

  const shouldEnableSorting =
    showSelectedFirst !== undefined &&
    isArrayValue &&
    currentValue?.length &&
    currentValue.length >= minimalItemsAmountForSortingEnabled;

  const shouldSeparatelyShowSelectedOptions =
    shouldEnableSorting && isArrayValue && currentValue?.length !== 0;

  const shouldShowSelectAll = hasMultiSelect && hasSelectAll;
  const areAllOptionsSelected = isArrayValue && currentValue?.length === options.length;
  const hasHeaderProperties = hasSearch || shouldShowSelectAll;

  const selectedOptions = useMemo(() => {
    if (!shouldSeparatelyShowSelectedOptions) {
      return [];
    }

    return visibleOptions.filter((option) =>
      isArrayValue
        ? currentValue?.some((item) => getOptionValue(item) === option.value)
        : false,
    );
  }, [shouldSeparatelyShowSelectedOptions, visibleOptions, isArrayValue, currentValue]);

  const availableOptions = useMemo(() => {
    return shouldSeparatelyShowSelectedOptions
      ? visibleOptions.filter((option) =>
          currentValue?.every((item) => getOptionValue(item) !== option.value),
        )
      : visibleOptions;
  }, [visibleOptions, currentValue, shouldSeparatelyShowSelectedOptions]);

  const handleVisibilityChange: SelectRootProps<ObjectOption>["onOpenChange"] = (event) => {
    setIsOpen(event.open);
  };

  const handleValueChange: SelectRootProps<ObjectOption>["onValueChange"] = (values) => {
    setValue(hasMultiSelect ? values.items : values.items[0]);

    if (onInputChange && !hasMultiSelect) {
      setInputValue("");
      onSearchInput?.("");
    }
  };

  const handleSetInputValue = (event?: ChangeEvent<HTMLInputElement>) => {
    setInputValue?.(event?.target.value ?? "");
  };

  const resetInputValue = (event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    setInputValue("");
    onSearchInput?.("");
  };

  const handleClickConfirmButton = () => {
    setIsOpen(false);
    handleChangeExternalValue(innerValue);

    if (hasSearch) {
      setInputValue("");
      onSearchInput?.("");
    }
  };

  const handleClickResetAllButton = () => {
    if (hasSearch) {
      setInputValue("");
      onSearchInput?.("");
    }

    if (withResetAllButton && withConfirmButton) {
      setValue(_initialValue);
      return;
    }

    setValue(null);
  };

  const handleToggleSelectAll = () => {
    if (!hasMultiSelect) {
      return;
    }

    if (isArrayValue && currentValue?.length === options.length) {
      setValue(null);
    } else {
      setValue(transformOptionValue(options));
    }
  };

  const hasChanges = !isEqual(initialValue, innerValue);
  const shouldShowContentFooter = withResetAllButton || withConfirmButton;
  const DropdownWrapper = withinPortal ? Portal : Fragment;

  useEffect(() => {
    if (withConfirmButton) {
      setInnerValue(transformOptionValue(initialValue));
    }
  }, [withConfirmButton, initialValue]);

  useEffect(() => {
    if (isLastElementInView && onOptionsEndReached) {
      onOptionsEndReached();
    }
  }, [onOptionsEndReached, isLastElementInView]);

  return (
    <div
      className={cn(className, styles.wrapper, fullWidth && styles.fullWidth)}
      style={style}
    >
      <BaseSelect.Root
        open={isOpen}
        collection={collection}
        onValueChange={handleValueChange}
        onOpenChange={handleVisibilityChange}
        multiple={hasMultiSelect}
        value={rootValues}
        className={styles.root}
        positioning={defaultPositioning}
      >
        <BaseSelect.Control className={styles.control}>
          {label && (
            <BaseSelect.Label className={styles.label} data-disabled={disabled} asChild>
              <Typography variant="text_2" as="label">
                {label}
              </Typography>
            </BaseSelect.Label>
          )}
          <BaseSelect.Trigger disabled={disabled} asChild>
            <DropdownTrigger
              className={styles.trigger}
              size={buttonSize}
              open={isOpen}
              variant="outline"
              data-fill={Boolean(isArrayValue ? currentValue?.length : currentValue)}
              fullWidth
            >
              <TitleRenderer
                hasMultiSelect={hasMultiSelect}
                value={value}
                placeholder={placeholder}
                size={buttonSize}
                badgeColor={badgeColor}
              />
            </DropdownTrigger>
          </BaseSelect.Trigger>
        </BaseSelect.Control>
        <DropdownWrapper>
          <BaseSelect.Positioner style={{ zIndex: 4 }}>
            <BaseSelect.Content asChild>
              <DropdownContent className={cn(styles.content, contentClassName)} size={contentSize}>
                {hasHeaderProperties && (
                  <div className={styles.header}>
                    {hasSearch && (
                      <Search
                        size={searchInputSize}
                        fullWidth={searchInputFullWidth}
                        onSearch={onSearchInput}
                        onChange={handleSetInputValue}
                        onReset={resetInputValue}
                        value={inputValue}
                        placeholder={searchPlaceholder}
                      />
                    )}
                    {shouldShowSelectAll && (
                      <OptionRenderer
                        className={styles.item}
                        size={contentSize}
                        data-size={contentSize}
                        onChange={handleToggleSelectAll}
                        checked={areAllOptionsSelected}
                      >
                        {selectAllLabel}
                      </OptionRenderer>
                    )}
                    <div className={styles.divider} />
                  </div>
                )}
                <div
                  className={styles.list}
                  data-size={contentSize}
                  style={
                    {
                      "--items-to-scroll": itemsToScroll,
                    } as CSSProperties
                  }
                >
                  {selectedOptions.map((item, index) => (
                    <BaseSelect.Item key={index} item={item}>
                      <OptionRenderer
                        className={styles.item}
                        size={contentSize}
                        data-size={contentSize}
                        checked
                        option={item}
                      >
                        {getOptionText(item)}
                      </OptionRenderer>
                    </BaseSelect.Item>
                  ))}
                  {availableOptions.map((item, index) => {
                    const checked = isArrayValue
                      ? currentValue?.some(
                          (valueItem) => getOptionValue(valueItem) === item.value,
                        )
                      : item.value === currentValue?.value;

                    return (
                      <BaseSelect.Item key={index} item={item}>
                        <OptionRenderer
                          key={index}
                          className={styles.item}
                          size={contentSize}
                          data-size={contentSize}
                          checked={checked}
                          option={item}
                        >
                          {getOptionText(item)}
                        </OptionRenderer>
                      </BaseSelect.Item>
                    );
                  })}
                  <div ref={fetchRef} className={styles.notifier} />
                </div>
                {shouldShowContentFooter && (
                  <div className={styles.contentFooter}>
                    {withResetAllButton && (
                      <Button
                        size="m"
                        variant="outline"
                        color="alert"
                        onClick={handleClickResetAllButton}
                        disabled={!hasChanges}
                      >
                        {resetAllLabel}
                      </Button>
                    )}
                    {withConfirmButton && (
                      <Button size="m" onClick={handleClickConfirmButton}>
                        {applyLabel}
                      </Button>
                    )}
                  </div>
                )}
                {dropdownBottomContent}
              </DropdownContent>
            </BaseSelect.Content>
          </BaseSelect.Positioner>
        </DropdownWrapper>
        <BaseSelect.HiddenSelect />
      </BaseSelect.Root>
    </div>
  );
};
