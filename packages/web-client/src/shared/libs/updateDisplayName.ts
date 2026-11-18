import type { ComponentType } from "react";

export const updateDisplayName = <
  R extends Record<string, ComponentType<never>>,
>(
  prefix: string,
  components: R
) =>
  Object.entries(components).forEach(([name, component]) => {
    component.displayName = `${prefix}.${name}`;
  });
