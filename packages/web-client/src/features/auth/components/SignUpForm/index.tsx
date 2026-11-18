import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { TextInputField, useForm } from "~/features/form";
import { ApiError } from "~/shared/config";
import { Button, Flex, Typography, toast } from "~/shared/ui";

import { authManager } from "../../AuthManager";
import { signUpFormSchema } from "./constants";
import styles from "./SignUpForm.module.css";

import type { z } from "zod";

type SignUpFormSchema = z.infer<typeof signUpFormSchema>;

export const SignUpForm = () => {
  const navigate = useNavigate();

  const { mutate: signUp, isPending } = useMutation({
    mutationFn: ({ login, password }: SignUpFormSchema) => authManager.signUp({ login, password }),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message ?? "Не удалось зарегистрироваться");
        return;
      }

      toast.success("Аккаунт создан");
      void navigate({ to: "/" });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Не удалось зарегистрироваться";
      toast.error(message);
    },
  });

  const { control, handleSubmit: submitWrapper } = useForm({
    schema: signUpFormSchema,
    disabled: isPending,
    defaultValues: {
      login: "",
      password: "",
      repeatPassword: "",
    },
  });

  const handleSubmit = submitWrapper((data) => {
    signUp(data);
  });

  return (
    <Flex as="form" direction="column" className={styles.form} onSubmit={handleSubmit}>
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
      <Flex direction="column" className={styles.bottomContent}>
        <Button type="submit" disabled={isPending} fullWidth>
          {isPending ? "Создание..." : "Создать аккаунт"}
        </Button>
        <Typography variant="text_3">
          Уже есть аккаунт? <Link to="/signin">Войти</Link>
        </Typography>
      </Flex>
    </Flex>
  );
};
