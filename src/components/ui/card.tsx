import * as React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  liquid?: boolean;
}

const glassCardStyles = `
@property --card-angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; }
@property --card-angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }

.glass-card-element {
  --anim-time: .45s;
  --anim-ease: cubic-bezier(.25, 1, .5, 1);
  --border-width: clamp(1px, .0625em, 2px);
  --foreground: #f8fafc;
  --background: #090d1a;
  position: relative;
  isolation: isolate;
  border-radius: 1.75rem;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: transform var(--anim-time) var(--anim-ease), box-shadow var(--anim-time) var(--anim-ease), background var(--anim-time) var(--anim-ease);
  -webkit-tap-highlight-color: transparent;
  -webkit-backdrop-filter: blur(28px);
  backdrop-filter: blur(28px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(9, 13, 26, 0.72);
  background: linear-gradient(
    -75deg,
    rgba(9, 13, 26, 0.7),
    rgba(15, 23, 42, 0.8),
    rgba(9, 13, 26, 0.7)
  );
  background: linear-gradient(
    -75deg,
    oklch(from var(--background) l c h / 18%),
    oklch(from var(--background) l c h / 32%),
    oklch(from var(--background) l c h / 18%)
  );
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    inset 0 -1px 2px rgba(0, 0, 0, 0.5),
    0 16px 40px -12px rgba(0, 0, 0, 0.65),
    0 0 24px -4px rgba(99, 102, 241, 0.12);
  box-shadow:
    inset 0 .15em .15em oklch(from var(--foreground) l c h / 14%),
    inset 0 -.15em .15em oklch(from var(--background) l c h / 50%),
    0 .25em .15em -.15em oklch(from var(--foreground) l c h / 20%),
    0 0 .1em .25em inset oklch(from var(--background) l c h / 20%),
    0 16px 40px -12px rgba(0, 0, 0, 0.65),
    0 0 24px -4px rgba(99, 102, 241, 0.12);
}

.glass-card-element:hover {
  background: linear-gradient(
    -75deg,
    rgba(9, 13, 26, 0.78),
    rgba(15, 23, 42, 0.88),
    rgba(9, 13, 26, 0.78)
  );
  background: linear-gradient(
    -75deg,
    oklch(from var(--background) l c h / 24%),
    oklch(from var(--background) l c h / 42%),
    oklch(from var(--background) l c h / 24%)
  );
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.22),
    inset 0 -1px 3px rgba(0, 0, 0, 0.6),
    0 24px 50px -10px rgba(0, 0, 0, 0.75),
    0 0 35px 0 rgba(99, 102, 241, 0.22);
  box-shadow:
    inset 0 .2em .2em oklch(from var(--foreground) l c h / 22%),
    inset 0 -.2em .2em oklch(from var(--background) l c h / 60%),
    0 .35em .15em -.1em oklch(from var(--foreground) l c h / 25%),
    0 0 .1em .25em inset oklch(from var(--background) l c h / 40%),
    0 24px 50px -10px rgba(0, 0, 0, 0.75),
    0 0 35px 0 rgba(99, 102, 241, 0.22);
}

/* Lớp vệt kính mờ tự nhiên, không tạo vệt sáng trắng chói góc */
.glass-card-element .glass-card-sheen {
  display: none;
}

/* Loại bỏ viền xoay đa sắc tạo vệt trắng chói ở góc bo */
.glass-card-element:after {
  display: none;
}
`;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      children,
      liquid = true,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <>
        <style>{glassCardStyles}</style>
        <div
          ref={ref}
          className={cn(
            'glass-card-element group/card text-white',
            className
          )}
          style={style}
          {...props}
        >
          {/* Lớp vệt sáng xiên quét qua mặt kính (Specular Sheen Sweep) */}
          <div className="glass-card-sheen" />

          {/* Nội dung bên trong Card */}
          <div className="relative z-10 w-full h-full">{children}</div>
        </div>
      </>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-bold leading-none tracking-tight text-white text-lg', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-300', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
