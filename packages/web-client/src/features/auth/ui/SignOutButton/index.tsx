import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authManager } from "../../AuthManager";

export const SignOutButton = () => {
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: () => authManager.signOut(),
    onSuccess: () => {
      void navigate({ to: "/signin" });
    },
  });

  return (
    <button type="button" disabled={isPending} onClick={() => mutate()}>
      {isPending ? "Выход..." : "Выйти"}
    </button>
  );
};
