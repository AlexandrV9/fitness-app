import { z } from "zod";

import { useAuthStore } from "~/features/auth";
import { SelectField, useForm } from "~/features/form";
import { useTheme } from "~/shared/theme";
import type { Theme } from "~/shared/theme/types";
import { PageContent, Typography } from "~/shared/ui";

const settingsSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
});

export function SettingsPage() {
  const login = useAuthStore((state) => state.user?.login);
  const { theme, changeTheme } = useTheme();
  const { control } = useForm({
    schema: settingsSchema,
    defaultValues: { theme },
  });

  return (
    <PageContent>
      <PageContent.Header>Настройки</PageContent.Header>
      <PageContent.Body>
        <Typography>Логин — {login}</Typography>
        <SelectField
          name="theme"
          control={control}
          label="Тема"
          onChange={(value) => changeTheme((value || "system") as Theme)}
          options={[
            { value: "system", label: "Как в системе" },
            { value: "light", label: "Светлая" },
            { value: "dark", label: "Тёмная" },
          ]}
        />
      </PageContent.Body>
    </PageContent>
  );
}
