import { Button } from "../Button";
import { Flex } from "../Flex";
import { Typography } from "../Typography";

import type { Pagination as PaginationMeta } from "~/shared/api/fitnessTypes";

export function Pagination({
  pagination,
  onChange,
  disabled = false,
}: {
  pagination: PaginationMeta;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (pagination.totalPages < 2) return null;
  return (
    <Flex
      as="nav"
      aria-label="Страницы списка"
      align="center"
      wrap="wrap"
      columnGap={12}
      rowGap={8}
    >
      <Button
        size="m"
        variant="outline"
        disabled={disabled || !pagination.hasPrev}
        onClick={() => onChange(pagination.page - 1)}
      >
        Назад
      </Button>
      <Typography>
        Страница {pagination.page + 1} из {pagination.totalPages}
      </Typography>
      <Button
        size="m"
        variant="outline"
        disabled={disabled || !pagination.hasNext}
        onClick={() => onChange(pagination.page + 1)}
      >
        Далее
      </Button>
    </Flex>
  );
}
