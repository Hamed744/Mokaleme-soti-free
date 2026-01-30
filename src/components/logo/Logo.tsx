// src/components/logo/Logo.tsx

import React from 'react';
import cn from "classnames";
import { humanAiIcon } from '../icons';

type LogoProps = {
  isMini: boolean;
  isAi: boolean;
  isActive: boolean;
  speakingVolume?: number;
  isUserSpeaking?: boolean;
}

export default function Logo({ isAi, isActive, isMini, speakingVolume = 0, isUserSpeaking = false }: LogoProps) {
  if (!isActive) return null;

  const aiVoiceScale = 1 + (speakingVolume * 1.5);
  const isAiSpeaking = speakingVolume > 0.02;

  const animatedCircleStyle: React.CSSProperties = {
    transition: 'transform 0.15s ease-out',
    transform: `scale(${aiVoiceScale})`
  };

  return (
    <div className={cn("w-fit flex items-center justify-center")}>
      <div className={"hidden bg-green-200 bg-green-300 bg-green-400 bg-blue-200 bg-blue-300 bg-blue-400 dark:bg-green-700 dark:bg-green-600 dark:bg-green-500 dark:bg-blue-700 dark:bg-blue-600 dark:bg-blue-500"}>
        color pre-loader
      </div>
      
      <div className={cn("relative", isMini ? "w-[80px] h-[80px]" : "w-[200px] h-[200px]")}>
        <div className={cn("absolute rounded-full opacity-50 animate-ping", isAi ? "bg-green-200" : "bg-blue-200", isMini ? "inset-[10px]" : "inset-[40px]")} />
        
        <div className={cn("absolute rounded-full opacity-50", isAi ? "bg-green-200" : "bg-blue-200", isMini ? "inset-[10px]" : "inset-[40px]")} style={animatedCircleStyle} />
        
        <div className={cn("absolute inset-0 rounded-full opacity-50", isAi ? "bg-green-200" : "bg-blue-200")} />
        <div className={cn("absolute rounded-full opacity-50", isAi ? "bg-green-300" : "bg-blue-300", isMini ? "inset-[5px]" : "inset-[20px]")} />
        <div className={cn("absolute rounded-full opacity-50", isAi ? "bg-green-400" : "bg-blue-400", isMini ? "inset-[12px]" : "inset-[50px]")} />
        
        <div className={cn("z-10 absolute flex items-center justify-center inset-0")}>
          {/* --- 👇 منطق صحیح و نهایی 👇 --- */}
          {humanAiIcon({ 
            size: isMini ? 24 : 45,
            isUserSpeaking: isUserSpeaking,  // <-- کاربر صحبت می‌کند -> آدمک تکان می‌خورد
            isAiSpeaking: isAiSpeaking,     // <-- ربات صحبت می‌کند -> ربات تکان می‌خورد
          })}
        </div>
      </div>
    </div>
  );
}