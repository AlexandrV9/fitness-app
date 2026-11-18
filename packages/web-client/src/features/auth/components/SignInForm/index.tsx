import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import z from "zod";

import { TextInputField, useForm } from "~/features/form";
import { ApiError } from "~/shared/config";
import { Button, Flex, toast, Typography } from "~/shared/ui";

import { authManager } from "../../AuthManager";
import styles from "./SignInForm.module.css";

const signInFormSchema = z.object({
  login: z.string().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
});

export const SignInForm = () => {
  const navigate = useNavigate();
  const { redirect: successRedirectUrl = "/" } = useSearch({ from: "/(auth)/_auth" });

  const { mutate: singIn, isPending } = useMutation({
    mutationFn: (data: { login: string; password: string }) => authManager.signIn(data),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message ?? "Не удалось войти");
        return;
      }

      navigate({ to: successRedirectUrl });
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

  const { control, handleSubmit: submitWrapper } = useForm({
    schema: signInFormSchema,
    disabled: isPending,
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const handleSubmit = submitWrapper((data) => {
    singIn(data);
  });

  return (
    <Flex as="form" direction="column" className={styles.form} onSubmit={handleSubmit}>
      <Typography variant="h_1">Вход</Typography>
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
        autoComplete="off"
        fullWidth
      />
      <Flex align="center" direction="column" className={styles.bottomContent}>
        <Button type="submit" disabled={isPending} fullWidth>
          {isPending ? "Вход..." : "Войти"}
        </Button>
        <Typography variant="text_1" className={styles.linkRow}>
          Нет аккаунта? <Link to="/signup">Зарегистрироваться</Link>
        </Typography>
      </Flex>
    </Flex>
  );
};
