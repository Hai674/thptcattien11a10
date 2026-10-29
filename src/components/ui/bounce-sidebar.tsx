"use client";
// beui.dev/components/motion/bounce-sidebar

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export interface BounceSidebarItem {
  id: string;
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  disabled?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
}

export interface BounceSidebarProps {
  items: BounceSidebarItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  listClassName?: string;
  itemClassName?: string;
  indicatorClassName?: string;
}

const DOT_SIZE = 6;

// A silky, perfectly damped spring for butter-smooth trajectory without jittery twitch
const BOUNCE_SPRING = {
  type: "spring",
  stiffness: 240,
  damping: 24,
  mass: 0.4,
} as const;

function quadraticBezier(
  start: number,
  control: number,
  end: number,
  progress: number,
) {
  const remaining = 1 - progress;
  return (
    remaining * remaining * start +
    2 * remaining * progress * control +
    progress * progress * end
  );
}

export function BounceSidebar({
  items,
  value,
  defaultValue,
  onValueChange,
  ariaLabel = "Sidebar navigation",
  className,
  listClassName,
  itemClassName,
  indicatorClassName,
}: BounceSidebarProps) {
  const reduce = useReducedMotion();
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? items[0]?.id ?? "",
  );
  const requestedValue = value ?? internalValue;
  const selectedValue = items.some((item) => item.id === requestedValue)
    ? requestedValue
    : (items[0]?.id ?? "");
  const selectedIndex = items.findIndex((item) => item.id === selectedValue);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const selectedValueRef = useRef(selectedValue);
  const previousIndexRef = useRef(selectedIndex);
  const hasPositionRef = useRef(false);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  selectedValueRef.current = selectedValue;

  const snapIndicator = useCallback(() => {
    const selectedItem = itemRefs.current.get(selectedValueRef.current);
    if (!selectedItem) return;

    animationRef.current?.stop();
    x.set(0);
    y.set(selectedItem.offsetTop + (selectedItem.offsetHeight - DOT_SIZE) / 2);
    hasPositionRef.current = true;
  }, [x, y]);

  const positionIndicator = useCallback(
    (shouldAnimate: boolean) => {
      const selectedItem = itemRefs.current.get(selectedValue);
      if (!selectedItem) return;

      const destinationY =
        selectedItem.offsetTop + (selectedItem.offsetHeight - DOT_SIZE) / 2;

      animationRef.current?.stop();

      if (!hasPositionRef.current || reduce || !shouldAnimate) {
        x.set(0);
        y.set(destinationY);
        hasPositionRef.current = true;
        previousIndexRef.current = selectedIndex;
        return;
      }

      const startY = y.get();
      const distance = destinationY - startY;
      const travel = Math.abs(distance);
      const longJumpProgress = Math.min(1, Math.max(0, (travel - 48) / 120));
      // Giới hạn biên độ vòng cung vừa vặn (8px - 16px), tạo cảm giác nảy thanh thoát mượt mà
      const maxArc = Math.min(16, Math.max(8, travel * 0.12));

      animationRef.current = animate(0, 1, {
        ...BOUNCE_SPRING,
        stiffness: Math.max(180, BOUNCE_SPRING.stiffness - 40 * longJumpProgress),
        damping: BOUNCE_SPRING.damping + 2 * longJumpProgress,
        mass: BOUNCE_SPRING.mass + 0.1 * longJumpProgress,
        onUpdate: (progress: number) => {
          // Chuẩn hóa progress mượt mà theo hàm Sin mượt, không bị méo góc khi qua mốc 1
          const clamped = Math.max(0, Math.min(1, progress));
          const lateralArc = -Math.sin(clamped * Math.PI) * maxArc;
          x.set(lateralArc);
          y.set(startY + (destinationY - startY) * progress);
        },
        onComplete: () => {
          x.set(0);
          y.set(destinationY);
        },
      });

      previousIndexRef.current = selectedIndex;
    },
    [reduce, selectedIndex, selectedValue, x, y],
  );

  useLayoutEffect(() => {
    const shouldAnimate =
      hasPositionRef.current && previousIndexRef.current !== selectedIndex;
    positionIndicator(shouldAnimate);
  }, [positionIndicator, selectedIndex]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(snapIndicator);
    observer.observe(list);
    return () => observer.disconnect();
  }, [snapIndicator]);

  useLayoutEffect(
    () => () => {
      animationRef.current?.stop();
    },
    [],
  );

  const selectItem = (id: string) => {
    if (value === undefined) setInternalValue(id);
    onValueChange?.(id);
  };

  return (
    <nav aria-label={ariaLabel} className={cn("relative", className)}>
      <ul
        ref={listRef}
        className={cn(
          "relative flex list-none flex-col gap-1.5 pl-6",
          listClassName,
        )}
      >
        {selectedIndex >= 0 ? (
          <li
            aria-hidden="true"
            role="presentation"
            className="pointer-events-none absolute inset-0"
          >
            <motion.span
              style={{ x, y }}
              className={cn(
                "absolute top-0 left-3 h-1.5 w-1.5 rounded-full bg-primary",
                indicatorClassName,
              )}
            />
          </li>
        ) : null}

        {items.map((item) => {
          const active = item.id === selectedValue;
          const content = (
            <span className="relative z-10 flex items-center gap-2.5 w-full">
              {item.icon ? (
                <span aria-hidden="true" className="shrink-0 transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
              ) : null}
              <span className="truncate">{item.label}</span>
            </span>
          );
          const interactiveClasses = cn(
            "group relative flex min-h-9 w-full items-center gap-2 rounded-xl px-2.5 text-left text-sm font-medium outline-none transition-all duration-200",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            active
              ? "text-white font-semibold"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]",
            item.disabled ? "cursor-not-allowed opacity-40" : undefined,
            itemClassName,
          );

          const activeIndicatorGlow = active ? (
            <motion.div
              layoutId={`bounce-active-pill-${ariaLabel.replace(/\s+/g, "-")}`}
              className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/10 shadow-[0_0_14px_rgba(255,255,255,0.06)] pointer-events-none"
              transition={{
                type: "spring",
                stiffness: 340,
                damping: 28,
                mass: 0.45,
              }}
            />
          ) : null;

          return (
            <li
              key={item.id}
              ref={(node) => {
                if (node) itemRefs.current.set(item.id, node);
                else itemRefs.current.delete(item.id);
              }}
              className="relative"
            >
              {item.href ? (
                <a
                  href={item.href}
                  target={item.target}
                  rel={
                    item.rel ??
                    (item.target === "_blank"
                      ? "noreferrer noopener"
                      : undefined)
                  }
                  aria-current={active ? "page" : undefined}
                  aria-disabled={item.disabled || undefined}
                  data-active={active || undefined}
                  tabIndex={item.disabled ? -1 : undefined}
                  onClick={(event) => {
                    if (item.disabled) {
                      event.preventDefault();
                      return;
                    }
                    selectItem(item.id);
                  }}
                  className={interactiveClasses}
                >
                  {activeIndicatorGlow}
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  disabled={item.disabled}
                  aria-current={active ? "page" : undefined}
                  data-active={active || undefined}
                  onClick={() => selectItem(item.id)}
                  className={interactiveClasses}
                >
                  {activeIndicatorGlow}
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BounceSidebar;
