import { updateDisplayName } from "~/shared/libs";

import {
  ButtonGroup as Root,
  type ButtonGroupProps as RootProps,
} from "./ButtonGroup";
import { Button, type ButtonProps } from "./components/Button";
import { HelperText, type HelperTextProps } from "./components/HelperText";
import { List, type ListProps } from "./components/List";

export type { RootProps, HelperTextProps, ListProps, ButtonProps };

export const ButtonGroup = {
  Root,
  HelperText,
  List,
  Button,
};

updateDisplayName("ButtonGroup", ButtonGroup);
