import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { BackgroundParticles } from '@/components/common/BackgroundParticles';
import { ClassLotteryModal } from '@/components/common/ClassLotteryModal';
import { cn } from '@/utils/cn';

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLotteryOpen, setIsLotteryOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('11a10_sidebar_collapsed') !== 'false';
  });

  const location = useLocation();

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  const handleCollapse = useCallback(() => {
    setIsCollapsed(true);
    setIsSidebarOpen(false);
    localStorage.setItem('11a10_sidebar_collapsed', 'true');
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('11a10_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  // Tự động thu hồi Sidebar về chỗ cũ và ẩn/hiện Header khi lướt trang
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY.current;

          // Lướt trang (lướt lên hoặc lướt xuống với delta khác 0) -> tự động thu hồi Sidebar về chỗ cũ
          if (Math.abs(delta) > 5) {
            handleCollapse();
          }

          // Nếu ở gần đỉnh (<= 25px), luôn hiển thị Header
          if (currentScrollY <= 25) {
            setIsHeaderVisible(true);
          } else {
            // Lướt xuống (delta > 6 và đã cuộn qua 50px) -> ẩn thanh Header
            if (delta > 6 && currentScrollY > 50) {
              setIsHeaderVisible(false);
            }
            // Lướt ngược lên (delta < -6) -> hiện lại thanh Header
            else if (delta < -6) {
              setIsHeaderVisible(true);
            }
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    // Bắt sự kiện lăn chuột (wheel) để thu hồi ngay khi vừa lăn chuột
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 6) {
        handleCollapse();
      }
    };

    // Bắt sự kiện vuốt trên màn hình cảm ứng điện thoại / tablet
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      if (Math.abs(touchY - touchStartY) > 10) {
        handleCollapse();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleCollapse]);

  // Khi chuyển trang (route change), tự động thu hồi sidebar và đưa header về hiển thị
  useEffect(() => {
    setIsHeaderVisible(true);
    handleCollapse();
    lastScrollY.current = window.scrollY;
  }, [location.pathname, handleCollapse]);

  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-slate-100 relative font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Nền hiệu ứng hạt sao và hào quang */}
      <BackgroundParticles />

      {/* Hộp thoại bốc thăm ngẫu nhiên học sinh 11A10 */}
      <ClassLotteryModal
        isOpen={isLotteryOpen}
        onClose={() => setIsLotteryOpen(false)}
      />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar cố định 100% khi lướt trang */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onCollapse={handleCollapse}
        />

        {/* Khối nội dung chính: tự động chừa lề cho Sidebar cố định */}
        <div
          className={cn(
            'flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
            isCollapsed ? 'md:pl-[72px]' : 'md:pl-64'
          )}
        >
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onOpenLottery={() => setIsLotteryOpen(true)}
            isVisible={isHeaderVisible}
          />

          {/* Khu vực nội dung chính có hiệu ứng chuyển trang vuốt lướt cuộn mượt mà */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto w-full overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Outlet context={{ openLottery: () => setIsLotteryOpen(true) }} />
              </motion.div>
            </AnimatePresence>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
