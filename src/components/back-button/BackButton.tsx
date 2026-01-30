// src/components/back-button/BackButton.tsx
"use client"; // این دستور برای Next.js App Router است، در Create React App کاربردی ندارد و می‌توانید حذفش کنید.

import React from 'react';
import { ChevronLeft } from "lucide-react";

// استایل‌ها مشابه دکمه‌های هدر دیگر خواهد بود که از App.scss می‌آید
// یا می‌توانید کلاس‌های Tailwind را مستقیماً اینجا اعمال کنید
// در اینجا از کلاس header-button که در App.scss تعریف شده استفاده می‌کنیم
// و در صورت نیاز padding یا سایز را برای تطابق با نمونه تنظیم می‌کنیم.

export default function BackButton() {
  const handleClose = () => {
    // بستن پنجره فعلی
    // توجه: این ممکن است در تمام مرورگرها یا سناریوها کار نکند.
    console.log("Attempting to close window...");
    window.close();

    // اگر در یک iframe هستید (مانند برخی از اسپیس‌های هاگینگ فیس)
    // و می‌خواهید به صفحه قبلی در هیستوری هاگینگ فیس برگردید، ممکن است نیاز به راه حل دیگری باشد.
    // برای مثال، اگر می‌خواهید به صفحه اصلی اسپیس برگردید:
    // window.location.href = "/"; // یا آدرس روت اسپیس شما

    // اگر منظور از "برگشت" در یک اپلیکیشن تک‌صفحه‌ای (SPA) است،
    // باید از router خود (مثل React Router) استفاده کنید:
    // import { useNavigate } from 'react-router-dom';
    // const navigate = useNavigate();
    // navigate(-1); // برای بازگشت به صفحه قبلی در هیستوری react-router
  };

  return (
    <button // تغییر از div به button برای دسترسی‌پذیری و معنای بهتر
      onClick={handleClose}
      aria-label="Close window"
      // استفاده از کلاس header-button برای ظاهر مشابه با دکمه نوتیفیکیشن
      // مقادیر padding و اندازه آیکون از آن کلاس می‌آیند.
      // کلاس‌های نمونه کد شما: "flex items-center justify-center p-2 rounded-lg bg-gray-200"
      // کلاس header-button ما: "flex items-center justify-center p-2 rounded-[0.625rem] bg-gray-200"
      // که بسیار شبیه هستند. --radius-lg معادل 0.625rem (10px) است.
      // و p-2 معادل padding: 0.5rem (8px) است.
      className={"header-button"} // این کلاس باید در App.scss تعریف شده باشد و ظاهر مورد نظر را بدهد
    >
      {/* اندازه آیکون در نمونه شما 20 است، در header-button ما SVGها 24 هستند */}
      {/* برای تطابق دقیق، یا اندازه SVG را در header-button تغییر دهید یا اینجا override کنید */}
      <ChevronLeft size={20} strokeWidth={2.5} className={"opacity-70 dark:opacity-80"} /> {/* strokeWidth و opacity تنظیم شده برای وضوح بیشتر */}
    </button>
  );
}