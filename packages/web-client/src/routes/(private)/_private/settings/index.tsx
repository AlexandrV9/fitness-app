import { createFileRoute } from "@tanstack/react-router";

import { SettingsPage } from "./_pages/SettingsPage";

export const Route = createFileRoute("/(private)/_private/settings/")({
  component: SettingsPage,
});
