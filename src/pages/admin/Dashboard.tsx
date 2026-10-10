import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadMembersFromStorage } from '@/services/memberService';
import { loadAnnouncementsFromStorage } from '@/services/announcementService';
import { loadLibraryFromStorage } from '@/services/libraryService';
import { loadUsersFromStorage } from '@/services/userService';
import { GlassButton } from '@/components/ui/glass-button';
import { Card } from '@/components/ui/card';
import {
  Users,
  Bell,
  BookOpen,
  Calendar,
  Shield,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Clock,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const members = loadMembersFromStorage();
  const announcements = loadAnnouncementsFromStorage();
  const libraryItems = loadLibraryFromStorage();
  const [usersList] = useState(() => loadUsersFromStorage());

  const activeUsers = usersList.filter((u) => u.status !== 'blocked');

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-20">
      {/* Banner Quản trị Liquid Glass */}
      <Card className="p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-5 max-w-xl">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)] shrink-0 hidden sm:block bg-slate-900">
            <img src="/logo-11a10.jpg" alt="Logo Lớp 11A10" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-[11px] font-mono tracking-wider uppercase backdrop-blur-md">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>GẮN KẾT &amp; VƯƠN XA • TỰ HÀO 11A10</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Bảng điều khiển quản trị
            </h1>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Hệ thống quản lý nội bộ tập thể lớp 11A10 — THPT Cát Tiên, Lâm Đồng.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/announcements">
            <GlassButton
              size="sm"
              variant="primary"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Tạo thông báo</span>
            </GlassButton>
          </Link>
          <Link to="/admin/timetable">
            <GlassButton
              size="sm"
              variant="secondary"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thời khóa biểu</span>
            </GlassButton>
          </Link>
        </div>
      </Card>

      {/* 4 Thẻ Thống Kê Chỉ Số Liquid Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Tổng thành viên',
            value: `${members.length}`,
            sub: `${members.length} học sinh trong danh sách`,
            icon: Users,
          },
          {
            label: 'Thông báo đã đăng',
            value: `${announcements.length}`,
            sub: 'Bản tin hoạt động',
            icon: Bell,
          },
          {
            label: 'Tài liệu học tập',
            value: `${libraryItems.length}`,
            sub: 'Đề cương & bài giảng',
            icon: BookOpen,
          },
          {
            label: 'Tài khoản thành viên',
            value: `${activeUsers.length}`,
            sub: 'Đăng ký kích hoạt tự động',
            icon: UserCheck,
            highlight: false,
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              className="p-5 space-y-3"
            >
              <div className="flex items-center justify-between text-white/60">
                <span className="text-xs font-mono">{stat.label}</span>
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/80 backdrop-blur-md">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${stat.highlight ? 'text-amber-400' : 'text-white'}`}>
                  {stat.value}
                </h3>
                <p className="text-[11px] text-white/60 mt-0.5">{stat.sub}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Grid 2 Cột Quản Lý */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bảng Thành viên tài khoản mới */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-white/70" /> Thành viên tài khoản mới
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {activeUsers.length}
              </span>
            </h3>
            <Link to="/admin/users" className="text-xs text-white/70 hover:text-white transition-colors">
              Quản lý tài khoản →
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {usersList.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-center text-white/60 space-y-2 backdrop-blur-md">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto" />
                <p className="text-xs text-white/80 font-medium">Chưa có tài khoản nào được tạo</p>
                <p className="text-[11px] text-white/50">Khi học sinh đăng ký tài khoản, danh sách sẽ hiển thị tại đây</p>
              </div>
            ) : (
              usersList.slice(0, 4).map((student) => (
                <div
                  key={student.uid}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between hover:bg-white/[0.08] transition-colors backdrop-blur-md"
                >
                  <div>
                    <p className="font-medium text-white">{student.displayName || 'Học sinh'}</p>
                    <p className="text-[11px] font-mono text-white/50">
                      {student.email} • {student.classId || '11A10'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      student.status === 'blocked'
                        ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                        : student.role === 'admin'
                        ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {student.status === 'blocked' ? 'Bị khóa' : student.role === 'admin' ? 'Admin' : 'Hoạt động'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Lối tắt quản trị */}
        <Card className="p-6 space-y-4 h-full flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm pb-3 border-b border-white/10">
              Lối tắt thao tác nhanh
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <Link
                to="/admin/announcements"
                className="p-4 rounded-2xl bg-white/[0.06] border border-white/20 hover:bg-white/[0.12] hover:border-white/40 transition-all block group backdrop-blur-md shadow-sm"
              >
                <Bell className="w-4 h-4 text-white/80 mb-2 group-hover:text-white transition-colors" />
                <p className="font-medium text-white">Đăng thông báo</p>
                <p className="text-[10px] text-white/60 mt-0.5">Bản tin học tập, nề nếp</p>
              </Link>

              <Link
                to="/admin/members"
                className="p-4 rounded-2xl bg-white/[0.06] border border-white/20 hover:bg-white/[0.12] hover:border-white/40 transition-all block group backdrop-blur-md shadow-sm"
              >
                <Users className="w-4 h-4 text-white/80 mb-2 group-hover:text-white transition-colors" />
                <p className="font-medium text-white">Hồ sơ học sinh</p>
                <p className="text-[10px] text-white/60 mt-0.5">{members.length} thành viên 11A10</p>
              </Link>

              <Link
                to="/admin/library"
                className="p-4 rounded-2xl bg-white/[0.06] border border-white/20 hover:bg-white/[0.12] hover:border-white/40 transition-all block group backdrop-blur-md shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-white/80 mb-2 group-hover:text-white transition-colors" />
                <p className="font-medium text-white">Thư viện tài liệu</p>
                <p className="text-[10px] text-white/60 mt-0.5">{libraryItems.length} tài liệu học tập</p>
              </Link>

              <Link
                to="/admin/timetable"
                className="p-4 rounded-2xl bg-white/[0.06] border border-white/20 hover:bg-white/[0.12] hover:border-white/40 transition-all block group backdrop-blur-md shadow-sm"
              >
                <Calendar className="w-4 h-4 text-white/80 mb-2 group-hover:text-white transition-colors" />
                <p className="font-medium text-white">Thời khóa biểu</p>
                <p className="text-[10px] text-white/60 mt-0.5">Chiều vào tiết lúc 14:00</p>
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50">
            <span>Trạng thái: <strong className="text-emerald-400 font-normal">Trực tuyến</strong></span>
            <span>THPT Cát Tiên</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
