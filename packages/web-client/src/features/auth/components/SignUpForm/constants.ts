import z from "zod";

export const minLengthPassword = 8;
export const maxLengthPassword = 128;

export const signUpFormSchema = z
  .object({
    login: z.string().trim().min(1, "Введите логин").max(64, "Слишком длинный логин"),
    password: z
      .string()
      .min(minLengthPassword, `Минимум ${minLengthPassword} символов`)
      .max(maxLengthPassword, `Максимум ${maxLengthPassword} символов`),
    repeatPassword: z.string().min(1, "Повторите пароль"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Пароли не совпадают",
    path: ["repeatPassword"],
  });
