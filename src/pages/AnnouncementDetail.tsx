import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadAnnouncementsFromStorage } from '@/services/announcementService';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const AnnouncementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const announcements = loadAnnouncementsFromStorage();
  const announcement = announcements.find((a) => a.id === id) || announcements[0];

  const handleMarkAsRead = () => {
    toast.success('Đã đánh dấu đã đọc thông báo này');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <GlassButton
        size="sm"
        variant="secondary"
        onClick={() => navigate('/thong-bao')}
      >
        <ArrowLeft className="w-4 h-4 text-sky-400" />
        <span>Quay lại danh sách thông báo</span>
      </GlassButton>

      <Card className="p-6 md:p-8 rounded-3xl space-y-6">
        {/* Header chi tiết */}
        <div className="space-y-3 pb-6 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {announcement.priority === 'urgent' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                <Flame className="w-3.5 h-3.5 text-red-400" /> THÔNG BÁO KHẨN CẤP
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                Bản tin lớp 11A10
              </span>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {new Date(announcement.createdAt).toLocaleDateString('vi-VN')}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono ml-auto">
              <Eye className="w-3.5 h-3.5" /> {announcement.views + 1} lượt xem
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
            {announcement.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>Được đăng tải bởi: <strong className="text-white">{announcement.authorName}</strong></span>
          </div>
        </div>

        {/* Nội dung chi tiết */}
        <div className="prose prose-invert max-w-none text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line space-y-4">
          {announcement.content}
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <GlassButton
            size="sm"
            variant="success"
            onClick={handleMarkAsRead}
          >
            <CheckCircle className="w-4 h-4 text-white" />
            <span>Đánh dấu đã đọc</span>
          </GlassButton>

          <Link to="/thong-bao">
            <GlassButton
              size="sm"
              variant="secondary"
            >
              <span>Đóng</span>
            </GlassButton>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AnnouncementDetailPage;
