import { useEffect, useState } from "react";

export function useInView() {
  const [node, setNode] = useState<Element | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [node]);

  return { ref: setNode, inView };
}
