import { createFileRoute } from "@tanstack/react-router";
import { SignOutButton, useAuthStore } from "~/features/auth";
import styles from "./HomePage.module.css";

export const Route = createFileRoute("/(private)/_private/")({
  component: HomePage,
});

function HomePage() {
  const login = useAuthStore((state) => state.user?.login);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span>{login ?? "Гость"}</span>;
        <SignOutButton />
      </header>
      <section>
        <h1>Fitness App</h1>
        <p>Приватная зона. Логика auth подключена.</p>
      </section>
    </main>
  );
}
