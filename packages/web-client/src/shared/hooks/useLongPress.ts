import { useEffect, useRef } from "react";

import type { MouseEvent, PointerEvent } from "react";

export function useLongPress(onLongPress: () => void, disabled = false) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);

  function cancel() {
    clearTimeout(timer.current);
    timer.current = undefined;
    origin.current = null;
  }

  useEffect(() => () => clearTimeout(timer.current), [disabled]);

  return {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      suppressClick.current = false;
      if (disabled || !event.isPrimary || event.button !== 0) return;
      cancel();
      origin.current = { x: event.clientX, y: event.clientY };
      timer.current = setTimeout(() => {
        suppressClick.current = true;
        onLongPress();
      }, 500);
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      if (
        origin.current &&
        Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y) > 8
      ) {
        suppressClick.current = true;
        cancel();
      }
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onClickCapture(event: MouseEvent<HTMLElement>) {
      if (!suppressClick.current) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick.current = false;
    },
  };
}
