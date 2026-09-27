import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { playFortuneClickSound } from '../lib/sound';

interface MeiMeiGardenProps {
  onBack: () => void;
}

export function MeiMeiGarden({ onBack }: MeiMeiGardenProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0a0a0a] text-white selection:bg-pink-500/30 selection:text-pink-100 overflow-y-auto custom-scrollbar relative">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full px-4 sm:px-8 py-4 backdrop-blur-xl bg-black/40 border-b border-white/5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            playFortuneClickSound();
            onBack();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Về trang chủ</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-serif italic text-sm text-pink-300">vườn hoa meimei</span>
          <span className="text-pink-400 text-xs">𝜗ৎ</span>
        </div>

        <div className="w-20 hidden sm:block" />
      </header>

      {/* Main Empty / Placeholder Canvas for future GitHub files */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        {/* Soft background aura */}
        <div className="absolute w-80 h-80 rounded-full bg-pink-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full space-y-6 relative">
          {/* Floral Icon / Visual Element */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-pink-500/15 blur-xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-pink-400/30 shadow-[0_0_25px_rgba(244,114,182,0.2)] flex items-center justify-center bg-black/60">
              <img
                src="https://i.pinimg.com/originals/78/17/b2/7817b2cf90b9144bc972b7950a9aebf3.gif"
                alt="MeiMei Garden"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="font-serif italic text-xl sm:text-2xl text-white tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              người ơi nhớ đến chăm hoa
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-sm mx-auto leading-relaxed">
              Trang vườn hoa đang được để trống để chuẩn bị cập nhật file từ GitHub.
            </p>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-400/25 text-pink-300 text-xs font-mono">
            <Sparkles className="w-3 h-3 text-pink-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>/meimeigarden</span>
          </div>

          {/* Placeholder Slot for GitHub Garden files */}
          <div id="meimei-garden-root" className="w-full min-h-[60px]">
            {/* Future GitHub Garden component or canvas mounts here */}
          </div>
        </div>
      </main>
    </div>
  );
}
