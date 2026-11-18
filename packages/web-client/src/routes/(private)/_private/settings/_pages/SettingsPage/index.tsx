import { useAuthStore } from "~/features/auth";
import { useTheme } from "~/shared/theme";
import type { Theme } from "~/shared/theme/types";
import { Page, Select, Typography } from "~/shared/ui";

export function SettingsPage() {
  const login = useAuthStore((state) => state.user?.login);
  const { theme, changeTheme } = useTheme();
  return (
    <Page title="Настройки">
      <Typography>Логин — {login}</Typography>
      <Select
        label="Тема"
        value={theme}
        onChange={(event) => changeTheme(event.target.value as Theme)}
      >
        <option value="system">Как в системе</option>
        <option value="light">Светлая</option>
        <option value="dark">Тёмная</option>
      </Select>
    </Page>
  );
}
