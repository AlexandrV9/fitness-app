import {
  HistoryIcon,
  HomeIcon,
  SettingsIcon,
  TemplatesIcon,
  WeightliftingIcon,
} from "~/shared/ui/icons";

import type { NavBarItemConfig } from "./Item";

export const navItems: NavBarItemConfig[] = [
  {
    id: "nav_item_home",
    title: "Home",
    href: "/",
    icon: HomeIcon,
  },
  {
    id: "nav_item_templates",
    title: "Templates",
    href: "/templates",
    icon: TemplatesIcon,
  },
  {
    id: "nav_item_exercises",
    title: "Exercises",
    href: "/exercises",
    icon: WeightliftingIcon,
  },
  {
    id: "nav_item_history",
    title: "Workouts",
    href: "/workouts",
    icon: HistoryIcon,
  },
  {
    id: "nav_item_settings",
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
];
