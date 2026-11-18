import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ApiError } from "~/shared/config";
import { toast } from "~/shared/ui";
import { authManager } from "../../AuthManager";

type UseSignInByLoginProps = {
  successRedirectUrl?: string;
};

export const useSignIn = (props?: UseSignInByLoginProps) => {
  const { successRedirectUrl = "/" } = props ?? {};
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { login: string; password: string }) => authManager.signIn(data),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message ?? "Не удалось войти");
        return;
      }

      void navigate({ to: successRedirectUrl });
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Не удалось войти";

      toast.error(message || "Неверный логин или пароль");
    },
  });

  return {
    isPending,
    signInFn: mutate,
  };
};
