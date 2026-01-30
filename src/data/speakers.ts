// src/data/speakers.ts

export interface Speaker {
  id: string;
  name: string;
  desc: string;
  imgUrl: string;
}

export const speakers: Speaker[] = [
    { id: "Charon", name: "شهاب (مرد)", desc: "صدایی قدرتمند و رسا", imgUrl: "https://uploadkon.ir/uploads/a18705_25IMG-۲۰۲۵۰۷۰۵-۱۱۰۵۴۹.jpg" },
    { id: "Zephyr", name: "آوا (زن)", desc: "لطیف و دلنشین", imgUrl: "https://uploadkon.ir/uploads/029605_25IMG-۲۰۲۵۰۷۰۵-۱۱۱۲۵۲.jpg" },
    { id: "Achird", name: "نوید (مرد)", desc: "جوان و پرانرژی", imgUrl: "https://uploadkon.ir/uploads/697e05_25IMG-۲۰۲۵۰۶۰۹-۰۶۴۶۳۷.jpg" },
    { id: "Zubenelgenubi", name: "آرمان (مرد)", desc: "گرم و صمیمی", imgUrl: "https://uploadkon.ir/uploads/a8a705_25IMG-۲۰۲۵۰۷۰۵-۱۱۱۶۲۹.jpg" },
    { id: "Vindemiatrix", name: "مهسا (زن)", desc: "باوقار و رسمی", imgUrl: "https://uploadkon.ir/uploads/d74d05_25IMG-۲۰۲۵۰۷۰۵-۱۱۱۸۳۸.jpg" },
    { id: "Sadachbia", name: "سامان (مرد)", desc: "شاداب و پویا", imgUrl: "https://uploadkon.ir/uploads/580205_25IMG-۲۰۲۵۰۷۰۵-۱۱۳۳۳۰.jpg" },
    { id: "Sadaltager", name: "آرش (مرد)", desc: "مطمئن و تاثیرگذار", imgUrl: "https://uploadkon.ir/uploads/c4db05_25IMG-۲۰۲۵۰۷۰۵-۱۱۳۵۰۰.jpg" },
    { id: "Sulafat", name: "شبنم (زن)", desc: "آرام و متین", imgUrl: "https://uploadkon.ir/uploads/995005_25IMG-۲۰۲۵۰۷۰۵-۱۱۳۶۱۱.jpg" },
    { id: "Laomedeia", name: "سحر (زن)", desc: "دوستانه و گیرا", imgUrl: "https://uploadkon.ir/uploads/660705_25IMG-۲۰۲۵۰۷۰۵-۱۱۳۷۵۴.jpg" },
    { id: "Achernar", name: "مریم (زن)", desc: "حرفه‌ای و واضح", imgUrl: "https://uploadkon.ir/uploads/4c2905_25IMG-۲۰۲۵۰۷۰۵-۱۱۴۰۳۶.jpg" },
    { id: "Alnilam", name: "بهرام (مرد)", desc: "حماسی و نافذ", imgUrl: "https://uploadkon.ir/uploads/f0c205_25IMG-۲۰۲۵۰۷۰۵-۱۱۴۲۲۰.jpg" },
    { id: "Schedar", name: "نیکان (مرد)", desc: "مهربان و شیرین", imgUrl: "https://uploadkon.ir/uploads/d37a05_25IMG-۲۰۲۵۰۷۰۵-۱۱۴۳۲۵.jpg" },
    { id: "Gacrux", name: "فرناز (زن)", desc: "پخته و قابل اعتماد", imgUrl: "https://uploadkon.ir/uploads/cff705_25IMG-%DB%B2%DB%B0%DB%B2%DB%B5%DB%B0%DB%B7%DB%B0%DB%B5-%DB%B1%DB%B1%DB%B4%DB%B6%DB%B0%DB%B5.jpg" },
    { id: "Pulcherrima", name: "سارا (زن)", desc: "جذاب و مدرن", imgUrl: "https://uploadkon.ir/uploads/acb105_25IMG-۲۰۲۵۰۷۰۵-۱۱۴۷۴۳.jpg" },
    { id: "Umbriel", name: "مانی (مرد)", desc: "خلاق و متفاوت", imgUrl: "https://uploadkon.ir/uploads/68b505_25IMG-۲۰۲۵۰۷۰۵-۱۱۴۹۱۴.jpg" },
    { id: "Algieba", name: "آرتین (مرد)", desc: "با اصالت و شیک", imgUrl: "https://uploadkon.ir/uploads/571005_25IMG-۲۰۲۵۰۷۰۵-۱۱۵۰۳۹.jpg" },
    { id: "Despina", name: "دلنواز (زن)", desc: "هنری و احساسی", imgUrl: "https://uploadkon.ir/uploads/5d7805_25IMG-۲۰۲۵۰۷۰۵-۱۱۵۲۲۲.jpg" },
    { id: "Erinome", name: "روژان (زن)", desc: "شفاف و گویا", imgUrl: "https://uploadkon.ir/uploads/aa8805_25IMG-۲۰۲۵۰۷۰۵-۱۱۵۳۴۹.jpg" },
    { id: "Algenib", name: "امید (مرد)", desc: "انگیزه بخش و مثبت", imgUrl: "https://uploadkon.ir/uploads/a63c05_25IMG-۲۰۲۵۰۷۰۵-۱۱۵۹۲۱.jpg" },
    // --> مدل جا افتاده در اینجا اضافه شد
    { id: "Rasalgethi", name: "دانا (مرد)", desc: "خبری و آموزنده", imgUrl: "https://uploadkon.ir/uploads/57e425_25IMG-20250925-112825-749.jpg" },
    { id: "Orus", name: "بردیا (مرد)", desc: "ورزشی و پرهیجان", imgUrl: "https://uploadkon.ir/uploads/8bc405_25IMG-۲۰۲۵۰۷۰۵-۱۲۱۴۳۳.jpg" },
    { id: "Aoede", name: "ترانه (زن)", desc: "موزیکال و خوش‌آهنگ", imgUrl: "https://uploadkon.ir/uploads/9cb405_25IMG-۲۰۲۵۰۷۰۵-۱۲۱۸۵۰.jpg" },
    { id: "Callirrhoe", name: "نیکو (زن)", desc: "روایتگر و قصه‌گو", imgUrl: "https://uploadkon.ir/uploads/ee5f05_25IMG-۲۰۲۵۰۷۰۵-۱۲۲۰۴۷.jpg" },
    { id: "Autonoe", name: "هستی (زن)", desc: "طبیعی و خودمانی", imgUrl: "https://uploadkon.ir/uploads/9b0505_25IMG-۲۰۲۵۰۷۰۵-۱۲۲۲۲۲.jpg" },
    { id: "Enceladus", name: "کامیار (مرد)", desc: "مصمم و جدی", imgUrl: "https://uploadkon.ir/uploads/127805_25IMG-۲۰۲۵۰۷۰۵-۱۲۲۴۱۴.jpg" },
    { id: "Iapetus", name: "کیانوش (مرد)", desc: "درخشان و گیرا", imgUrl: "https://uploadkon.ir/uploads/c98b05_25IMG-۲۰۲۵۰۷۰۵-۱۲۲۶۰۵.jpg" },
    { id: "Puck", name: "پویا (مرد)", desc: "بازیگوش و سرزنده", imgUrl: "https://uploadkon.ir/uploads/ca3605_25IMG-۲۰۲۵۰۷۰۵-۱۲۲۸۳۹.jpg" },
    { id: "Kore", name: "مهتاب (زن)", desc: "نجواگر و آرامش‌بخش", imgUrl: "https://uploadkon.ir/uploads/b66605_25IMG-۲۰۲۵۰۷۰۵-۱۲۳۰۳۵.jpg" },
    { id: "Fenrir", name: "سام (مرد)", desc: "جسور و بی‌باک", imgUrl: "https://uploadkon.ir/uploads/03c005_25IMG-۲۰۲۵۰۷۰۵-۱۲۳۴۱۳.jpg" },
    { id: "Leda", name: "لیدا (زن)", desc: "کلاسیک و باوقار", imgUrl: "https://uploadkon.ir/uploads/710305_25IMG-۲۰۲۵۰۷۰۵-۱۲۳۷۳۱.jpg" }
];