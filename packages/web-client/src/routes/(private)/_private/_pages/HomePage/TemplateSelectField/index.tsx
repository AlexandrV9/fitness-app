import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import {
  type FieldValues,
  type Path,
  type PathValue,
  type UseControllerProps,
} from "react-hook-form";

import { TEMPLATES_QUERY_KEY } from "~/features/fitness/queries";
import { useField } from "~/features/form";
import { templatesService } from "~/shared/api/fitnessService";
import { Select, type ObjectOption, type SelectProps } from "~/shared/ui";

export type TemplateSelectFieldProps<TFieldValues extends FieldValues> = {
  onChange?: (templateId: string | null) => void;
} & Omit<
  SelectProps<ObjectOption>,
  "value" | "options" | "onChange" | "hasSearch" | "placeholder" | "label"
> &
  UseControllerProps<TFieldValues>;

export function TemplateSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  onChange,
  disabled,
  ...props
}: TemplateSelectFieldProps<TFieldValues>) {
  const fieldProps = useField({ control, name, onChange, disabled });

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: [TEMPLATES_QUERY_KEY],
    queryFn: ({ pageParam }) => templatesService.list(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
  });

  const options = useMemo((): ObjectOption[] => {
    return (
      data?.pages.flatMap((page) =>
        page.data.map((template) => ({
          value: template.id,
          label: template.name,
        })),
      ) ?? []
    );
  }, [data]);

  const selectedOption = useMemo(() => {
    if (!fieldProps.value) return null;

    return (
      options.find((option) => option.value === fieldProps.value) ?? {
        value: fieldProps.value,
        label: String(fieldProps.value),
      }
    );
  }, [fieldProps.value, options]);

  const handleChange = useCallback(
    (value: ObjectOption | null) => {
      fieldProps.onChange(
        (value ? value.value : null) as PathValue<TFieldValues, Path<TFieldValues>>,
      );
    },
    [fieldProps],
  );

  useEffect(() => {
    if (fieldProps.value || options.length === 0) return;
    handleChange(options[0]);
  }, [fieldProps.value, handleChange, options]);

  const handleFetchNextPage = useCallback(async () => {
    if (isFetching) return;
    await fetchNextPage();
  }, [fetchNextPage, isFetching]);

  return (
    <Select
      {...fieldProps}
      value={selectedOption}
      label="Выберите тренировку"
      placeholder="Выберите шаблон"
      fullWidth
      withinPortal={false}
      disabled={fieldProps.disabled || disabled}
      onChange={handleChange}
      onOptionsEndReached={hasNextPage ? handleFetchNextPage : undefined}
      {...props}
      options={options}
    />
  );
}
