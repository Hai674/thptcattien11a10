import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Hàm tiện ích kết hợp classNames và gộp Tailwind CSS hợp lệ
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
