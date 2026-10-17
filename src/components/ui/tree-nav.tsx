import * as React from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { cn } from '@/utils/cn';

export interface TreeNavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'primary' | 'cyan' | 'amber' | 'emerald';
  external?: boolean;
}

export interface TreeNavProps {
  items: TreeNavItem[];
  activeHref?: string;
  followHover?: boolean;
  onSelect?: (item: TreeNavItem, event: React.MouseEvent) => void;
  className?: string;
  railColor?: string;
  accentColor?: string;
}

const ROW_H = 38;
const MARKER = 8;
const RAIL_X = 12;

// Apple-style critically damped spring response
const GLIDE = { type: 'spring', visualDuration: 0.22, bounce: 0 } as const;
const FADE = { duration: 0.14, ease: 'easeOut' } as const;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function TreeNav({
  items,
  activeHref,
  followHover = true,
  onSelect,
  className,
}: TreeNavProps) {
  const listRef = React.useRef<HTMLUListElement>(null);
  const rowRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  const centersRef = React.useRef<number[]>([]);
  const hoveredRef = React.useRef<number | null>(null);
  const reduced = usePrefersReducedMotion();

  // Tìm chính xác index hoạt động: ưu tiên khớp tuyệt đối, sau đó đến đường dẫn con có boundary /
  const activeIndex = React.useMemo(() => {
    if (!activeHref) return -1;
    // 1. So khớp chính xác
    const exact = items.findIndex((item) => item.href === activeHref);
    if (exact !== -1) return exact;

    // 2. So khớp đường dẫn con (subroute) với href dài nhất
    let bestIndex = -1;
    let maxLen = 0;
    items.forEach((item, idx) => {
      if (item.href === '/') return;
      if (activeHref === item.href || activeHref.startsWith(item.href + '/')) {
        if (item.href.length > maxLen) {
          maxLen = item.href.length;
          bestIndex = idx;
        }
      }
    });
    return bestIndex;
  }, [items, activeHref]);

  const reducedRef = React.useRef(reduced);
  const activeRef = React.useRef(activeIndex);
  React.useLayoutEffect(() => {
    reducedRef.current = reduced;
    activeRef.current = activeIndex;
  });

  const [end, setEnd] = React.useState(0);
  const [measured, setMeasured] = React.useState(false);

  const centerY = useMotionValue(0);
  const visibility = useMotionValue(0);
  const pillY = useTransform(centerY, (v) => v - ROW_H / 2);
  const markerY = useTransform(centerY, (v) => v - MARKER / 2);
  const accentScale = useTransform(centerY, (v) => (end > 0 ? Math.min(1, Math.max(0, v / end)) : 0));

  const moveTo = React.useCallback(
    (index: number | null, immediate = false) => {
      const centers = centersRef.current;
      if (index === null || index < 0 || index >= centers.length) {
        animate(visibility, 0, FADE);
        return;
      }
      const target = centers[index];
      const jump = immediate || reducedRef.current || visibility.get() < 0.05;
      if (jump) {
        centerY.jump(target);
      } else {
        animate(centerY, target, GLIDE);
      }
      animate(visibility, 1, FADE);
    },
    [centerY, visibility]
  );

  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const next = rowRefs.current
        .slice(0, items.length)
        .map((el) => (el ? el.offsetTop + el.offsetHeight / 2 : 0));
      centersRef.current = next;
      setEnd(next.length > 0 ? next[next.length - 1] : 0);
      setMeasured(true);
      moveTo(hoveredRef.current ?? activeRef.current, true);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [items.length, moveTo]);

  React.useEffect(() => {
    moveTo(activeIndex);
  }, [activeIndex, moveTo]);

  const enter = (index: number) => {
    if (!followHover) return;
    hoveredRef.current = index;
    moveTo(index);
  };

  const leave = () => {
    if (!followHover) return;
    hoveredRef.current = null;
    moveTo(activeRef.current);
  };

  return (
    <ul
      ref={listRef}
      className={cn('relative flex flex-col gap-1.5 ps-7', className)}
      onPointerLeave={leave}
    >
      {/* Cột cây đường ray (Tree Rail) & Kim chỉ hướng di chuyển theo hover/active */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 start-0 w-6">
        {/* Đường ray nền */}
        <span
          className="absolute top-0 w-px bg-white/10"
          style={{ insetInlineStart: RAIL_X - 0.5, height: end }}
        />
        {/* Điểm kết thúc đường ray */}
        <span
          className="absolute size-1.5 rounded-full bg-white/20"
          style={{ insetInlineStart: RAIL_X - 2.5, top: end - 2 }}
        />
        {/* Vệt năng lượng sáng chạy dọc đường ray */}
        <motion.span
          className="absolute top-0 w-px origin-top bg-gradient-to-b from-blue-400 via-indigo-400 to-cyan-400 will-change-transform shadow-[0_0_10px_rgba(96,165,250,0.8)]"
          style={{
            insetInlineStart: RAIL_X - 0.5,
            height: end,
            scaleY: accentScale,
            opacity: visibility,
          }}
        />
        {/* Kim cương phát sáng (Diamond Marker) trượt theo vị trí hover / active */}
        <motion.span
          className="absolute top-0 rounded-[2px] bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-500 shadow-[0_0_12px_rgba(56,189,248,0.9)] will-change-transform"
          style={{
            insetInlineStart: RAIL_X - MARKER / 2,
            width: MARKER,
            height: MARKER,
            y: markerY,
            rotate: 45,
            opacity: visibility,
          }}
        />
      </span>

      {/* Viên thuốc nền trượt (Shared Gliding Pill Background) */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute end-0 start-5 top-0 rounded-xl bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-white/[0.04] border border-blue-400/25 will-change-transform shadow-[0_4px_20px_rgba(59,130,246,0.15)] backdrop-blur-sm"
        style={{ height: ROW_H, y: pillY, opacity: visibility }}
      />

      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const Icon = item.icon;

        return (
          <li
            key={item.href}
            ref={(el) => {
              rowRefs.current[index] = el;
            }}
            className="relative"
            onPointerEnter={() => enter(index)}
          >
            <RouterLink
              to={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => {
                hoveredRef.current = null;
                activeRef.current = index;
                moveTo(index);
                onSelect?.(item, e);
              }}
              onFocus={() => enter(index)}
              onBlur={leave}
              className={cn(
                'flex h-[38px] items-center gap-3 rounded-xl px-3.5 text-xs font-medium antialiased transition-all duration-150 ease-out select-none cursor-pointer',
                'active:scale-[0.97] active:bg-blue-500/25',
                isActive && !measured && 'bg-blue-500/15 border border-blue-500/25 text-white',
                isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors duration-200',
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
              )}
              <span className="truncate flex-1">{item.label}</span>

              {item.badge && (
                <span className="text-[10px] font-mono font-semibold text-slate-400 ml-auto">
                  {item.badge}
                </span>
              )}
            </RouterLink>
          </li>
        );
      })}
    </ul>
  );
}

export default TreeNav;
