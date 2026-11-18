import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "~/features/auth";

export const Route = createFileRoute("/(auth)/_auth/signup/")({
  component: SignUpPage,
});

function SignUpPage() {
  return <SignUpForm />;
}
