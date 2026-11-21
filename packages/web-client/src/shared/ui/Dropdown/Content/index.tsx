import cn from "clsx";

import styles from "./Content.module.css";

export type ContentProps = {
  className?: string;
  children: React.ReactNode;
  size?: "s" | "m";
};

export const Content = ({
  children,
  className,
  size = "s",
  ...props
}: ContentProps) => {
  return (
    <div className={cn(styles.wrapper, className)} {...props} data-size={size}>
      {children}
    </div>
  );
};
