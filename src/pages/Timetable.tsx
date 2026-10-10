import React, { useState, useEffect, useRef } from 'react';
import { Timetable, ScheduleSlot } from '@/types';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  Printer,
  Download,
  Upload,
  Clock,
  Info,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import {
  parseTimetableFromExcel,
  downloadSampleTimetableExcel,
  saveTimetableToStorage,
  loadTimetableFromStorage,
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lưu tự động khi timetable thay đổi
  useEffect(() => {
    saveTimetableToStorage(timetable);
  }, [timetable]);

  const handleFileUpload = async (file: File) => {
    try {
      const parsed = await parseTimetableFromExcel(file);
      setTimetable(parsed);
      toast.success(`Đã nạp thành công thời khóa biểu từ tệp: ${file.name}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể đọc tệp Excel. Vui lòng kiểm tra định dạng tệp.');
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // reset input
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm trống toàn bộ thời khóa biểu để tự nhập từ đầu?')) {
      setTimetable(EMPTY_TIMETABLE);
      toast.success('Đã làm trống thời khóa biểu');
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

  // Đếm tổng số tiết đã có môn học
  const totalSlots = Object.values(timetable.schedule).reduce((acc, day) => {
    return acc + Object.keys(day || {}).length;
  }, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Ẩn input file */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={onFileInputChange}
        className="hidden"
      />

      {/* Page Header */}
      <Card className="rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Năm học 2026 - 2027 • Lớp 11A10</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Thời Khóa Biểu Học Tập
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Quy chuẩn 4 tiết Sáng + 4 tiết Chiều • THPT Cát Tiên</span>
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            <GlassButton
              size="sm"
              variant="success"
              onClick={downloadSampleTimetableExcel}
              title="Tải tệp Excel mẫu để điền rồi nạp vào web"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Tải file Excel mẫu</span>
            </GlassButton>

            <GlassButton
              size="sm"
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>Nạp file Excel lên</span>
            </GlassButton>

            <GlassButton
              size="sm"
              variant="default"
              onClick={() => setIsEditable(!isEditable)}
            >
              <span>{isEditable ? '✓ Xong sửa' : '✎ Sửa trực tiếp'}</span>
            </GlassButton>

            <GlassButton
              size="sm"
              variant="destructive"
              onClick={handleClearAll}
              title="Làm trống toàn bộ để tự nhập"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </GlassButton>

            <GlassButton
              size="sm"
              variant="secondary"
              onClick={handlePrint}
              title="In thời khóa biểu"
            >
              <Printer className="w-3.5 h-3.5" />
            </GlassButton>
          </div>
      </Card>

      {/* Drag & Drop Excel Dropzone Banner */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
            : 'border-white/10 bg-white/[0.02] hover:border-blue-400/50 hover:bg-white/[0.04]'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-1">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-white">
          Kéo thả tệp Excel vào đây hoặc nhấp để chọn tệp (.xlsx, .xls)
        </p>
        <p className="text-xs text-slate-400 max-w-md">
          Hệ thống sẽ tự động phân tích các cột Thứ 2 đến Thứ 7 (Sáng 4 tiết, Chiều 4 tiết) và cập nhật thời khóa biểu lên website ngay lập tức
        </p>
        {totalSlots > 0 && (
          <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đang hiển thị {totalSlots} tiết học thực tế</span>
          </span>
        )}
      </div>

      {/* Bảng Thời khóa biểu chính */}
      <TimetableGrid
        timetable={timetable}
        onUpdateSlot={handleUpdateSlot}
        isEditable={isEditable}
      />

      {/* Thông tin nề nếp */}
      <Card className="p-4 sm:p-5 rounded-2xl flex items-start sm:items-center gap-3.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" />
        <p className="leading-relaxed">
          <strong className="text-white">Quy chuẩn thời gian:</strong> Buổi sáng bắt đầu lúc <strong>07:00</strong> (4 tiết), buổi chiều bắt đầu lúc <strong>14:00</strong> (4 tiết, Tiết 1: 14:00 - 14:45), mọi thay đổi khi nạp file Excel hoặc chỉnh sửa trực tiếp sẽ được lưu lại tự động trên trình duyệt
        </p>
      </Card>
    </div>
  );
};

export default TimetablePage;
