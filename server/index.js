// server/index.js (نسخه بهینه شده: انتخاب تصادفی کلیدها + پایداری بالا)
const express = require('express');
const path = require('node:path');
const { WebSocketServer, WebSocket } = require('ws');
const http = require('node:http');
require('dotenv').config();

const app = express();

// افزایش محدودیت‌ها برای جلوگیری از خطای هدر در درخواست‌های سنگین
const server = http.createServer({
    maxHeaderSize: 16384 // 16KB
}, app);

const wss = new WebSocketServer({ 
    server,
    clientTracking: true, // برای مدیریت هارت‌بیت و بستن اتصالات مرده
    perMessageDeflate: false // غیرفعال کردن فشرده‌سازی برای کاهش بار CPU و حافظه
});

// --- بخش مدیریت تنظیمات شخصیت‌ها ---
const instructionSecretNames = {
  default: 'PERSONALITY_DEFAULT',
  teacher: 'PERSONALITY_TEACHER',
  poetic: 'PERSONALITY_POETIC',
  funny: 'PERSONALITY_FUNNY',
};

const personalityInstructions = {};
console.log('🔄 در حال خواندن دستورالعمل‌های شخصیت از Secrets...');
Object.keys(instructionSecretNames).forEach(key => {
  const secretName = instructionSecretNames[key];
  const instruction = process.env[secretName];
  if (instruction) {
    personalityInstructions[key] = instruction;
  } else {
    personalityInstructions[key] = `دستورالعمل '${key}' یافت نشد.`;
  }
});

// --- بخش مدیریت کلیدهای API (Random Selection) ---
const apiKeysEnv = process.env.ALL_GEMINI_API_KEYS;
// تبدیل رشته کلیدها به آرایه و حذف فاصله‌های اضافی
const apiKeys = apiKeysEnv ? apiKeysEnv.split(',').map(key => key.trim()).filter(key => key) : [];

if (apiKeys.length === 0) {
  console.error('🔴 خطای حیاتی: هیچ کلید API یافت نشد! لطفا متغیر ALL_GEMINI_API_KEYS را تنظیم کنید.');
  process.exit(1);
}
console.log(`🚀 سرور با ${apiKeys.length} کلید API آماده‌سازی شد. (حالت انتخاب تصادفی)`);

// --- مکانیزم Heartbeat برای جلوگیری از قطعی و هنگ کردن سرور ---
// این تابع هر ۳۰ ثانیه اتصالات مرده را پاک می‌کند تا حافظه آزاد شود
function heartbeat() {
  this.isAlive = true;
}

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
        // اگر کلاینت پاسخ نداد، اتصال را قطع کن تا حافظه آزاد شود
        return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', function close() {
  clearInterval(interval);
});

// --- توابع اتصال به گوگل ---

/**
 * اتصال سوکت کلاینت و سوکت جمینای را به هم متصل می‌کند
 */
function attachGeminiEventHandlers(clientWs, geminiWs, apiKeyUsed) {
  // انتقال پیام از گوگل به کلاینت
  geminiWs.on('message', (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data, { binary: true });
    }
  });

  geminiWs.on('error', (error) => {
    console.error(`🔴 خطای جمینای (کلید ...${apiKeyUsed.slice(-4)}):`, error.message);
    // در صورت خطا، سوکت کلاینت را نمی‌بندیم تا شاید بتواند دوباره تلاش کند، 
    // اما معمولا کلاینت خودش قطع می‌شود.
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
  });

  geminiWs.on('close', (code) => {
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
  });
  
  geminiWs.on('ping', () => {
      try { geminiWs.pong(); } catch (e) {}
  });
}

/**
 * تلاش برای اتصال به جمینای با انتخاب تصادفی و امتحان مجدد
 * @param {WebSocket} clientWs سوکت کاربر
 * @param {Object} setupData داده‌های اولیه (کانفیگ)
 * @param {Number} startIndex ایندکس شروع (که به صورت تصادفی انتخاب شده)
 * @param {Number} attemptCount شمارنده تلاش‌ها
 */
async function tryConnectToGemini(clientWs, setupData, startIndex, attemptCount = 0) {
  // اگر کلاینت در حین تلاش قطع شد، ادامه نده (جلوگیری از لیک حافظه)
  if (clientWs.readyState !== WebSocket.OPEN) return null;

  // اگر تمام کلیدها تست شدند و هیچکدام کار نکرد
  if (attemptCount >= apiKeys.length) {
    console.error(`⛔ تمام ${apiKeys.length} کلید API با شکست مواجه شدند.`);
    if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: "سرویس موقتاً در دسترس نیست (ظرفیت تکمیل)." }));
        clientWs.close();
    }
    return null;
  }

  // منطق انتخاب کلید:
  // بار اول: ایندکس کاملا تصادفی (startIndex)
  // دفعات بعد (در صورت خطا): کلید بعدی در لیست به صورت چرخشی
  const keyIndexToTry = (startIndex + attemptCount) % apiKeys.length;
  const apiKey = apiKeys[keyIndexToTry];
  
  const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

  return new Promise((resolve) => {
    const geminiWs = new WebSocket(url);
    
    // تایم‌اوت سخت: اگر گوگل تا ۸ ثانیه هیچ پاسخی نداد (هنگ کرد)، برو کلید بعدی
    const timeout = setTimeout(() => {
      console.warn(`⏳ تایم‌اوت اتصال (کلید ...${apiKey.slice(-4)}). رفتن به کلید بعدی...`);
      geminiWs.terminate(); 
      resolve(tryConnectToGemini(clientWs, setupData, startIndex, attemptCount + 1));
    }, 8000);

    geminiWs.on('open', () => {
      clearTimeout(timeout);
      
      if (clientWs.readyState !== WebSocket.OPEN) {
          geminiWs.close();
          return resolve(null);
      }
      
      console.log(`🔗 اتصال موفق با کلید شماره ${keyIndexToTry} (تلاش ${attemptCount + 1})`);
      
      try {
        geminiWs.send(JSON.stringify(setupData));
        attachGeminiEventHandlers(clientWs, geminiWs, apiKey);
        resolve(geminiWs);
      } catch (e) {
        console.error("خطا در ارسال تنظیمات اولیه:", e);
        geminiWs.close();
        resolve(tryConnectToGemini(clientWs, setupData, startIndex, attemptCount + 1));
      }
    });

    geminiWs.on('error', (err) => {
      clearTimeout(timeout);
      console.warn(`⚠️ خطای اتصال (کلید ...${apiKey.slice(-4)}): ${err.message || 'Unknown'}. تلاش با کلید بعدی...`);
      // فراخوانی بازگشتی برای تست کلید بعدی
      resolve(tryConnectToGemini(clientWs, setupData, startIndex, attemptCount + 1));
    });
  });
}

// --- سرو کردن فایل‌های استاتیک ---
app.use(express.static(path.join(__dirname, '../build')));

// API Endpoint دستورالعمل‌ها
app.get('/api/instructions', (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); 
    res.json(personalityInstructions);
});

// --- مدیریت WebSocket کلاینت ---
wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  // *تغییر اصلی:* انتخاب یک نقطه شروع کاملاً تصادفی برای هر کاربر
  // این کار باعث می‌شود بار روی سرور پخش شود و نیاز به حافظه برای نگهداری نوبت نباشد.
  const randomStartIndex = Math.floor(Math.random() * apiKeys.length);
  
  let geminiWs = null;
  let isConnecting = false;

  ws.on('message', async (message) => {
    try {
      if (!Buffer.isBuffer(message) || message[0] === 123) { 
        const msgStr = message.toString();
        if (msgStr.startsWith('{')) {
            const data = JSON.parse(msgStr);
            if (data.setup) {
                if (isConnecting || geminiWs) return; 
                isConnecting = true;
                // ارسال ایندکس تصادفی به تابع اتصال
                geminiWs = await tryConnectToGemini(ws, data, randomStartIndex);
                isConnecting = false;
                return;
            }
        }
      }
      
      if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.send(message);
      }
    } catch (e) {
      console.error("خطا در پردازش پیام کلاینت:", e.message);
    }
  });

  ws.on('close', () => {
    if (geminiWs) {
        // بستن اجباری اتصال گوگل برای آزادسازی منابع
        try {
            geminiWs.terminate(); 
        } catch(e) {}
        geminiWs = null;
    }
  });

  ws.on('error', (error) => {
    if (geminiWs) {
        try { geminiWs.terminate(); } catch(e) {}
        geminiWs = null;
    }
  });
});

// ارسال تمام درخواست‌های دیگر به React
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../build', 'index.html')));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 سرور (حالت تصادفی) روی پورت ${PORT} اجرا شد.`));