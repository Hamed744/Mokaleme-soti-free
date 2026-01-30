/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // *** NEW: تعریف رنگ‌های سفارشی بر اساس متغیرهای CSS شما ***
      colors: {
        // نام 'background' و 'foreground' را برای سادگی انتخاب می‌کنیم
        // شما می‌توانید نام‌های دیگری انتخاب کنید
        'custom-background': 'var(--background)', // استفاده از متغیر CSS
        'custom-foreground': 'var(--foreground)', // استفاده از متغیر CSS
        'custom-popover': 'var(--popover)',
        'custom-popover-foreground': 'var(--popover-foreground)',
        'custom-border': 'var(--border)',
        // رنگ‌های لوگو دیگر نیازی به تعریف اینجا ندارند چون کلاس کامل در safelist است
        // اما اگر بخواهید برای آنها نام مستعار بسازید، می‌توانید:
        // 'brand-blue-200': '#bfdbfe', // مثال
      },
      animation: {
        'popover-open-top-center': 'popover-drop-in 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards',
        'popover-close-top-center': 'popover-lift-out 0.3s ease-in forwards',
      },
      keyframes: {
        'popover-drop-in': {
          '0%': { opacity: '0', transform: 'translateY(-100%) scale(0.9)' },
          '70%': { opacity: '1', transform: 'translateY(5px) scale(1.02)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'popover-lift-out': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-100%) scale(0.9)' },
        }
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-blue-200', 'dark:bg-blue-700',
    'bg-blue-300', 'dark:bg-blue-600',
    'bg-blue-400', 'dark:bg-blue-500',
    'bg-green-200', 'dark:bg-green-700',
    'bg-green-300', 'dark:bg-green-600',
    'bg-green-400', 'dark:bg-green-500',
    'bg-gray-200', 'dark:bg-gray-700',
    'bg-gray-300', 'dark:bg-gray-600',
    'bg-gray-400', 'dark:bg-gray-500',
    'animate-ping',
  ]
}