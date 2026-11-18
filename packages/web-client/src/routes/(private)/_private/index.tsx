import { createFileRoute } from "@tanstack/react-router";

import { SignOutButton, useAuthStore } from "~/features/auth";
import { Flex, Typography } from "~/shared/ui";

import styles from "./HomePage.module.css";

export const Route = createFileRoute("/(private)/_private/")({
  component: HomePage,
});

function HomePage() {
  const login = useAuthStore((state) => state.user?.login);

  return (
    <Flex direction="column" className={styles.page}>
      <Flex as="header" justify="space-between" align="center" className={styles.header}>
        <Typography variant="text_4">{login}</Typography>
        <SignOutButton />
      </Flex>
      <main>
        <Flex direction="column" rowGap={10}>
          <Typography variant="accent_1">Fitness App</Typography>
          <Typography>Приватная зона. Логика auth подключена.</Typography>
        </Flex>
      </main>
    </Flex>
  );
}
