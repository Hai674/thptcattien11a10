import React, { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { loadMembersFromStorage } from '@/services/memberService';
import { ClassHeroShowcase } from '@/components/common/ClassHeroShowcase';
import { HoloTiltCard } from '@/components/common/HoloTiltCard';
import { GlassButton } from '@/components/ui/glass-button';
import {
  Calendar,
  ArrowRight,
  Dices,
  Sparkles,
  Paperclip,
  Users,
  Bell,
  BookOpen,
  Send,
  School,
  Heart,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';

interface LayoutContextType {
  openLottery: () => void;
}

export const Home: React.FC = () => {
  const context = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();
  const members = loadMembersFromStorage();
  const [searchQuery, setSearchQuery] = useState('');

  const bcsMembers = members.filter(
    (m) =>
      m.role.includes('Lớp trưởng') ||
      m.role.includes('Bí thư') ||
      m.role.includes('Lớp phó')
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    if (query.includes('thời khóa biểu') || query.includes('tkb') || query.includes('lịch') || query.includes('tiết')) {
      navigate('/thoi-khoa-bieu');
    } else if (query.includes('thông báo') || query.includes('tin') || query.includes('họp')) {
      navigate('/thong-bao');
    } else if (query.includes('tài liệu') || query.includes('đề thi') || query.includes('bài giảng') || query.includes('sách')) {
      navigate('/thu-vien');
    } else if (query.includes('bốc thăm') || query.includes('quay số') || query.includes('may mắn')) {
      context?.openLottery?.();
      toast.info('Đang mở hộp thoại bốc thăm may mắn!');
    } else {
      navigate(`/thanh-vien?q=${encodeURIComponent(searchQuery.trim())}`);
      toast.success(`Đang tìm kiếm thành viên: "${searchQuery.trim()}"`);
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-500 pb-20 pt-2">
      {/* ================= HERO 21ST.DEV ULTIMATE REDESIGN ================= */}
      <section className="relative text-center max-w-5xl mx-auto px-4 pt-4 sm:pt-8 pb-8">
        {/* Introducing Pill Badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#1c1528]/80 hover:bg-[#251b36] transition-all border border-purple-500/30 backdrop-blur-xl rounded-full px-4 py-1.5 flex items-center gap-2.5 shadow-[0_0_25px_rgba(139,92,246,0.2)] group cursor-default">
            <span className="text-xs font-medium text-purple-200 flex items-center gap-2">
              <span className="bg-purple-500/25 text-purple-300 p-1 rounded-full text-xs">✨</span>
              Không gian số Tập thể Lớp 11A10 • THPT Cát Tiên
            </span>
          </div>
        </div>

        {/* Headline with breathing room & zero clipping */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.18] text-white select-none">
            <span className="block text-slate-100">TẬP THỂ LỚP 11A10</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-sky-300">
              Gắn kết vươn xa • Cháy trọn thanh xuân
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed pt-2">
            Cổng thông tin &amp; lưu trữ số chính thức lớp 11A10 THPT Cát Tiên — Thời khóa biểu cập nhật theo thời gian thực, bảng tin phong trào và vinh danh kỷ niệm học trò rực rỡ.
          </p>
        </div>

        {/* 21st.dev Style Search & Command Bar */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto w-full pt-8">
          <div className="bg-[#160d22]/90 backdrop-blur-2xl border border-white/10 hover:border-purple-500/40 focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-500/20 rounded-full p-2 sm:p-2.5 flex items-center shadow-2xl transition-all">
            <button
              type="button"
              title="Đính kèm"
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              title="Tính năng thông minh"
              className="p-2 rounded-full hover:bg-purple-500/20 text-purple-400 transition-colors"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bạn cùng lớp, thời khóa biểu, tài liệu ôn thi..."
              className="bg-transparent flex-1 outline-none text-slate-100 placeholder:text-slate-500 px-3 text-xs sm:text-sm md:text-base font-normal min-w-0"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <span className="hidden sm:inline">Tìm kiếm</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Suggestion Pills / Quick Shortcuts */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 pt-5 max-w-3xl mx-auto">
          <Link to="/thanh-vien">
            <button
              type="button"
              className="bg-[#180f26]/80 hover:bg-[#25173d] border border-white/10 hover:border-blue-400/40 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-300 hover:text-white transition-all flex items-center gap-1.5 group shadow-sm cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>42 Thành viên lớp</span>
            </button>
          </Link>

          <Link to="/thoi-khoa-bieu">
            <button
              type="button"
              className="bg-[#180f26]/80 hover:bg-[#25173d] border border-white/10 hover:border-purple-400/40 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-300 hover:text-white transition-all flex items-center gap-1.5 group shadow-sm cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Thời khóa biểu tuần</span>
            </button>
          </Link>

          <Link to="/thong-bao">
            <button
              type="button"
              className="bg-[#180f26]/80 hover:bg-[#25173d] border border-white/10 hover:border-amber-400/40 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-300 hover:text-white transition-all flex items-center gap-1.5 group shadow-sm cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Bảng tin thông báo</span>
            </button>
          </Link>

          <Link to="/thu-vien">
            <button
              type="button"
              className="bg-[#180f26]/80 hover:bg-[#25173d] border border-white/10 hover:border-emerald-400/40 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-300 hover:text-white transition-all flex items-center gap-1.5 group shadow-sm cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Thư viện đề thi</span>
            </button>
          </Link>

          <button
            type="button"
            onClick={() => context?.openLottery?.()}
            className="bg-[#180f26]/80 hover:bg-[#25173d] border border-white/10 hover:border-pink-400/40 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-300 hover:text-white transition-all flex items-center gap-1.5 group shadow-sm cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5 text-pink-400 group-hover:rotate-45 transition-transform" />
            <span>Bốc thăm may mắn</span>
          </button>
        </div>
      </section>

      {/* ================= BENTO SHOWCASE: SCHEDULE & CLASS IDENTITY ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
        {/* Left: macOS Engine Live Timetable Showcase (Col 7) */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
                Lịch Học Trực Tuyến Hôm Nay
              </h2>
            </div>
            <Link to="/thoi-khoa-bieu" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
              <span>Xem cả tuần</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ClassHeroShowcase />
        </div>

        {/* Right: Class Identity & Quick Insights Bento Card (Col 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Card 1: School & Class Info */}
          <div className="p-6 rounded-3xl bg-[#140b20]/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amber-400/30 shadow-lg bg-slate-900 shrink-0">
                <img src="/logo-11a10.jpg" alt="Logo 11A10" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Lớp 11A10</h3>
                <p className="text-xs text-amber-300/90 font-medium flex items-center gap-1">
                  <School className="w-3 h-3" />
                  Trường THPT Cát Tiên • Lâm Đồng
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tập thể 11A10 là mái nhà chung của 42 đoàn viên, học sinh năng động, luôn nỗ lực trong học tập và dẫn đầu trong các phong trào thi đua của trường.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5">
                <span className="block text-xl font-black text-white font-display">42</span>
                <span className="text-[11px] text-slate-400 font-medium">Học sinh</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5">
                <span className="block text-xl font-black text-blue-400 font-display">100%</span>
                <span className="text-[11px] text-slate-400 font-medium">Đoàn viên</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5">
                <span className="block text-xl font-black text-amber-400 font-display">TOP</span>
                <span className="text-[11px] text-slate-400 font-medium">Phong trào</span>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Fast Shortcuts */}
          <div className="p-5 rounded-3xl bg-[#140b20]/80 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Bốc thăm trả lời bài</h4>
                <p className="text-[11px] text-slate-400">Chọn ngẫu nhiên 1 học sinh</p>
              </div>
            </div>
            <GlassButton
              size="sm"
              variant="default"
              onClick={() => context?.openLottery?.()}
              contentClassName="flex items-center gap-1.5 text-xs text-amber-300 font-medium"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>Bốc thăm</span>
            </GlassButton>
          </div>
        </div>
      </section>

      {/* ================= BAN CÁN SỰ LỚP 11A10 ================= */}
      <section className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Ban Cán Sự Lớp 11A10</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Những gương mặt đại diện dẫn dắt phong trào và học tập của tập thể</p>
          </div>
          <Link to="/thanh-vien">
            <GlassButton
              size="sm"
              variant="secondary"
            >
              <span>Xem tất cả 42 thành viên</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </GlassButton>
          </Link>
        </div>

        {/* Grid 4 ban cán sự */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bcsMembers.slice(0, 4).map((member) => (
            <HoloTiltCard
              key={member.id}
              className="p-5 text-center space-y-4"
            >
              <div className="relative inline-block mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  {member.fullName.charAt(0)}
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-white">
                  {member.fullName}
                </h3>
                <span className="inline-block mt-1 text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
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
                <span className="text-blue-300 font-semibold">11A10</span>
              </div>
            </HoloTiltCard>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
