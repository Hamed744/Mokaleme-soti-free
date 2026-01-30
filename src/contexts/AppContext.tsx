// src/contexts/AppContext.tsx (نسخه نهایی با قابلیت انتخاب گوینده)
import React, { createContext, FC, ReactNode, useContext, useEffect, useState, useCallback } from "react";
import { useLiveAPI, type UseLiveAPIResults } from "../hooks/use-live-api";
import { LiveConfig } from "../multimodal-live-types";
import { speakers } from '../data/speakers'; // <-- ایمپورت داده‌های گویندگان

const LS_SELECTED_PERSONALITY = 'app_selected_personality';
const LS_SELECTED_VOICE = 'app_selected_voice'; // <-- کلید جدید برای ذخیره گوینده
const LS_CUSTOM_NAME = 'app_custom_name';
const LS_CUSTOM_INSTRUCTIONS = 'app_custom_instructions';

export type PersonalityType = "default" | "teacher" | "poetic" | "funny" | "custom";
export type PersonalityInstructions = Partial<Record<PersonalityType, string>>;

interface AppContextType extends UseLiveAPIResults {
  selectedPersonality: PersonalityType;
  selectedVoice: string;
  changePersonality: (personality: PersonalityType, customDetails?: { name: string, instructions: string }) => void;
  changeVoice: (voiceId: string) => void;
  personalityInstructions: PersonalityInstructions;
  customUserName: string;
  customInstructions: string;
  isRestarting: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const BASE_INSTRUCTION = `تو یک دستیار صوتی و تصویری پیشرفته هستی. همیشه به زبان فارسی روان، دقیق و طبیعی صحبت کن. هرگز خودت را به عنوان محصول شرکت دیگری معرفی نکن تو توسط هوش مصنوعی آلفا ساخته شدی به هیچ عنوان نباید خودت را به عنوان محصول گوگل یا مایکروسافت یا شرکت دیگری معرفی کنی. در پاسخ‌های خود از ایموجی یا شکلک استفاده نکن.`;

export const AppProvider: FC<{ children: ReactNode; initialConfig?: LiveConfig; personalityInstructions: PersonalityInstructions; url?: string; }> = ({
  children, initialConfig, personalityInstructions, url
}) => {
  const liveAPI = useLiveAPI({ url });

  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityType>(() => (localStorage.getItem(LS_SELECTED_PERSONALITY) as PersonalityType) || 'default');
  const [selectedVoice, setSelectedVoice] = useState<string>(() => localStorage.getItem(LS_SELECTED_VOICE) || speakers[0].id); // <-- State برای گوینده
  const [customUserName, setCustomUserName] = useState<string>(() => localStorage.getItem(LS_CUSTOM_NAME) || '');
  const [customInstructions, setCustomInstructions] = useState<string>(() => localStorage.getItem(LS_CUSTOM_INSTRUCTIONS) || '');
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    let instructionParts = [BASE_INSTRUCTION];
    if (customUserName) {
        instructionParts.push(`نام کاربر ${customUserName} است. او را با نامش صدا بزن.`);
    }
    if (selectedPersonality === 'custom') {
        if (customInstructions) instructionParts.push(customInstructions);
    } else {
        const personalityPrompt = personalityInstructions[selectedPersonality];
        if (personalityPrompt) instructionParts.push(personalityPrompt);
    }
    const finalInstruction = instructionParts.join('\n\n');

    const newConfig: LiveConfig = {
      // ✅ تغییر ۱: استفاده از مدل جدید
      model: "models/gemini-2.5-flash-native-audio-preview-09-2025",
      tools: [{ googleSearch: {} }],
      // ✅ تغییر ۲: اضافه کردن تنظیمات صدا و گوینده
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: selectedVoice,
            },
          },
        },
      },
      systemInstruction: { parts: [{ text: finalInstruction.trim() }] },
    };
    liveAPI.setConfig(newConfig);

  }, [selectedPersonality, selectedVoice, customUserName, customInstructions, personalityInstructions, liveAPI.setConfig, initialConfig]);

  useEffect(() => {
    if (isRestarting && !liveAPI.connected) {
      const timer = setTimeout(() => liveAPI.connect().then(() => setIsRestarting(false)), 200);
      return () => clearTimeout(timer);
    }
  }, [isRestarting, liveAPI.connected, liveAPI.connect]);

  const changePersonality = useCallback((newPersonality: PersonalityType, customDetails?: { name: string; instructions: string }) => {
    if (newPersonality === 'custom' && customDetails) {
      localStorage.setItem(LS_CUSTOM_NAME, customDetails.name);
      localStorage.setItem(LS_CUSTOM_INSTRUCTIONS, customDetails.instructions);
      setCustomUserName(customDetails.name);
      setCustomInstructions(customDetails.instructions);
    }
    localStorage.setItem(LS_SELECTED_PERSONALITY, newPersonality);
    setSelectedPersonality(newPersonality);
    if (liveAPI.connected) {
      setIsRestarting(true);
      liveAPI.disconnect();
    }
  }, [liveAPI.connected, liveAPI.disconnect]);

  // ✅ تغییر ۳: تابع جدید برای تغییر گوینده
  const changeVoice = useCallback((voiceId: string) => {
    localStorage.setItem(LS_SELECTED_VOICE, voiceId);
    setSelectedVoice(voiceId);
    if (liveAPI.connected) {
      setIsRestarting(true);
      liveAPI.disconnect();
    }
  }, [liveAPI.connected, liveAPI.disconnect]);

  const contextValue: AppContextType = {
    ...liveAPI,
    selectedPersonality,
    selectedVoice,
    changePersonality,
    changeVoice,
    personalityInstructions,
    customUserName,
    customInstructions,
    isRestarting,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};