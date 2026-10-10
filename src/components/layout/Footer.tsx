import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.03] bg-transparent backdrop-blur-none text-slate-400 py-6 px-6 text-xs relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/30 shadow-sm shrink-0 bg-slate-900/40 backdrop-blur-xs">
            <img src="/logo-11a10.jpg" alt="Logo 11A10" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-bold">Tập thể Lớp 11A10 • THPT Cát Tiên</span>
              <span className="text-[10px] text-amber-300 font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Gắn kết &amp; Vươn xa
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Năm học 2026 - 2027 • Tự hào 11A10
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">
            Thiết kế &amp; Phát triển bởi{' '}
            <strong className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 font-bold">
              Haibods X Tajbun_Twg
            </strong>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
