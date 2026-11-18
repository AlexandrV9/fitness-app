import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import type { z } from "zod";

import { TextInputField, useForm } from "~/features/form";
import { ApiError } from "~/shared/config";
import { Button, Typography, toast } from "~/shared/ui";

import { authManager } from "../../AuthManager";

import { signUpFormSchema } from "./constants";

import styles from "./SignUpForm.module.css";

type SignUpFormSchema = z.infer<typeof signUpFormSchema>;

export const SignUpForm = () => {
  const navigate = useNavigate();

  const signUpMutation = useMutation({
    mutationFn: ({ login, password }: SignUpFormSchema) =>
      authManager.signUp({ login, password }),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message ?? "Не удалось зарегистрироваться");
        return;
      }

      toast.success("Аккаунт создан");
      void navigate({ to: "/" });
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Не удалось зарегистрироваться";
      toast.error(message);
    },
  });

  const { control, handleSubmit } = useForm({
    schema: signUpFormSchema,
    disabled: signUpMutation.isPending,
    defaultValues: {
      login: "",
      password: "",
      repeatPassword: "",
    },
  });

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((data) => signUpMutation.mutate(data))}
    >
      <Typography variant="h_1">Регистрация</Typography>

      <TextInputField
        name="login"
        control={control}
        label="Логин"
        autoComplete="username"
        fullWidth
      />
      <TextInputField
        name="password"
        control={control}
        label="Пароль"
        type="password"
        autoComplete="new-password"
        fullWidth
      />
      <TextInputField
        name="repeatPassword"
        control={control}
        label="Повтор пароля"
        type="password"
        autoComplete="new-password"
        fullWidth
      />

      <div className={styles.actions}>
        <Button type="submit" disabled={signUpMutation.isPending} fullWidth>
          {signUpMutation.isPending ? "Создание..." : "Создать аккаунт"}
        </Button>
        <p className={styles.linkRow}>
          Уже есть аккаунт? <Link to="/signin">Войти</Link>
        </p>
      </div>
    </form>
  );
};
