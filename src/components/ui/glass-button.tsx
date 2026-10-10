import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const glassButtonStyles = `
@property --angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; }
@property --angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }

.glass-button-wrap {
  --anim-time: .3s;
  --anim-ease: cubic-bezier(.16, 1, .3, 1);
  position: relative;
  display: inline-flex;
  vertical-align: middle;
  transform-style: preserve-3d;
  perspective: 600px;
  transition: transform var(--anim-time) var(--anim-ease);
}

.glass-button-wrap:has(.glass-button:active:not(:disabled)) {
  transform: scale(0.985) rotateX(10deg);
}

.glass-button-wrap:has(.glass-button:disabled) {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

/* Lớp bóng đổ 3D mềm mại phía dưới nút (Ground Depth Glow) */
.glass-button-shadow {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  pointer-events: none;
  filter: blur(8px);
  transform: translateY(3px);
  opacity: 0.45;
  transition: all var(--anim-time) var(--anim-ease);
  z-index: 0;
}

.glass-button-wrap.variant-primary .glass-button-shadow {
  background: radial-gradient(ellipse at 50% 100%, rgba(59, 130, 246, 0.7), transparent 70%);
}

.glass-button-wrap.variant-secondary .glass-button-shadow,
.glass-button-wrap.variant-default .glass-button-shadow,
.glass-button-wrap.variant-glass .glass-button-shadow {
  background: radial-gradient(ellipse at 50% 100%, rgba(255, 255, 255, 0.3), transparent 70%);
}

.glass-button-wrap.variant-destructive .glass-button-shadow {
  background: radial-gradient(ellipse at 50% 100%, rgba(239, 68, 68, 0.7), transparent 70%);
}

.glass-button-wrap.variant-success .glass-button-shadow {
  background: radial-gradient(ellipse at 50% 100%, rgba(16, 185, 129, 0.7), transparent 70%);
}

.glass-button-wrap:has(.glass-button:hover) .glass-button-shadow {
  filter: blur(12px);
  transform: translateY(5px);
  opacity: 0.75;
}

.glass-button-wrap:has(.glass-button:active) .glass-button-shadow {
  filter: blur(5px);
  transform: translateY(1px);
  opacity: 0.25;
}

/* Thân nút kính quang học (Glass Body) */
.glass-button {
  -webkit-tap-highlight-color: transparent;
  position: relative;
  z-index: 2;
  overflow: hidden;
  border-radius: 9999px;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all var(--anim-time) var(--anim-ease);
}

/* Quét dải sáng quang học (Specular Sheen) phủ 100% bề mặt nút khi hover */
.glass-button:before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: linear-gradient(
    105deg,
    transparent 0%,
    transparent 35%,
    rgba(255, 255, 255, 0.25) 48%,
    rgba(255, 255, 255, 0.45) 50%,
    rgba(255, 255, 255, 0.25) 52%,
    transparent 65%,
    transparent 100%
  );
  background-size: 250% 100%;
  background-position: 180% 0;
  background-repeat: no-repeat;
  transition: background-position 0.65s cubic-bezier(.16, 1, .3, 1);
  pointer-events: none;
  z-index: 3;
}

.glass-button:hover:before {
  background-position: -40% 0;
}

/* ================= VARIANTS STYLING ================= */

/* 1. Primary Variant (Xanh Sapphire Gradient rực rỡ, độ sâu cao) */
.glass-button.btn-primary {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
  border: 1px solid rgba(147, 197, 253, 0.35);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3),
              0 4px 14px -2px rgba(37, 99, 235, 0.45);
  color: #ffffff;
}

.glass-button.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
  border-color: rgba(191, 219, 254, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55),
              0 6px 20px -2px rgba(37, 99, 235, 0.65);
}

/* 2. Secondary / Default / Glass Variant (Kính mờ Frosted Glass sang trọng) */
.glass-button.btn-secondary,
.glass-button.btn-default,
.glass-button.btn-glass {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.04) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3),
              inset 0 -1px 0 rgba(0, 0, 0, 0.25),
              0 4px 14px rgba(0, 0, 0, 0.35);
  color: #f8fafc;
}

.glass-button.btn-secondary:hover,
.glass-button.btn-default:hover,
.glass-button.btn-glass:hover {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 100%);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45),
              0 6px 18px rgba(0, 0, 0, 0.45);
  color: #ffffff;
}

/* 3. Destructive Variant (Đỏ Ruby Cảnh báo) */
.glass-button.btn-destructive {
  background: linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%);
  border: 1px solid rgba(252, 165, 165, 0.35);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3),
              0 4px 14px -2px rgba(220, 38, 38, 0.45);
  color: #ffffff;
}

.glass-button.btn-destructive:hover {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%);
  border-color: rgba(254, 202, 202, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55),
              0 6px 20px -2px rgba(220, 38, 38, 0.65);
}

/* 4. Success Variant (Xanh Emerald Hoàn thành) */
.glass-button.btn-success {
  background: linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%);
  border: 1px solid rgba(110, 231, 183, 0.35);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3),
              0 4px 14px -2px rgba(16, 185, 129, 0.45);
  color: #ffffff;
}

.glass-button.btn-success:hover {
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
  border-color: rgba(167, 243, 208, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55),
              0 6px 20px -2px rgba(16, 185, 129, 0.65);
}

/* 5. Outline Variant */
.glass-button.btn-outline {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #e2e8f0;
}

.glass-button.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
}

/* 6. Ghost Variant */
.glass-button.btn-ghost {
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
}

.glass-button.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

/* Typography & Content Layer */
.glass-button-text {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  position: relative;
  z-index: 4;
}
`;

const glassButtonVariants = cva(
  "glass-button relative isolate select-none font-semibold transition-all inline-flex items-center justify-center tracking-normal",
  {
    variants: {
      size: {
        default: "h-11 px-6 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const variantClassMap: Record<string, { wrap: string; btn: string }> = {
  default: { wrap: "variant-default", btn: "btn-default" },
  glass: { wrap: "variant-glass", btn: "btn-glass" },
  primary: { wrap: "variant-primary", btn: "btn-primary" },
  secondary: { wrap: "variant-secondary", btn: "btn-secondary" },
  destructive: { wrap: "variant-destructive", btn: "btn-destructive" },
  success: { wrap: "variant-success", btn: "btn-success" },
  outline: { wrap: "variant-outline", btn: "btn-outline" },
  ghost: { wrap: "variant-ghost", btn: "btn-ghost" },
};

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  variant?:
    | "default"
    | "glass"
    | "primary"
    | "secondary"
    | "destructive"
    | "success"
    | "outline"
    | "ghost";
  contentClassName?: string;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      className,
      children,
      size = "default",
      variant = "default",
      contentClassName,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isFullWidth = className?.includes("w-full");
    const vConfig = variantClassMap[variant || "default"] || variantClassMap.default;

    return (
      <>
        <style>{glassButtonStyles}</style>
        <div
          className={cn(
            "glass-button-wrap rounded-full",
            vConfig.wrap,
            isFullWidth ? "w-full flex" : "inline-flex",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
            className
          )}
        >
          <button
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              glassButtonVariants({ size }),
              vConfig.btn,
              isFullWidth && "w-full"
            )}
            {...props}
          >
            <span
              className={cn(
                "glass-button-text relative z-10 flex items-center justify-center gap-2 w-full",
                contentClassName
              )}
            >
              {children}
            </span>
          </button>
          <div className="glass-button-shadow" />
        </div>
      </>
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
export default GlassButton;
