import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { loadMembersFromStorage } from '@/services/memberService';
import { ClassHeroShowcase } from '@/components/common/ClassHeroShowcase';
import { HoloTiltCard } from '@/components/common/HoloTiltCard';
import { GlassButton } from '@/components/ui/glass-button';
import {
  Calendar,
  ArrowRight,
  Dices,
} from 'lucide-react';

interface LayoutContextType {
  openLottery: () => void;
}

export const Home: React.FC = () => {
  const context = useOutletContext<LayoutContextType>();
  const members = loadMembersFromStorage();

  const bcsMembers = members.filter(
    (m) =>
      m.role.includes('Lớp trưởng') ||
      m.role.includes('Bí thư') ||
      m.role.includes('Lớp phó')
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-16">
      {/* ================= HERO EDITORIAL MINIMAL BANNER ================= */}
      <div className="relative py-4 sm:py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Content (Col 7) */}
          <div className="lg:col-span-7 space-y-6">


            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
              <span>Tập thể 11A10</span><br />
              <span>Gắn kết vươn xa</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-300">
                Cháy trọn thanh xuân
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              Trang thông tin chính thức của lớp 11A10 THPT Cát Tiên, cập nhật thời khóa biểu, hoạt động phong trào và lưu giữ kỷ niệm tuổi học trò
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/thanh-vien">
                <GlassButton
                  size="default"
                  variant="primary"
                >
                  <span>Xem danh sách thành viên</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </GlassButton>
              </Link>

              <Link to="/thoi-khoa-bieu">
                <GlassButton
                  size="default"
                  variant="secondary"
                >
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Thời khóa biểu</span>
                </GlassButton>
              </Link>

              <GlassButton
                size="default"
                variant="default"
                onClick={() => context?.openLottery?.()}
              >
                <Dices className="w-4 h-4 text-amber-400" />
                <span>Bốc thăm may mắn</span>
              </GlassButton>
            </div>
          </div>

          {/* Right: macOS Engine Showcase (Col 5) */}
          <div className="lg:col-span-5 w-full flex items-center justify-center relative py-4 lg:py-0">
            <ClassHeroShowcase />
          </div>
        </div>
      </div>



      {/* ================= BAN CÁN SỰ LỚP 11A10 ================= */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Ban Cán Sự Lớp 11A10
            </h2>
          </div>
          <Link to="/thanh-vien">
            <GlassButton
              size="sm"
              variant="secondary"
            >
              <span>Xem danh sách thành viên</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </GlassButton>
          </Link>
        </div>

        {/* Grid 4 ban cán sự */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bcsMembers.slice(0, 4).map((member, idx) => (
            <HoloTiltCard
              key={member.id}
              className="p-5 text-center space-y-4"
            >
              <div className="relative inline-block mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {member.fullName.charAt(0)}
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-white">
                  {member.fullName}
                </h3>
                <span className="inline-block mt-1 text-xs font-medium text-blue-300">
                  {member.role}
                </span>
              </div>

              {member.quote && (
                <p className="text-xs text-slate-400 italic line-clamp-2 px-2">
                  "{member.quote}"
                </p>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{member.birthDate}</span>
                <span className="text-slate-300">11A10</span>
              </div>
            </HoloTiltCard>
          ))}
        </div>
      </div>
    </div>
  );
};
