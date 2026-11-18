import type { ParsedLocation } from "@tanstack/react-router";

export const buildLocationRedirectPath = (location: ParsedLocation) => {
  const search = location.searchStr ? `?${location.searchStr}` : "";
  const hash = location.hash ? `#${location.hash}` : "";
  return `${location.pathname}${search}${hash}`;
};
