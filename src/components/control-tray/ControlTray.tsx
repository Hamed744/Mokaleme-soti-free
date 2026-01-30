// src/components/control-tray/ControlTray.tsx (نسخه نهایی و بدون خطا)

import cn from "classnames";
import React, { memo, RefObject, useEffect, useState, useCallback, useRef } from "react";
import { useAppContext } from "../../contexts/AppContext";
import { AudioRecorder } from "../../lib/audio-recorder";
import Logo from '../logo/Logo';
import { PauseIconWithSurroundPulse, microphoneIcon, cameraIcon, stopCamIcon } from '../icons';

const SvgSwitchCameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/><path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"/><path d="m17 12-3-3 3-3"/><path d="m7 12 3 3-3 3"/></svg>;

export type ControlTrayProps = {
  videoRef: RefObject<HTMLVideoElement>;
  onUserSpeakingChange: (isSpeaking: boolean) => void;
  isAppMicActive: boolean;
  onAppMicToggle: (active: boolean) => void;
  isAppCamActive: boolean;
  onAppCamToggle: (active: boolean) => void;
  currentFacingMode: 'user' | 'environment';
  onFacingModeChange: (mode: 'user' | 'environment') => void;
  isTimeUp: boolean; // ✅ این خط اضافه شد تا با App.tsx هماهنگ شود
};

const ControlTray: React.FC<ControlTrayProps> = ({ videoRef, onUserSpeakingChange, isAppMicActive, onAppMicToggle, isAppCamActive, onAppCamToggle, currentFacingMode, onFacingModeChange, isTimeUp }) => {
  const { client, connected, connect, volume } = useAppContext();
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const [activeLocalVideoStream, setActiveLocalVideoStream] = useState<MediaStream | null>(null);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const renderCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const [userVolume, setUserVolume] = useState(0);

  useEffect(() => {
    if (!audioRecorderRef.current) audioRecorderRef.current = new AudioRecorder();
    const audioRecorder = audioRecorderRef.current;
    
    const handleAudioData = (base64: string, vol: number) => {
      if (client && connected && isAppMicActive) {
        if (base64) client.sendRealtimeInput([{ mimeType: "audio/pcm;rate=16000", data: base64 }]);
        
        // حجم صدا ذخیره می‌شود تا به App.tsx برای لوگوی وسط ارسال شود
        setUserVolume(vol);
        onUserSpeakingChange(vol > 0.01);
      }
    };
    
    const onStop = () => { setUserVolume(0); onUserSpeakingChange(false); };
    
    if (isAppMicActive && connected) {
      audioRecorder.on("data", handleAudioData);
      audioRecorder.on("stop", onStop);
      if (!audioRecorder.recording) audioRecorder.start();
    } else if (audioRecorder?.recording) { 
      audioRecorder.stop(); 
    }
    
    return () => { 
      if (audioRecorder) { 
        audioRecorder.off("data", handleAudioData); 
        audioRecorder.off("stop", onStop); 
      } 
    };
  }, [isAppMicActive, connected, onUserSpeakingChange, client]);
  
  useEffect(() => {
    if (videoRef.current) {
      if (videoRef.current.srcObject !== activeLocalVideoStream) {
        videoRef.current.srcObject = activeLocalVideoStream;
        if (activeLocalVideoStream) videoRef.current.play().catch(e => console.warn("Video play failed:", e));
      }
    }
  }, [activeLocalVideoStream, videoRef]);

  const startWebcam = useCallback(async (facingModeToTry: 'user' | 'environment') => {
    if (isSwitchingCamera) return;
    setIsSwitchingCamera(true);
    if (activeLocalVideoStream) activeLocalVideoStream.getTracks().forEach(track => track.stop());
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingModeToTry }, audio: false });
      setActiveLocalVideoStream(mediaStream);
      onFacingModeChange(facingModeToTry);
    } catch (error) {
      console.error(`❌ Start WC err ${facingModeToTry}:`, error);
      setActiveLocalVideoStream(null);
      onAppCamToggle(false);
    } finally { setIsSwitchingCamera(false); }
  }, [isSwitchingCamera, activeLocalVideoStream, onFacingModeChange, onAppCamToggle]);

  useEffect(() => {
    if (isAppCamActive && !activeLocalVideoStream && !isSwitchingCamera) {
      startWebcam(currentFacingMode);
    } else if (!isAppCamActive && activeLocalVideoStream) {
      activeLocalVideoStream.getTracks().forEach(track => track.stop());
      setActiveLocalVideoStream(null);
    }
  }, [isAppCamActive, activeLocalVideoStream, isSwitchingCamera, startWebcam, currentFacingMode]);

  useEffect(() => {
    let timeoutId = -1;
    function sendVideoFrame() {
      if (connected && activeLocalVideoStream && client && videoRef.current) {
        const video = videoRef.current;
        const canvas = renderCanvasRef.current;
        if (!canvas || video.readyState < video.HAVE_METADATA || video.paused || video.ended) {
          if (activeLocalVideoStream) timeoutId = window.setTimeout(sendVideoFrame, 1000 / 4);
          return;
        }
        try {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const scale = 0.5;
          canvas.width = video.videoWidth * scale;
          canvas.height = video.videoHeight * scale;
          if (canvas.width > 0 && canvas.height > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL("image/jpeg", 0.8);
            const data = base64.slice(base64.indexOf(",") + 1);
            if (data) client.sendRealtimeInput([{ mimeType: "image/jpeg", data }]);
          }
        } catch (error) { console.error("❌ Error frame:", error); }
      }
      if (connected && activeLocalVideoStream) timeoutId = window.setTimeout(sendVideoFrame, 1000 / 4);
    }
    if (connected && activeLocalVideoStream && videoRef.current) timeoutId = window.setTimeout(sendVideoFrame, 200);
    return () => clearTimeout(timeoutId);
  }, [connected, activeLocalVideoStream, client, videoRef, renderCanvasRef]);

  const ensureConnectedAndReady = async (): Promise<boolean> => {
    if (isTimeUp) return false;
    if (!connected) {
      try { await connect(); return true; }
      catch (err) { console.error('❌ CT Connect err:', err); return false; }
    }
    return true;
  };

  const handleMicToggle = async () => {
    if (isSwitchingCamera || isTimeUp) return;
    const newMicState = !isAppMicActive;
    if (newMicState && !(await ensureConnectedAndReady())) {
      onAppMicToggle(false); return;
    }
    onAppMicToggle(newMicState);
  };

  const handleCamToggle = async () => {
    if (isSwitchingCamera || isTimeUp) return;
    const newCamState = !isAppCamActive;
    if (newCamState) {
        if (!(await ensureConnectedAndReady())) { onAppCamToggle(false); return; }
        if (!isAppMicActive) onAppMicToggle(true);
        onAppCamToggle(true);
    } else { onAppCamToggle(false); }
  };

  const handleSwitchCamera = async () => {
    if (!isAppCamActive || !activeLocalVideoStream || isSwitchingCamera || isTimeUp) return;
    setIsSwitchingCamera(true);
    const targetFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    activeLocalVideoStream.getTracks().forEach(track => track.stop());
    setActiveLocalVideoStream(null);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: targetFacingMode } }, audio: false });
      setActiveLocalVideoStream(newStream);
      onFacingModeChange(targetFacingMode);
    } catch (error) {
      console.error(`❌ Switch Cam err to ${targetFacingMode}:`, error);
      try {
        const restoredStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: {exact: currentFacingMode } }, audio: false });
        setActiveLocalVideoStream(restoredStream);
      } catch (restoreError) {
        console.error(`❌ Restore Cam err to ${currentFacingMode}:`, restoreError);
        setActiveLocalVideoStream(null);
        onAppCamToggle(false);
      }
    } finally { setIsSwitchingCamera(false); }
  };
  
  const isSpeaking = userVolume > 0.01;

  return (
    <footer id="footer-controls" className="footer-controls-html-like">
      <canvas style={{ display: "none" }} ref={renderCanvasRef} />
      
      {/* دکمه میکروفون: به آن 0 پاس می‌دهیم تا انیمیشن نداشته باشد */}
      <div id="mic-button" className={cn("control-button mic-button-color", { "disabled": isTimeUp })} onClick={handleMicToggle}>
        {isAppMicActive ? <PauseIconWithSurroundPulse userVolume={0} /> : microphoneIcon}
      </div>
      
      {isAppCamActive && (
        <div id="small-logo-footer-container" className="small-logo-footer-html-like">
            <Logo isMini={true} isActive={true} isAi={false} speakingVolume={volume} isUserSpeaking={isSpeaking}/>
        </div>
      )}

      <div id="cam-button-wrapper" className="control-button-wrapper">
        <div id="cam-button" className={cn("control-button cam-button-color", { "disabled": isTimeUp })} onClick={handleCamToggle}>
          {isAppCamActive ? stopCamIcon : cameraIcon}
        </div>
        <div id="switch-camera-button-container" className={cn("switch-camera-button-container", { visible: isAppCamActive && !isSwitchingCamera })}>
          <button id="switch-camera-button" aria-label="Switch Camera" className="switch-camera-button-content group" onClick={handleSwitchCamera} disabled={!isAppCamActive || isSwitchingCamera || isTimeUp}>
            <SvgSwitchCameraIcon/>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default memo(ControlTray);