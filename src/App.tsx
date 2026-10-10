import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Layouts
import { MainLayout } from '@/layouts/MainLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Public Pages
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';

// Member Pages
import { Home } from '@/pages/Home';
import { AnnouncementsPage } from '@/pages/Announcements';
import { AnnouncementDetailPage } from '@/pages/AnnouncementDetail';
import { MembersPage } from '@/pages/Members';
import { LibraryPage } from '@/pages/Library';
import { TimetablePage } from '@/pages/Timetable';
import { ProfilePage } from '@/pages/Profile';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminUsersPage } from '@/pages/admin/AdminUsers';
import { AdminAnnouncementsPage } from '@/pages/admin/AdminAnnouncements';
import { AdminMembersPage } from '@/pages/admin/AdminMembers';
import { AdminLibraryPage } from '@/pages/admin/AdminLibrary';
import { AdminTimetablePage } from '@/pages/admin/AdminTimetable';
import { AdminSettingsPage } from '@/pages/admin/AdminSettings';
import { PrismCometPreloader } from '@/components/ui/prism-comet-preloader';
import { NotFound } from '@/components/ui/not-found-2';
import { initAntiF12 } from '@/utils/antiDevtools';
import { useAuth } from '@/hooks/useAuth';

export const App: React.FC = () => {
  // Đồng bộ phiên đăng nhập toàn cục liên tục trong suốt vòng đời ứng dụng
  useAuth();

  const [showIntro, setShowIntro] = React.useState(() => {
    // Chỉ hiển thị intro 1 lần trong mỗi phiên mở trình duyệt để tránh load lâu
    return !sessionStorage.getItem('11a10_intro_viewed');
  });

  React.useEffect(() => {
    const cleanup = initAntiF12();
    return cleanup;
  }, []);

  const appRouter = (
    <BrowserRouter>
      {/* Toast thông báo sonner */}
      <Toaster position="top-right" richColors />

      <Routes>
        {/* Tuyến đường công khai (Public Routes) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Tuyến đường dành cho Thành viên Lớp (Member Routes) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="thong-bao" element={<AnnouncementsPage />} />
          <Route path="thong-bao/:id" element={<AnnouncementDetailPage />} />
          <Route path="thanh-vien" element={<MembersPage />} />
          <Route path="thu-vien" element={<LibraryPage />} />
          <Route path="thoi-khoa-bieu" element={<TimetablePage />} />
          <Route path="ca-nhan" element={<ProfilePage />} />
        </Route>

        {/* Tuyến đường dành riêng cho Ban Cán Sự & GVCN (Admin Routes) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="announcements" element={<AdminAnnouncementsPage />} />
          <Route path="members" element={<AdminMembersPage />} />
          <Route path="library" element={<AdminLibraryPage />} />
          <Route path="timetable" element={<AdminTimetablePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Route Demo & 404 Not Found */}
        <Route path="/demo" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );

  if (!showIntro) {
    return appRouter;
  }

  return (
    <PrismCometPreloader
      word="11A10"
      caption="TẬP THỂ 11A10 · THPT CÁT TIÊN"
      durationMs={1200}
      onComplete={() => {
        sessionStorage.setItem('11a10_intro_viewed', 'true');
        setShowIntro(false);
      }}
    >
      {appRouter}
    </PrismCometPreloader>
  );
};

export default App;
