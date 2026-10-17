import React from 'react';

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.03] bg-transparent backdrop-blur-none text-slate-400 py-6 px-6 text-xs relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Bên trái: Thông tin lớp */}
        <div className="flex items-center gap-3 justify-center md:justify-start">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/30 shadow-sm shrink-0 bg-slate-900/40 backdrop-blur-xs">
            <img src="/logo-11a10.jpg" alt="Logo 11A10" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-bold">Tập thể Lớp 11A10 • THPT Cát Tiên</span>
              <span className="text-[10px] text-amber-300 font-mono font-semibold">
                Gắn kết &amp; Vươn xa
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Năm học 2026 - 2027 • Tự hào 11A10
            </p>
          </div>
        </div>

        {/* Ở giữa: Liên kết TikTok chính thức của lớp */}
        <div className="flex items-center justify-center">
          <a
            href="https://www.tiktok.com/@11a10bomaylanhat"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-pink-500/40 text-slate-300 hover:text-white transition-all shadow-sm hover:shadow-[0_0_16px_rgba(255,0,80,0.2)] active:scale-95"
            title="Kênh TikTok chính thức Lớp 11A10 (@11a10bomaylanhat)"
          >
            <span className="w-5 h-5 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-pink-400 transition-colors shrink-0">
              <TikTokIcon className="w-3 h-3" />
            </span>
            <span className="text-xs font-mono font-medium tracking-tight text-slate-200 group-hover:text-white transition-colors">
              @11a10bomaylanhat
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-400/30 font-mono transition-colors">
              TikTok ↗
            </span>
          </a>
        </div>

        {/* Bên phải: Tác giả phát triển */}
        <div className="flex items-center justify-center md:justify-end gap-2">
          <span className="text-[11px] text-slate-400">
            Thiết kế &amp; Phát triển bởi{' '}
            <strong className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 font-bold">
              Haibdos X Tajbun_Hwg
            </strong>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
