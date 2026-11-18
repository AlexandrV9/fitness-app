import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "~/shared/ui";

import { authManager } from "../../AuthManager";

export const SignOutButton = () => {
  const navigate = useNavigate();
  const hasPendingChanges = useIsMutating() > 0;
  const { mutate, isPending } = useMutation({
    mutationFn: () => authManager.signOut(),
    onSuccess: () => navigate({ to: "/signin" }),
  });
  return (
    <Button
      type="button"
      size="m"
      variant="outline"
      disabled={isPending || hasPendingChanges}
      onClick={() => {
        if (window.confirm("Выйти из аккаунта? Несохранённые изменения будут потеряны.")) mutate();
      }}
    >
      {isPending ? "Выход…" : "Выйти"}
    </Button>
  );
};
