/**
Copyright 2024 Google LLC
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// --- 👇 ایمپورت‌های لازم اضافه شد 👇 ---
import React, { createContext, FC, type ReactNode, useContext, useEffect } from "react"; // React و useEffect اضافه شد
import { useLiveAPI, type UseLiveAPIResults } from "../hooks/use-live-api";
import { LiveConfig } from "../multimodal-live-types"; // LiveConfig ایمپورت شد
// --- 👆 پایان ایمپورت‌های اضافه شده 👆 ---

const LiveAPIContext = createContext<UseLiveAPIResults | undefined>(undefined);

// --- 👇 پراپرتی initialConfig به Props اضافه شد 👇 ---
export type LiveAPIProviderProps = {
  children: ReactNode;
  url?: string;
  initialConfig?: LiveConfig; // این پراپرتی برای دریافت تنظیمات اولیه از App.tsx است
};
// --- 👆 پایان تغییر Props 👆 ---

export const LiveAPIProvider: FC<LiveAPIProviderProps> = ({
  url = process.env.NODE_ENV === 'development'
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:3001/ws`
    : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`,
  initialConfig, // <-- initialConfig از props گرفته شد
  children,
}) => {
  // هوک useLiveAPI مثل قبل فراخوانی می‌شود
  // توجه: فرض شده که apiKey در جای دیگری مدیریت می‌شود یا نیاز نیست
  const liveAPI = useLiveAPI({ url });

  // --- 👇 استفاده از useEffect برای اعمال initialConfig 👇 ---
  // این effect یک بار بعد از اولین رندر (و اگر initialConfig تغییر کند) اجرا می‌شود
  useEffect(() => {
    // فقط اگر initialConfig پاس داده شده باشد و تابع setConfig در دسترس باشد، آن را اعمال می‌کنیم
    if (initialConfig && liveAPI.setConfig) {
      console.log("Applying initial config from Provider:", initialConfig); // برای دیباگ
      liveAPI.setConfig(initialConfig); // تنظیمات اولیه پاس داده شده از App.tsx را اعمال می‌کنیم
    }
    // setConfig معمولاً تغییر نمی‌کند، اما برای کامل بودن در dependency array قرار می‌گیرد
  }, [initialConfig, liveAPI.setConfig]);
  // --- 👆 پایان بخش useEffect 👆 ---

  return (
    <LiveAPIContext.Provider value={liveAPI}>
      {children}
    </LiveAPIContext.Provider>
  );
};

export const useLiveAPIContext = () => {
  // console.log('🎯 LiveAPIContext: Hook being accessed'); // لاگ‌ها رو حذف می‌کنیم یا نگه می‌داریم
  const context = useContext(LiveAPIContext);
  if (!context) {
    throw new Error("useLiveAPIContext must be used within a LiveAPIProvider");
  }
  // console.log('✅ LiveAPIContext successfully retrieved');
  return context;
};