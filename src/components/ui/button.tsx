import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { GlassButton, type GlassButtonProps } from '@/components/ui/glass-button';

const buttonVariants = cva(
  'glass-btn font-sans inline-flex items-center justify-center font-semibold select-none tracking-normal transition-all',
  {
    variants: {
      variant: {
        default: 'glass-btn-primary',
        primary: 'glass-btn-primary',
        secondary: 'glass-btn-secondary',
        destructive: 'glass-btn-destructive',
        success: 'glass-btn-success',
        outline: 'glass-btn-outline',
        ghost: 'glass-btn-ghost',
        glass: 'glass-btn-default',
        link: 'text-primary underline-offset-4 hover:underline !bg-none !border-transparent !shadow-none p-0 h-auto rounded-none',
      },
      size: {
        default: 'h-11 px-5 text-sm',
        sm: 'h-9 px-3.5 text-xs',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      type = 'button',
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref as any}
          {...(props as any)}
        >
          {children}
        </Slot>
      );
    }

    if (variant === 'link') {
      return (
        <button
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </button>
      );
    }

    const mappedVariant =
      variant === 'default'
        ? 'primary'
        : (variant as GlassButtonProps['variant']);

    return (
      <GlassButton
        ref={ref}
        type={type}
        disabled={disabled}
        variant={mappedVariant}
        size={size as GlassButtonProps['size']}
        className={className}
        {...props}
      >
        {children}
      </GlassButton>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants, GlassButton };
export default Button;
