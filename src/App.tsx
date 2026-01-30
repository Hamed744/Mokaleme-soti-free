// src/App.tsx (نسخه نامحدود - بدون تایمر، با حالت شب و دکمه پریمیوم)
import React, { useEffect, useRef, useState, FC } from "react";
import './App.scss';
import { AppProvider, useAppContext, PersonalityType, PersonalityInstructions } from "./contexts/AppContext";
import ControlTray from "./components/control-tray/ControlTray";
import { IOSModal } from "./components/ios-modal/IOSModal";
import { isIOS } from "./lib/platform";
import cn from "classnames";
import Logo from "./components/logo/Logo";
import { LiveConfig } from "./multimodal-live-types";
import { speakers } from "./data/speakers";

// کامپوننت مودال
interface CustomModalProps { isOpen: boolean; onClose: () => void; onSave: (name: string, instructions: string) => void; initialName: string; initialInstructions: string; }
const CustomModal: FC<CustomModalProps> = ({ isOpen, onClose, onSave, initialName, initialInstructions }) => {
  const [name, setName] = useState(initialName);
  const [instructions, setInstructions] = useState(initialInstructions);
  useEffect(() => { if (isOpen) { setName(initialName); setInstructions(initialInstructions); } }, [isOpen, initialName, initialInstructions]);
  if (!isOpen) return null;
  const handleSave = () => { if (name.trim() && instructions.trim()) { onSave(name.trim(), instructions.trim()); onClose(); } else { alert("لطفا نام و دستورالعمل‌ها را وارد کنید."); } };
  return ( 
    <div className="modal-overlay" onClick={onClose} translate="no">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>ساخت شخصیت اختصاصی</h3><button className="close-button" onClick={onClose}>×</button></div>
            <div className="modal-body">
                <div className="form-group"><label htmlFor="name">نام شما</label><input id="name" type="text" placeholder="مثلا: حامد" value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="form-group"><label htmlFor="instructions">دستورالعمل‌ها</label><textarea id="instructions" placeholder="مثلا: خیلی خودمونی صحبت کن..." value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={6} /><small>اینجا فقط سبک صحبت کردن را مشخص کنید.</small></div>
            </div>
            <div className="modal-footer"><button className="save-button" onClick={handleSave}>ذخیره</button></div>
        </div>
    </div>
  );
};

// کامپوننت منوی شخصیت‌ها
const PersonalityMenu: React.FC<{ isOpen: boolean; onClose: () => void; onSelectPersonality: (p: PersonalityType) => void; volume: number; }> = ({ isOpen, onClose, onSelectPersonality, volume }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { selectedPersonality, selectedVoice, changeVoice } = useAppContext();
  const personalityIcons: Record<PersonalityType, string> = { default: "person", teacher: "school", poetic: "auto_awesome", funny: "sentiment_satisfied", custom: "tune" };
  const personalityLabels: Record<PersonalityType, string> = { default: 'دستیار پیش‌فرض', teacher: 'استاد زبان', poetic: 'حس خوب', funny: 'شوخ‌طبع', custom: 'شخصیت اختصاصی' };
  const selectedSpeaker = speakers.find(s => s.id === selectedVoice) || speakers[0];
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => menuRef.current && !menuRef.current.contains(e.target as Node) && onClose();
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div ref={menuRef} className="personality-popover-wrapper open" translate="no">
      <div className="popover-content">
        <div className={cn("selected-voice-display", { speaking: volume > 0.01 })}>
          <div className="voice-image-wrapper"><img src={selectedSpeaker.imgUrl} alt={selectedSpeaker.name} /></div>
          <h3>{selectedSpeaker.name}</h3><p>{selectedSpeaker.desc}</p>
        </div>
        <hr className="menu-divider" />
        <h4 className="menu-subtitle">انتخاب شخصیت</h4>
        <ul>
          {(Object.keys(personalityIcons) as PersonalityType[]).map(key => (
            <li key={key} className={cn({ active: selectedPersonality === key })} onClick={() => onSelectPersonality(key)}>
              <div><span className="material-symbols-outlined">{personalityIcons[key]}</span>{personalityLabels[key]}</div>
              {selectedPersonality === key && <span className="material-symbols-outlined tick">done</span>}
            </li>
          ))}
        </ul>
        <hr className="menu-divider" />
        <h4 className="menu-subtitle">انتخاب گوینده</h4>
        <div className="voice-grid">
          {speakers.map(speaker => (
            <div key={speaker.id} className={cn("voice-card", { active: selectedVoice === speaker.id })} onClick={() => changeVoice(speaker.id)} title={speaker.name}>
              <img src={speaker.imgUrl} alt={speaker.name} loading="lazy" />
              <div className="voice-name">{speaker.name.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// کامپوننت داخلی اصلی برنامه (نسخه نامحدود)
const AppInternal: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { volume, changePersonality, customUserName, customInstructions } = useAppContext();
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCamActive, setIsCamActive] = useState(false);
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>('user');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPersonalityMenuOpen, setIsPersonalityMenuOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  
  // استیت حالت شب
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    return saved === 'dark';
  });

  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const notificationPopoverRef = useRef<HTMLDivElement>(null);

  // افکت اعمال تم و ارسال پیام به Iframe
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('app_theme', 'dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#09090b'); 
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('app_theme', 'light');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#ffffff');
    }

    if (window.parent) {
      window.parent.postMessage({ 
        type: 'THEME_CHANGE', 
        isDarkMode: isDarkMode 
      }, '*');
    }
  }, [isDarkMode]);

  const handleSelectPersonality = (p: PersonalityType) => {
    setIsPersonalityMenuOpen(false);
    if (p === 'custom') { setIsCustomModalOpen(true); } else { changePersonality(p); }
  };
  const handleSaveCustom = (name: string, instructions: string) => {
    changePersonality('custom', { name, instructions });
  };
  
  // هندلر کلیک خارج از منوها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isNotificationOpen && notificationPopoverRef.current && !notificationPopoverRef.current.contains(event.target as Node) && notificationButtonRef.current && !notificationButtonRef.current.contains(event.target as Node)) setIsNotificationOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationOpen]);

  return (
    <>
      <div className="main-wrapper">
        <div className="header-controls">
          <button aria-label="انتخاب شخصیت" className="header-icon-button" onClick={() => setIsPersonalityMenuOpen(v => !v)}><span className="material-symbols-outlined" translate="no">account_circle</span></button>
          <button ref={notificationButtonRef} aria-label="اطلاعات" className="header-icon-button" onClick={() => setIsNotificationOpen(v => !v)}><span className="material-symbols-outlined" translate="no">info</span></button>
        </div>
        
        {/* پاپ‌آپ نوتیفیکیشن و دکمه حالت شب */}
        <div ref={notificationPopoverRef} id="notification-popover-wrapper" className="notification-popover-wrapper">
          <div id="notification-popover" className={cn("popover-content", { "open animate-popover-open-top-center": isNotificationOpen, "animate-popover-close-top-center": !isNotificationOpen && document.getElementById('notification-popover')?.classList.contains('open'), })}>
            <div className="notification-popover-text-content">
                <p style={{ margin: 0, marginBottom: '20px' }}>
                مدل‌های هوش مصنوعی می‌توانند اشتباه کنند، صحت اطلاعات مهم را بررسی کنید. بهتر است برای اینکه صحبت شفاف و بدون لگ باشه فیلتر شکن تونو خاموش کنید تا کیفیت اینترنت ثابت بمونه.
                </p>
                
                {/* دکمه پریمیوم حالت شب */}
                <div className="theme-toggle-container">
                    <button 
                        className={cn("premium-theme-toggle", { "dark-active": isDarkMode })}
                        onClick={() => setIsDarkMode(!isDarkMode)}
                    >
                        <div className="toggle-content">
                            <div className="icon-wrapper">
                                <span className="material-symbols-outlined sun-icon">wb_sunny</span>
                                <span className="material-symbols-outlined moon-icon">dark_mode</span>
                            </div>
                            <span className="toggle-label">
                                {isDarkMode ? 'حالت شب فعال' : 'حالت روز فعال'}
                            </span>
                        </div>
                        <div className="toggle-background"></div>
                        {isDarkMode && <div className="stars"></div>}
                    </button>
                </div>
            </div>
          </div>
        </div>

        <PersonalityMenu isOpen={isPersonalityMenuOpen} onClose={() => setIsPersonalityMenuOpen(false)} onSelectPersonality={handleSelectPersonality} volume={volume} />
        
        <div className="media-area">
          <video id="video-feed" ref={videoRef} autoPlay playsInline className={cn({ hidden: !isCamActive }, { "scale-x-[-1]": currentFacingMode === 'user' })} />
          {/* لوگوی وسط صفحه (تکان می‌خورد) */}
          {isMicActive && !isCamActive && <div id="large-logo-container"><Logo isMini={false} isActive={true} isAi={false} speakingVolume={volume} isUserSpeaking={isUserSpeaking} /></div>}
        </div>
        
        {/* کنترل تری (بدون محدودیت زمانی) */}
        <ControlTray 
            videoRef={videoRef} 
            onUserSpeakingChange={setIsUserSpeaking} 
            isAppMicActive={isMicActive} 
            onAppMicToggle={setIsMicActive} 
            isAppCamActive={isCamActive} 
            onAppCamToggle={setIsCamActive} 
            currentFacingMode={currentFacingMode} 
            onFacingModeChange={setCurrentFacingMode}
            isTimeUp={false} // همیشه false چون نامحدود است
        />
      </div>
      <CustomModal isOpen={isCustomModalOpen} onClose={() => setIsCustomModalOpen(false)} onSave={handleSaveCustom} initialName={customUserName} initialInstructions={customInstructions} />
    </>
  );
};

// کامپوننت ریشه App
function App() {
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [personalityInstructions, setPersonalityInstructions] = useState<PersonalityInstructions | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  useEffect(() => {
    if (isIOS()) setShowIOSModal(true);
    const fetchInstructions = async () => {
      try {
        const res = await fetch('/api/instructions');
        if (!res.ok) throw new Error(`Network error: ${res.status}`);
        setPersonalityInstructions(await res.json());
      } catch (e) { setLoadingError("امکان دریافت تنظیمات شخصیت‌ها وجود ندارد. لطفاً صفحه را رفرش کنید."); }
    };
    fetchInstructions();
  }, []);
  if (loadingError) return <div className="loading-screen">{loadingError}</div>;
  if (!personalityInstructions) return <div className="loading-screen">در حال بارگذاری...</div>;
  const initialAppConfig: LiveConfig = { model: "models/gemini-2.5-flash-native-audio-preview-09-2025" };
  return (
    <AppProvider initialConfig={initialAppConfig} personalityInstructions={personalityInstructions}><AppInternal /><IOSModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} /></AppProvider>
  );
}
export default App;