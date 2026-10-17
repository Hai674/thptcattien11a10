"use client";

import * as React from "react";
import { Paperclip, Sparkles, Send } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora";

export interface HeroBackgroundBeamsProps {
  className?: string;
  beamGradient?: string;
}

/**
 * Reusable slanted gradient beam background
 * Can be used independently across any page or layout to change the background
 */
export const HeroBackgroundBeams: React.FC<HeroBackgroundBeamsProps> = ({
  className = "",
  beamGradient = "bg-gradient-to-r from-white to-blue-300",
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {/* Beam cluster 1 */}
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-40rem] right-[-30rem] z-[0] blur-[4rem] skew-[-40deg] opacity-50">
        <div className={`w-[10rem] h-[20rem] ${beamGradient}`}></div>
        <div className={`w-[10rem] h-[20rem] ${beamGradient}`}></div>
        <div className={`w-[10rem] h-[20rem] ${beamGradient}`}></div>
      </div>

      {/* Beam cluster 2 */}
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-50rem] right-[-50rem] z-[0] blur-[4rem] skew-[-40deg] opacity-50">
        <div className={`w-[10rem] h-[20rem] ${beamGradient}`}></div>
        <div className={`w-[10rem] h-[20rem] ${beamGradient}`}></div>
        <div className={`w-[10rem] h-[20rem] ${beamGradient}`}></div>
      </div>

      {/* Beam cluster 3 */}
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-60rem] right-[-60rem] z-[0] blur-[4rem] skew-[-40deg] opacity-50">
        <div className={`w-[10rem] h-[30rem] ${beamGradient}`}></div>
        <div className={`w-[10rem] h-[30rem] ${beamGradient}`}></div>
        <div className={`w-[10rem] h-[30rem] ${beamGradient}`}></div>
      </div>
    </div>
  );
};

export interface Hero1Props {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  brandName?: string;
  brandLogoUrl?: string;
  searchPlaceholder?: string;
  suggestions?: string[];
  ctaButtonText?: string;
  onCtaClick?: () => void;
  onSearch?: (query: string) => void;
  className?: string;
  backgroundColor?: string;
  cardColor?: string;
  beamGradient?: string;
}

const DEFAULT_SUGGESTIONS = [
  "Launch a blog with Astro",
  "Develop an app using NativeScript",
  "Build documentation with Vitepress",
  "Generate UI with shadcn",
  "Generate UI with HextaUI",
];

const Hero1: React.FC<Hero1Props> = ({
  title = "Build Stunning websites effortlessly",
  subtitle = "HextaAI can create amazing websites with few lines of prompt.",
  badgeText = "Introducing Magic Components",
  brandName = "HextaAI",
  brandLogoUrl = "https://cdn.21st.dev/assets/localized/92db5b0ae3b97eefb3308b3ad28645caaaf0a5125369b81c7cb8a8df1a610043.svg",
  searchPlaceholder = "How HextaAI can help you today?",
  suggestions = DEFAULT_SUGGESTIONS,
  ctaButtonText = "Get Started",
  onCtaClick,
  onSearch,
  className = "",
  backgroundColor = "bg-[#0c0414]",
  cardColor = "bg-[#1c1528]",
  beamGradient = "bg-gradient-to-r from-white to-blue-300",
}) => {
  const [query, setQuery] = React.useState("");
  const [imgError, setImgError] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSuggestionClick = (item: string) => {
    setQuery(item);
  };

  return (
    <div
      className={`min-h-screen ${backgroundColor} text-white flex flex-col relative overflow-x-hidden ${className}`}
    >
      {/* Aurora Background from @kevingirelli (21st.dev) */}
      <AuroraBackground />

      {/* Header */}
      <header className="flex justify-between items-center p-6 relative z-10">
        <div className="flex items-center gap-2">
          {!imgError ? (
            <img
              src={brandLogoUrl}
              alt={`${brandName} Logo`}
              width={30}
              height={30}
              onError={() => setImgError(true)}
              className="w-[30px] h-[30px] object-contain"
            />
          ) : (
            <div className="w-[30px] h-[30px] rounded-lg bg-indigo-600/30 flex items-center justify-center border border-indigo-400/40 text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
          <div className="font-bold text-md tracking-tight">{brandName}</div>
        </div>
        <button
          type="button"
          onClick={onCtaClick}
          className="bg-white text-black hover:bg-gray-200 transition-colors rounded-full px-4 py-2 text-sm cursor-pointer font-semibold shadow-sm"
        >
          {ctaButtonText}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Introducing badge */}
          <div className="flex justify-center">
            <div
              className={`${cardColor} rounded-full px-4 py-2 flex items-center gap-2 w-fit mx-4 border border-white/5 shadow-inner`}
            >
              <span className="text-xs flex items-center gap-2 text-slate-200 font-medium">
                <span className="bg-black/80 p-1 rounded-full text-xs">🥳</span>
                {badgeText}
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white max-w-3xl mx-auto">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-normal">
            {subtitle}
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSubmit}
            className="relative max-w-2xl mx-auto w-full pt-2"
          >
            <div
              className={`${cardColor} rounded-full p-2.5 sm:p-3 flex items-center border border-white/10 shadow-2xl focus-within:border-purple-500/50 transition-all`}
            >
              <button
                type="button"
                title="Attach file"
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                type="button"
                title="AI Magic"
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-purple-400 hover:text-purple-300"
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="bg-transparent flex-1 outline-none text-gray-200 placeholder:text-gray-500 pl-3 sm:pl-4 text-sm sm:text-base"
              />
              {query.trim() && (
                <button
                  type="submit"
                  title="Submit"
                  className="p-2 rounded-full bg-purple-600 hover:bg-purple-500 transition-colors text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Suggestion pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-6 max-w-2xl mx-auto">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(item)}
                className={`${cardColor} hover:bg-[#2a1f3d] border border-white/5 hover:border-purple-500/30 transition-all rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-300 hover:text-white cursor-pointer`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export { Hero1 };
export default Hero1;
