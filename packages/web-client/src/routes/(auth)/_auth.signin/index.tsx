import { createFileRoute } from "@tanstack/react-router";
import { SignInPage } from "./_pages/SignInPage";

export const Route = createFileRoute("/(auth)/_auth/signin/")({
  component: SignInPage,
});
