import { useLayoutEffect, useRef, type ReactNode } from "react";

import { useHeaderStore } from "./useHeaderStore";

export function useHeaderContent(position: "left" | "center" | "right", content: ReactNode) {
  const getContent = useHeaderStore((state) => state.getContent);
  const setContent = useHeaderStore((state) => state.setContent);
  const prevContent = useRef<ReactNode>(null);

  useLayoutEffect(() => {
    prevContent.current = getContent(position);
    setContent(position, content);

    return () => {
      setContent(position, prevContent.current);
    };
  }, [position, content, getContent, setContent]);
}

export const useHeaderLeftContent = (content: ReactNode) => {
  useHeaderContent("left", content);
};

export const useHeaderCenterContent = (content: ReactNode) => {
  useHeaderContent("center", content);
};

export const useHeaderRightContent = (content: ReactNode) => {
  useHeaderContent("right", content);
};
