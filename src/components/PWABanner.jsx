import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PWABanner() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.error('SW Registration Error:', error);
    },
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Show install banner if user hasn't dismissed it recently
      const dismissed = localStorage.getItem('pwa_install_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
      setInstallPrompt(null);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  return (
    <div className="pwa-banners-container" style={containerStyle}>
      {/* Offline Notification Badge */}
      {isOffline && (
        <div className="pwa-banner offline-banner" style={offlineStyle}>
          <div style={iconWrapperStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5E5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
          </div>
          <div style={textContentStyle}>
            <span style={titleStyle}>Modo Offline Ativo</span>
            <span style={subtitleStyle}>Seus dados em cache continuam disponíveis para consulta.</span>
          </div>
        </div>
      )}

      {/* App Update Available Banner */}
      {needRefresh && (
        <div className="pwa-banner update-banner" style={updateStyle}>
          <div style={iconWrapperStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#47BFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </div>
          <div style={textContentStyle}>
            <span style={titleStyle}>Nova Atualização da Liga</span>
            <span style={subtitleStyle}>Uma nova versão com melhorias está pronta para uso.</span>
          </div>
          <button onClick={() => updateServiceWorker(true)} style={primaryButtonStyle}>
            Atualizar
          </button>
          <button onClick={() => setNeedRefresh(false)} style={closeButtonStyle} title="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {/* Offline Ready Toast */}
      {offlineReady && (
        <div className="pwa-banner ready-banner" style={readyStyle}>
          <div style={iconWrapperStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#863BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div style={textContentStyle}>
            <span style={titleStyle}>Pronto para Uso Offline</span>
            <span style={subtitleStyle}>O aplicativo foi salvo em cache para acesso instantâneo.</span>
          </div>
          <button onClick={() => setOfflineReady(false)} style={closeButtonStyle} title="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {/* Install PWA Prompt Card */}
      {showInstallBanner && installPrompt && (
        <div className="pwa-banner install-banner" style={installCardStyle}>
          <div style={iconWrapperStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#863BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v14M5 11l7 7 7-7"/>
              <path d="M3 20h18"/>
            </svg>
          </div>
          <div style={textContentStyle}>
            <span style={titleStyle}>Instalar Liga do Ferro</span>
            <span style={subtitleStyle}>Adicione à tela inicial para performance nativa e acesso offline em 1 clique.</span>
          </div>
          <div style={actionButtonsStyle}>
            <button onClick={handleInstallClick} style={primaryButtonStyle}>
              Instalar App
            </button>
            <button onClick={handleDismissDismiss} style={secondaryButtonStyle}>
              Agora não
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function handleDismissDismiss() {
    handleDismissInstall();
  }
}

// Styling (Modern Dark Mode Glassmorphism)
const containerStyle = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  left: '24px',
  maxWidth: '440px',
  marginLeft: 'auto',
  marginRight: 'auto',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  pointerEvents: 'none',
  fontFamily: "'Inter', sans-serif",
};

const baseBannerStyle = {
  pointerEvents: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '16px 18px',
  borderRadius: '16px',
  background: 'rgba(16, 16, 22, 0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
  animation: 'slideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  color: '#FFFFFF',
};

const offlineStyle = {
  ...baseBannerStyle,
  borderLeft: '4px solid #FF5E5E',
};

const updateStyle = {
  ...baseBannerStyle,
  borderLeft: '4px solid #47BFFF',
};

const readyStyle = {
  ...baseBannerStyle,
  borderLeft: '4px solid #863BFF',
};

const installCardStyle = {
  ...baseBannerStyle,
  flexDirection: 'column',
  alignItems: 'stretch',
  border: '1px solid rgba(134, 59, 255, 0.25)',
  background: 'linear-gradient(135deg, rgba(20, 16, 32, 0.9) 0%, rgba(12, 12, 18, 0.95) 100%)',
  padding: '20px',
  gap: '16px',
};

const iconWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.05)',
  flexShrink: 0,
};

const textContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
  flex: 1,
};

const titleStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: '#FFFFFF',
  letterSpacing: '-0.01em',
};

const subtitleStyle = {
  fontSize: '0.82rem',
  color: 'rgba(255, 255, 255, 0.65)',
  lineHeight: '1.4',
};

const actionButtonsStyle = {
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
  marginTop: '4px',
};

const primaryButtonStyle = {
  background: 'linear-gradient(135deg, #863BFF 0%, #6318E0 100%)',
  color: '#FFFFFF',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '10px',
  fontSize: '0.85rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 14px rgba(134, 59, 255, 0.3)',
};

const secondaryButtonStyle = {
  background: 'rgba(255, 255, 255, 0.06)',
  color: 'rgba(255, 255, 255, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: '8px 16px',
  borderRadius: '10px',
  fontSize: '0.85rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
};

const closeButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: 'rgba(255, 255, 255, 0.5)',
  padding: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px',
};
