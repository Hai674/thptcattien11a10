import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Announcement } from '@/types';
import { loadAnnouncementsFromStorage } from '@/services/announcementService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Bell,
  Search,
  Flame,
  Calendar,
  User,
  ArrowRight,
  Eye,
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadAnnouncementsFromStorage()
  );
  const [filter, setFilter] = useState<'all' | 'urgent' | 'normal'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setAnnouncements(loadAnnouncementsFromStorage());
  }, []);

  const filteredList = announcements.filter((item) => {
    const matchFilter = filter === 'all' || item.priority === filter;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <Bell className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Bảng Tin & Thông Báo Lớp</h1>
            <p className="text-xs text-slate-400 mt-1">
              Thông tin nề nếp, thi cử, hoạt động phong trào Đoàn trường
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Tìm thông báo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs rounded-xl border-white/10 bg-white/[0.04] backdrop-blur-md text-white placeholder:text-slate-400/70 focus:border-indigo-400/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_4px_12px_rgba(0,0,0,0.2)]"
            />
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <GlassButton
          size="sm"
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
        >
          <span>Tất cả ({announcements.length})</span>
        </GlassButton>
        <GlassButton
          size="sm"
          variant={filter === 'urgent' ? 'destructive' : 'secondary'}
          onClick={() => setFilter('urgent')}
        >
          <Flame className="w-3.5 h-3.5 text-red-400" />
          <span>Khẩn cấp</span>
        </GlassButton>
        <GlassButton
          size="sm"
          variant={filter === 'normal' ? 'primary' : 'secondary'}
          onClick={() => setFilter('normal')}
        >
          <span>Thông báo thường</span>
        </GlassButton>
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            Không tìm thấy thông báo nào phù hợp với từ khóa "{search}"
          </Card>
        ) : (
          filteredList.map((item) => (
            <Card
              key={item.id}
              className="hover:scale-[1.008] transition-all duration-300"
            >
              <CardContent className="p-5 md:p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.priority === 'urgent' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-300">
                        <Flame className="w-3.5 h-3.5 text-red-400" /> THÔNG BÁO KHẨN
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                        Tin lớp
                      </span>
                    )}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Eye className="w-3.5 h-3.5" /> {item.views} lượt xem
                  </span>
                </div>

                <Link to={`/thong-bao/${item.id}`} className="block group">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                </Link>

                <p className="text-slate-300 text-xs md:text-sm line-clamp-3 whitespace-pre-line leading-relaxed">
                  {item.content}
                </p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Người gửi: <strong>{item.authorName}</strong></span>
                  </span>
                  <Link to={`/thong-bao/${item.id}`}>
                    <GlassButton
                      size="sm"
                      variant="primary"
                    >
                      <span>Đọc toàn bộ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </GlassButton>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
