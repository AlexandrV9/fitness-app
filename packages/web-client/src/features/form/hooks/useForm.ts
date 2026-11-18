import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm as useReactHookForm,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";

export function useForm<
  Schema extends z.ZodType<FieldValues, FieldValues>,
  Context = unknown,
>(
  props: Omit<
    UseFormProps<z.input<Schema>, Context, z.output<Schema>>,
    "resolver"
  > & {
    schema?: Schema;
  }
): UseFormReturn<z.input<Schema>, Context, z.output<Schema>> {
  const { schema, mode, reValidateMode, ...rest } = props;

  return useReactHookForm<z.input<Schema>, Context, z.output<Schema>>({
    mode: mode ?? "onChange",
    reValidateMode: reValidateMode ?? "onChange",
    resolver: schema ? zodResolver(schema) : undefined,
    ...rest,
  });
}
