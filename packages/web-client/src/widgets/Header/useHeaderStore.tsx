import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { ReactNode } from "react";

type HeaderSlot = "left" | "center" | "right";

type HeaderStore = {
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  rightContent?: ReactNode;
  getContent: (type: HeaderSlot) => ReactNode;
  setContent: (type: HeaderSlot, content: ReactNode) => void;
};

export const useHeaderStore = create<HeaderStore>()(
  devtools((set, get) => ({
    leftContent: null,
    centerContent: null,
    rightContent: null,

    setContent: (type, content) => {
      switch (type) {
        case "left":
          set({ leftContent: content });
          break;
        case "center":
          set({ centerContent: content });
          break;
        case "right":
          set({ rightContent: content });
          break;
      }
    },
    getContent: (type) => {
      switch (type) {
        case "left":
          return get().leftContent;
        case "center":
          return get().centerContent;
        case "right":
          return get().rightContent;
      }
    },
  })),
);
