import cx from 'clsx';

import styles from './Typography.module.css';

export const Elements = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  p: 'p',
  a: 'a',
  span: 'span',
  li: 'li',
  div: 'div',
  button: 'button',
  label: 'label',
} as const;

export type TypographyElement = keyof typeof Elements;

export const Variants = {
  accent_1: Elements.p,
  accent_2: Elements.p,
  accent_3: Elements.p,
  h_1: Elements.h1,
  h_2: Elements.h2,
  h_3: Elements.h3,
  h_4: Elements.h4,
  h_5: Elements.h5,
  text_controls: Elements.p,
  text_1: Elements.p,
  text_2: Elements.p,
  text_3: Elements.p,
  text_4: Elements.p,
  text_5: Elements.p,
  text_6: Elements.p,
} as const;

export type TypographyVariant = keyof typeof Variants;

export const Align = ['left', 'right', 'center'] as const;

type LabelProps = {
  as?: 'label';
  htmlFor?: string;
  children: React.ReactNode;
};

export type TextProps = Omit<
  {
    className?: string;
    align?: (typeof Align)[number];
    inline?: boolean;
    as?: React.ElementType;
    variant?: keyof typeof Variants;
    hasTextOverflow?: boolean;
    htmlFor?: string;
    underline?: boolean;
    href?: string;
    ref?: React.Ref<HTMLElement>;
  } & (
    | React.HTMLAttributes<HTMLButtonElement>
    | React.ButtonHTMLAttributes<HTMLButtonElement>
    | (LabelProps & React.HTMLAttributes<HTMLLabelElement>)
  ) &
    (
      | { children?: React.ReactNode }
      | Pick<React.DOMAttributes<'p'>, 'dangerouslySetInnerHTML'>
    ),
  'color'
>;

export const Typography = ({
  children,
  className,
  as,
  variant = 'text_1',
  align,
  inline,
  style,
  hasTextOverflow,
  underline = false,
  ref,
  ...props
}: TextProps) => {
  const TextElement = as ?? Elements[Variants[variant]];

  return (
    <TextElement
      ref={ref}
      className={cx(
        styles.text,
        styles[variant],
        inline && styles.text_inline,
        underline && styles.underline,
        hasTextOverflow && styles.text_overflow,
        variant && styles[variant],
        className
      )}
      style={{
        ...style,
        ...{
          '--text-align': align ? `${align}` : null,
        },
      }}
      {...props}
    >
      {children}
    </TextElement>
  );
};
