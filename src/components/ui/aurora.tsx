"use client";

import React, { useState, useEffect, useRef, useCallback, type ComponentProps } from "react";
import { cn } from "@/utils/cn";

export interface UseInViewOptions {
  once?: boolean;
  rootMargin?: string;
  amount?: number;
  initial?: boolean;
  onChange?: (inView: boolean, entry?: IntersectionObserverEntry) => void;
}

export function useInView<T extends Element = Element>({
  once = false,
  rootMargin = "0px",
  amount = 0,
  initial = false,
  onChange,
}: UseInViewOptions = {}) {
  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState(initial);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => {
        setInView(true);
        onChangeRef.current?.(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        setInView(entry.isIntersecting);
        onChangeRef.current?.(entry.isIntersecting, entry);
        if (once && entry.isIntersecting) observer.disconnect();
      },
      { rootMargin, threshold: amount }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, once, rootMargin, amount]);

  const ref = useCallback((element: T | null) => setNode(element), []);
  return [ref, inView] as const;
}

// Where each light starts, how much slower than `duration` it drifts, and
// how far into its drift it begins, so the three never move in step.
const LIGHTS = [
  { left: "-15%", top: "-30%", pace: 1, start: 0 },
  { left: "40%", top: "-15%", pace: 1.35, start: -0.3 },
  { left: "10%", top: "35%", pace: 1.7, start: -0.65 },
];

export interface AuroraProps extends ComponentProps<"div"> {
  /** Three CSS colours, one per light. Theme variables or hex work. */
  colors?: [string, string, string];
  /** Seconds for the fastest light to finish one drift. */
  duration?: number;
  /** Opacity of the lights, from 0 to 1. */
  intensity?: number;
}

/**
 * Slow, soft light drifting behind its content. Three radial gradients
 * moved with transforms only: no blur filters, no canvas. The lights pause
 * while off screen and hold still with `prefers-reduced-motion`.
 */
export function Aurora({
  colors = ["#38bdf8", "#818cf8", "#c084fc"],
  duration = 20,
  intensity = 0.45,
  className,
  children,
  ...props
}: AuroraProps) {
  const [observe, inView] = useInView<HTMLDivElement>({ rootMargin: "200px" });

  return (
    <div
      ref={observe}
      data-slot="aurora"
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      <div
        aria-hidden="true"
        data-slot="aurora-lights"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {LIGHTS.map((light, index) => (
          <span
            key={index}
            className="animate-aurora absolute size-[75%] rounded-full motion-reduce:animate-none pointer-events-none"
            style={{
              left: light.left,
              top: light.top,
              background: `radial-gradient(closest-side, ${colors[index]}, transparent)`,
              opacity: intensity,
              animationDuration: `${duration * light.pace}s`,
              animationDelay: `${duration * light.start}s`,
              animationPlayState: inView ? "running" : "paused",
            }}
          />
        ))}
      </div>
      {children}
    </div>
  );
}

/**
 * Full page background version of Aurora from @kevingirelli (21st.dev)
 * Renders fixed behind all layout elements
 */
export function AuroraBackground({
  colors = ["#38bdf8", "#818cf8", "#c084fc"],
  duration = 24,
  intensity = 0.38,
  className = "",
}: {
  colors?: [string, string, string];
  duration?: number;
  intensity?: number;
  className?: string;
}) {
  const [wallpaper, setWallpaper] = useState(() => {
    if (typeof window === 'undefined') return 'aurora';
    return localStorage.getItem('11a10_app_wallpaper') || 'aurora';
  });

  useEffect(() => {
    const handleStorage = () => {
      setWallpaper(localStorage.getItem('11a10_app_wallpaper') || 'aurora');
    };
    window.addEventListener('app_wallpaper_changed', handleStorage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('app_wallpaper_changed', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Xác định bộ màu dựa trên chủ đề wallpaper
  let activeColors = colors;
  if (wallpaper === 'galaxy') {
    activeColors = ["#9333ea", "#3b82f6", "#ec4899"];
  } else if (wallpaper === 'cyber') {
    activeColors = ["#06b6d4", "#10b981", "#3b82f6"];
  } else if (wallpaper === 'sunset') {
    activeColors = ["#f43f5e", "#fb923c", "#a855f7"];
  } else if (wallpaper === 'dark') {
    activeColors = ["#1e1b4b", "#0f172a", "#1e293b"];
  }

  const isCustomImage = wallpaper && (wallpaper.startsWith('http') || wallpaper.startsWith('data:image'));

  return (
    <div
      aria-hidden="true"
      className={cn("fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#070310]", className)}
    >
      {/* Nếu người dùng chọn ảnh nền tùy chỉnh */}
      {isCustomImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
          style={{ backgroundImage: `url(${wallpaper})` }}
        >
          {/* Lớp phủ làm tối để bảo đảm các chữ và nút bấm luôn sắc nét, rõ ràng */}
          <div className="absolute inset-0 bg-[#070310]/75 backdrop-blur-[2px]" />
        </div>
      )}

      {/* Đèn cực quang Aurora chuyển động */}
      {LIGHTS.map((light, index) => (
        <span
          key={index}
          className="animate-aurora absolute size-[90vw] max-w-[1300px] max-h-[1300px] rounded-full motion-reduce:animate-none pointer-events-none"
          style={{
            left: light.left,
            top: light.top,
            background: `radial-gradient(closest-side, ${activeColors[index]}, transparent)`,
            opacity: isCustomImage ? intensity * 0.4 : intensity,
            animationDuration: `${duration * light.pace}s`,
            animationDelay: `${duration * light.start}s`,
          }}
        />
      ))}

      {/* Lớp hạt lưới tinh tế (micro dot grid texture) */}
      <div
        className="absolute inset-0 opacity-35 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 90% 90% at 50% 50%, #000 70%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 50% 50%, #000 70%, transparent 100%)",
        }}
      />
    </div>
  );
}

export default Aurora;
