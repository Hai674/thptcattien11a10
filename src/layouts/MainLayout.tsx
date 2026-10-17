import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { ClassLotteryModal } from '@/components/common/ClassLotteryModal';
import { AuroraBackground } from '@/components/ui/aurora';
import { cn } from '@/utils/cn';

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLotteryOpen, setIsLotteryOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('11a10_sidebar_collapsed') === 'true';
  });

  const location = useLocation();

  const [isHeaderVisible] = useState(true);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('11a10_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* 21st.dev @kevingirelli Aurora Background */}
      <AuroraBackground />

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
