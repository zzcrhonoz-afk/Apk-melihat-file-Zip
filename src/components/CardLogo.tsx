import React from 'react';
import { motion } from 'motion/react';

interface CardLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CardLogo({ className = '', size = 'md' }: CardLogoProps) {
  const dimensions = {
    sm: { h: 'h-8', w: 'w-8', text: 'text-sm' },
    md: { h: 'h-12', w: 'w-12', text: 'text-xl' },
    lg: { h: 'h-20', w: 'w-20', text: 'text-3xl' },
  }[size];

  return (
    <div className={`relative flex items-center gap-3 ${className}`}>
      {/* Visual overlapping cards resembling files zipped inside */}
      <div className={`relative ${dimensions.w} ${dimensions.h}`}>
        {/* Card 1: Background Left Card */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md border border-white/20"
          style={{ originX: 0, originY: 1 }}
          animate={{ rotate: -15, x: -6, y: 2 }}
          transition={{ type: "spring", stiffness: 100, damping: 12 }}
        >
          {/* Subtle line pattern on card */}
          <div className="w-1/2 h-1 bg-white/30 rounded m-2" />
          <div className="w-2/3 h-1 bg-white/20 rounded mx-2 my-1" />
        </motion.div>

        {/* Card 2: Background Right Card */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg shadow-md border border-white/20"
          style={{ originX: 1, originY: 1 }}
          animate={{ rotate: 12, x: 6, y: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 12 }}
        >
          {/* Subtle line pattern on card */}
          <div className="w-1/3 h-1 bg-white/30 rounded m-2 ml-auto" />
          <div className="w-1/2 h-1 bg-white/20 rounded mx-2 my-1 ml-auto" />
        </motion.div>

        {/* Card 3: Main Front Card */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-amber-400 to-rose-500 rounded-lg shadow-lg border border-white/30 flex flex-col justify-between p-1.5 z-10"
          whileHover={{ scale: 1.08, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          {/* Zipper style or Folder notch representation */}
          <div className="flex justify-between items-center w-full">
            <div className="w-3 h-1.5 bg-white/60 rounded-sm" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
          </div>

          {/* Central ZIP Lettering inside Card */}
          <div className="flex flex-col items-center justify-center my-auto">
            <span className="text-[10px] font-black tracking-wider text-white drop-shadow-sm font-mono">ZIP</span>
            {/* Zipper mechanism teeth pattern in SVG */}
            <svg
              className="w-4 h-6 text-white/80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M12 2v20M9 5h6M9 9h6M9 13h6M9 17h6" strokeLinecap="round" />
            </svg>
          </div>

          <div className="w-full h-1 bg-white/40 rounded" />
        </motion.div>
      </div>

      {/* App branding */}
      <div className="flex flex-col">
        <h1 className={`${dimensions.text} font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-amber-600 to-rose-600 dark:from-white dark:via-amber-400 dark:to-rose-400`}>
          Zip Card Explorer
        </h1>
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest leading-none">
          Arsip & Kartu Berkas
        </span>
      </div>
    </div>
  );
}
