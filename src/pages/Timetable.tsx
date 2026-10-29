import React, { useState, useEffect } from 'react';
import { Timetable, ScheduleSlot } from '@/types';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { TimetableUploadModal } from '@/components/timetable/TimetableUploadModal';
import { GlassButton } from '@/components/ui/glass-button';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  Printer,
  Download,
  RotateCcw,
  FileSpreadsheet,
  X,
  Sparkles,
} from 'lucide-react';
import {
  processMultipleTimetableFiles,
  downloadSampleTimetableExcel,
  saveTimetableToStorage,
  loadTimetableFromStorage,
  countTimetableSlots,
  clearSessionFromTimetable,
  clearTimetableSourceFiles,
  EMPTY_TIMETABLE,
} from '@/services/timetableExcelService';
import { INITIAL_TIMETABLE } from '@/data/mockData';
import { toast } from 'sonner';

export const TimetablePage: React.FC = () => {
  const [timetable, setTimetable] = useState<Timetable>(() => {
    const saved = loadTimetableFromStorage();
    return saved || INITIAL_TIMETABLE;
  });

  const [isEditable, setIsEditable] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Lưu tự động khi timetable thay đổi
  useEffect(() => {
    saveTimetableToStorage(timetable);
  }, [timetable]);

  /**
   * Xử lý nạp file (hỗ trợ 1 file, 2 file cùng lúc hoặc nạp riêng từng buổi)
   */
  const handleUploadFiles = async (
    files: FileList | File[],
    forceSession: 'Sáng' | 'Chiều' | 'Cả ngày' | 'auto' = 'auto'
  ) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    try {
      const sessionLabel =
        forceSession === 'Sáng'
          ? 'Buổi Sáng'
          : forceSession === 'Chiều'
          ? 'Buổi Chiều'
          : 'Tự động';

      toast.loading(`Đang phân tích và trích xuất lịch lớp 11A10 (${sessionLabel})...`, {
        id: 'import-tkb',
      });

      const result = await processMultipleTimetableFiles(fileArray, {
        targetClass: '11A10',
        forceSession,
        existingTimetable: timetable,
      });

      setTimetable(result.timetable);
      saveTimetableToStorage(result.timetable);

      const stats = countTimetableSlots(result.timetable.schedule);
      toast.success(
        `Đã nạp chính xác lịch học lớp 11A10! (${stats.morning} tiết Sáng, ${stats.afternoon} tiết Chiều) từ ${result.fileName}`,
        { id: 'import-tkb', duration: 4500 }
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể đọc tệp Excel. Vui lòng kiểm tra lại định dạng tệp.', {
        id: 'import-tkb',
        duration: 6000,
      });
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm trống toàn bộ thời khóa biểu để nạp hoặc nhập lại từ đầu?')) {
      setTimetable(EMPTY_TIMETABLE);
      toast.success('Đã làm trống toàn bộ thời khóa biểu');
    }
  };

  const handleClearSourceFile = () => {
    const updated = clearTimetableSourceFiles(timetable);
    setTimetable(updated);
    toast.success('Đã gỡ bỏ nguồn tệp tin');
  };

  const handleClearSession = (session: 'morning' | 'afternoon') => {
    const label = session === 'morning' ? 'Buổi Sáng' : 'Buổi Chiều';
    if (window.confirm(`Bạn có chắc chắn muốn xóa toàn bộ các tiết học ${label}?`)) {
      const updated = clearSessionFromTimetable(timetable, session);
      setTimetable(updated);
      toast.success(`Đã làm trống lịch học ${label}`);
    }
  };

  const handleUpdateSlot = (day: string, period: string, slot: ScheduleSlot | null) => {
    setTimetable((prev) => {
      const newSchedule = { ...prev.schedule };
      if (!newSchedule[day]) newSchedule[day] = {};

      if (slot) {
        newSchedule[day][period] = slot;
      } else {
        delete newSchedule[day][period];
      }

      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        schedule: newSchedule,
      };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const stats = countTimetableSlots(timetable.schedule);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Page Header */}
      <Card className="rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2.5 max-w-xl">
          <div className="inline-flex items-center gap-2 text-cyan-300 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Năm học 2026 - 2027 • THPT Cát Tiên</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Thời Khóa Biểu Lớp 11A10
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Trích xuất tự động từ file TKB toàn trường (hỗ trợ Sáng & Chiều riêng biệt)</span>
          </p>
        </div>

        {/* Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          <GlassButton
            size="sm"
            variant="primary"
            onClick={() => setIsUploadModalOpen(true)}
            title="Cập nhật Thời khóa biểu từ Excel (Sáng / Chiều / Gộp 2 file)"
            contentClassName="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white font-semibold"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
            <span>Nạp TKB Excel</span>
          </GlassButton>

          <GlassButton
            size="sm"
            variant="success"
            onClick={downloadSampleTimetableExcel}
            title="Tải tệp Excel mẫu để điền rồi nạp vào web"
            contentClassName="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Tải file mẫu</span>
          </GlassButton>

          <GlassButton
            size="sm"
            variant="secondary"
            onClick={() => setIsEditable(!isEditable)}
            contentClassName="px-3 py-1.5 text-xs text-white"
          >
            <span>{isEditable ? '✓ Xong sửa' : '✎ Sửa trực tiếp'}</span>
          </GlassButton>

          <GlassButton
            size="sm"
            variant="destructive"
            onClick={handleClearAll}
            title="Làm trống toàn bộ để tự nhập"
            contentClassName="p-2 text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </GlassButton>

          <GlassButton
            size="sm"
            variant="secondary"
            onClick={handlePrint}
            title="In thời khóa biểu"
            contentClassName="p-2 text-white"
          >
            <Printer className="w-3.5 h-3.5" />
          </GlassButton>
        </div>
      </Card>

      {/* Thanh trạng thái tóm tắt siêu mỏng & tinh tế */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="font-semibold text-white">Lớp 11A10</span>
          </div>

          <span className="text-white/20 hidden sm:inline">•</span>

          <div className="flex items-center gap-2 text-slate-300">
            <span>Sáng: <strong className="text-white">{stats.morning}</strong> tiết</span>
            <span className="text-white/20">|</span>
            <span>Chiều: <strong className="text-white">{stats.afternoon}</strong> tiết</span>
            <span className="text-white/20">|</span>
            <span>Tổng: <strong className="text-cyan-300">{stats.total}</strong> tiết</span>
          </div>

          {timetable.fileName && (
            <>
              <span className="text-white/20 hidden md:inline">•</span>
              <div className="hidden md:flex items-center gap-1.5 text-slate-400 truncate max-w-sm">
                <FileSpreadsheet className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{timetable.fileName}</span>
                <button
                  type="button"
                  onClick={handleClearSourceFile}
                  className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer"
                  title="Gỡ nguồn tệp tin"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>{stats.total > 0 ? 'Đổi / Nạp lại Excel' : 'Nạp file Excel'}</span>
        </button>
      </div>

      {/* Bảng Thời khóa biểu chính */}
      <TimetableGrid
        timetable={timetable}
        onUpdateSlot={handleUpdateSlot}
        isEditable={isEditable}
      />

      {/* Modal nạp file Excel cao cấp */}
      <TimetableUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        timetable={timetable}
        onUploadFiles={handleUploadFiles}
        onClearSession={handleClearSession}
        onClearSourceFile={handleClearSourceFile}
        onClearAll={handleClearAll}
        onDownloadSample={downloadSampleTimetableExcel}
      />
    </div>
  );
};

export default TimetablePage;
