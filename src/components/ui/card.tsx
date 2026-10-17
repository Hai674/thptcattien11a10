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
  --background: #160d20;
  position: relative;
  isolation: isolate;
  border-radius: 1.75rem;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: transform var(--anim-time) var(--anim-ease), box-shadow var(--anim-time) var(--anim-ease), background var(--anim-time) var(--anim-ease);
  -webkit-tap-highlight-color: transparent;
  -webkit-backdrop-filter: blur(28px);
  backdrop-filter: blur(28px);
  background: linear-gradient(
    -75deg,
    oklch(from var(--background) l c h / 18%),
    oklch(from var(--background) l c h / 32%),
    oklch(from var(--background) l c h / 18%)
  );
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
    oklch(from var(--background) l c h / 24%),
    oklch(from var(--background) l c h / 42%),
    oklch(from var(--background) l c h / 24%)
  );
  box-shadow:
    inset 0 .2em .2em oklch(from var(--foreground) l c h / 22%),
    inset 0 -.2em .2em oklch(from var(--background) l c h / 60%),
    0 .35em .15em -.1em oklch(from var(--foreground) l c h / 25%),
    0 0 .1em .25em inset oklch(from var(--background) l c h / 40%),
    0 24px 50px -10px rgba(0, 0, 0, 0.75),
    0 0 35px 0 rgba(99, 102, 241, 0.22);
}

/* Lớp vệt sáng xiên quét qua mặt kính (Specular Sheen Sweep) */
.glass-card-element .glass-card-sheen {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-sizing: border-box;
  background: linear-gradient(
    var(--card-angle-2),
    transparent 0%,
    oklch(from var(--foreground) l c h / 20%) 40% 50%,
    transparent 55%
  );
  z-index: 2;
  mix-blend-mode: screen;
  pointer-events: none;
  transition: background-position calc(var(--anim-time) * 1.5) var(--anim-ease), --card-angle-2 calc(var(--anim-time) * 1.5) var(--anim-ease);
  background-position: 0%;
  background-size: 200% 200%;
}

.glass-card-element:hover .glass-card-sheen {
  background-position: 30%;
  --card-angle-2: -25deg;
}

/* Viền phản quang xoay tròn đa sắc quang học (Iridescent Rotating Conic Rim) */
.glass-card-element:after {
  content: "";
  z-index: 3;
  width: calc(100% + var(--border-width) * 2);
  height: calc(100% + var(--border-width) * 2);
  top: calc(0% - var(--border-width));
  left: calc(0% - var(--border-width));
  padding: var(--border-width);
  box-sizing: border-box;
  background: conic-gradient(
    from var(--card-angle-1) at 50% 50%,
    oklch(from var(--foreground) l c h / 50%) 0%,
    transparent 8% 42%,
    oklch(from var(--foreground) l c h / 60%) 50%,
    transparent 58% 92%,
    oklch(from var(--foreground) l c h / 50%) 100%
  ),
  linear-gradient(180deg, oklch(from var(--background) l c h / 50%), oklch(from var(--background) l c h / 50%));
  transition: all var(--anim-time) var(--anim-ease), --card-angle-1 .6s ease;
  box-shadow: inset 0 0 0 calc(var(--border-width) / 2) oklch(from var(--background) l c h / 50%);
  border-radius: inherit;
  position: absolute;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
  mask-image: linear-gradient(#000 0,#000 0), linear-gradient(#000 0,#000 0);
  -webkit-mask-clip: content-box, border-box;
  mask-clip: content-box, border-box;
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.glass-card-element:hover:after {
  --card-angle-1: -135deg;
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
