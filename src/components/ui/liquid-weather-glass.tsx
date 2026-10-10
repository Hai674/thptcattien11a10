import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  draggable?: boolean;
  expandable?: boolean;
  width?: string | number;
  height?: string | number;
  expandedWidth?: string | number;
  expandedHeight?: string | number;
  borderRadius?: string;
  glowColor?: string;
}

export const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  (
    {
      children,
      className = '',
      draggable = false,
      expandable = false,
      width,
      height,
      expandedWidth,
      expandedHeight,
      borderRadius = '24px',
      glowColor = 'rgba(99, 102, 241, 0.2)',
      style,
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleToggleExpansion = (e: React.MouseEvent) => {
      if (!expandable) return;
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, select, textarea')) return;
      setIsExpanded(!isExpanded);
    };

    const expansionVariants = expandable
      ? {
          collapsed: {
            width: width || 'auto',
            height: height || 'auto',
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          },
          expanded: {
            width: expandedWidth || 'auto',
            height: expandedHeight || 'auto',
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          },
        }
      : undefined;

    const motionProps =
      draggable || expandable
        ? {
            variants: expandable ? expansionVariants : undefined,
            animate: expandable ? (isExpanded ? 'expanded' : 'collapsed') : undefined,
            onClick: expandable ? handleToggleExpansion : undefined,
            drag: draggable,
            dragConstraints: draggable ? { left: 0, right: 0, top: 0, bottom: 0 } : undefined,
            dragElastic: draggable ? 0.2 : undefined,
            dragTransition: draggable
              ? { bounceStiffness: 400, bounceDamping: 20, power: 0.2 }
              : undefined,
            whileDrag: draggable ? { scale: 1.02 } : undefined,
            whileHover: { scale: 1.01, transition: { duration: 0.2 } },
            whileTap: { scale: 0.99 },
          }
        : {};

    const Component = (draggable || expandable ? motion.div : 'div') as any;

    return (
      <Component
        ref={ref}
        className={cn(
          'glass-card-element group/liquid relative overflow-hidden transition-all duration-300 text-white',
          draggable ? 'cursor-grab active:cursor-grabbing' : '',
          expandable ? 'cursor-pointer' : '',
          className
        )}
        style={{
          borderRadius,
          ...(!expandable && width ? { width } : {}),
          ...(!expandable && height ? { height } : {}),
          ...style,
        }}
        {...motionProps}
        {...(props as any)}
      >
        {/* Specular Sheen Sweep Flare */}
        <div className="glass-card-sheen" />

        {/* Nội dung bên trong */}
        <div className="relative z-10 w-full h-full">{children}</div>
      </Component>
    );
  }
);

LiquidGlassCard.displayName = 'LiquidGlassCard';

export const LiquidGlassSvgFilter: React.FC = () => null;

export default LiquidGlassCard;
