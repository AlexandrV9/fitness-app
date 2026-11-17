import { z } from "@hono/zod-openapi";

export const ErrorCodeSchema = z
  .object({
    code: z.string().optional(),
    message: z.string().optional(),
  })
  .openapi("ApiError");

export const bearerAuthSecurity: { bearerAuth: string[] }[] = [{ bearerAuth: [] }];

export const jsonBody = <T extends z.ZodType>(schema: T) => ({
  content: {
    "application/json": {
      schema,
    },
  },
});

export const jsonResponse = <T extends z.ZodType>(schema: T, description: string) => ({
  content: {
    "application/json": {
      schema,
    },
  },
  description,
});

export const IdParamSchema = z.object({
  id: z.uuid().openapi({ description: "Resource id" }),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().nonnegative().optional().default(0).openapi({
    description: "Zero-based page index",
  }),
  size: z.coerce.number().int().min(1).max(100).optional().default(20).openapi({
    description: "Page size",
  }),
});

export const PaginationMetaSchema = z
  .object({
    page: z.number().int(),
    limit: z.number().int(),
    totalCount: z.number().int(),
    totalPages: z.number().int(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  })
  .openapi("PaginationMeta");

export const successData = <T extends z.ZodType>(data: T, name?: string) => {
  const schema = z.object({
    success: z.literal(true),
    data,
  });

  return name ? schema.openapi(name) : schema;
};

export const successNullSchema = z
  .object({
    success: z.literal(true),
    data: z.null(),
  })
  .openapi("SuccessNull");
