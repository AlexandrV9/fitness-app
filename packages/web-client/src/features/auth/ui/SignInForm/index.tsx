import { Link, useSearch } from "@tanstack/react-router";
import z from "zod";

import { TextInputField, useForm } from "~/features/form";
import { Button, Typography } from "~/shared/ui";

import { useSignIn } from "./useSignIn";

import styles from "./SignInForm.module.css";

const signInFormSchema = z.object({
  login: z.string().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
});

export const SignInForm = () => {
  const { redirect = "/" } = useSearch({ from: "/(auth)/_auth" });
  const { signInFn, isPending } = useSignIn({
    successRedirectUrl: redirect,
  });

  const { control, handleSubmit } = useForm({
    schema: signInFormSchema,
    disabled: isPending,
    defaultValues: {
      login: "",
      password: "",
    },
  });

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((data) => signInFn(data))}
    >
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
        autoComplete="current-password"
        fullWidth
      />

      <div className={styles.actions}>
        <Button type="submit" disabled={isPending} fullWidth>
          {isPending ? "Вход..." : "Войти"}
        </Button>
        <p className={styles.linkRow}>
          Нет аккаунта? <Link to="/signup">Зарегистрироваться</Link>
        </p>
      </div>
    </form>
  );
};
