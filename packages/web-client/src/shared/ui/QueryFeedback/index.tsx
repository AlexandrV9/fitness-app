import { getErrorMessage } from "~/shared/api/getErrorMessage";

import { Button } from "../Button";
import { Flex } from "../Flex";
import { Typography } from "../Typography";

export function QueryFeedback({
  isPending,
  error,
  onRetry,
}: {
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <Flex direction="column" rowGap={12} role="alert">
        <Typography>{getErrorMessage(error)}</Typography>
        <Button variant="outline" onClick={onRetry}>
          Повторить
        </Button>
      </Flex>
    );
  }
  return isPending ? <Typography as="output">Загрузка…</Typography> : null;
}
