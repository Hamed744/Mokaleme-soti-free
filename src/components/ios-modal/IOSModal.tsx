import React, { useState } from 'react';
import './IOSModal.scss';

interface IOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSModal: React.FC<IOSModalProps> = ({ isOpen, onClose }) => {
  const [error, setError] = useState<string | null>(null);

  const handleMicPermission = async () => {
    try {
      console.log('🎤 Requesting iOS microphone permission from modal...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ iOS microphone permission granted from modal!');
      // Stop the stream since we don't need it yet - we'll request it again when recording starts
      stream.getTracks().forEach(track => track.stop());
      setError(null);
      onClose();
    } catch (err) {
      console.error('❌ iOS microphone permission denied from modal:', err);
      setError(err instanceof Error ? err.message : 'Failed to access microphone');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ios-modal-overlay">
      <div className="ios-modal">
        <h2>Microphone Access Required</h2>
        <p>
          To use this app on iOS, we need permission to access your microphone.
          Please tap "Allow" when prompted.
        </p>
        <p>
          If you've denied permission, you'll need to enable it in your device settings.
        </p>
        {error && (
          <p className="error-message">
            Error: {error}
          </p>
        )}
        <button onClick={handleMicPermission} className="ios-modal-button">
          {error ? 'Try Again' : 'Got it'}
        </button>
      </div>
    </div>
  );
}; 