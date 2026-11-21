import { Flex } from "../Flex";
import { Typography } from "../Typography";

import type { ReactNode } from "react";

export type PageContentProps = {
  children: ReactNode;
};

export function PageContent({ children }: PageContentProps) {
  return (
    <Flex direction="column" rowGap={20}>
      {children}
    </Flex>
  );
}

export type PageContentHeaderProps = {
  children: ReactNode;
  actions?: ReactNode;
};

const Header = ({ children, actions }: PageContentHeaderProps) => {
  return (
    <Flex align="center" justify="space-between" wrap="wrap" rowGap={12} columnGap={12}>
      <Typography variant="h_1">{children}</Typography>
      {actions}
    </Flex>
  );
};

export type PageContentBodyProps = {
  children: ReactNode;
};

const Body = ({ children }: PageContentBodyProps) => {
  return (
    <Flex direction="column" rowGap={20}>
      {children}
    </Flex>
  );
};

PageContent.Header = Header;
PageContent.Body = Body;
