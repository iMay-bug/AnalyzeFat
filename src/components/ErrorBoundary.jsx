import React from 'react';
import { svgAlert, svgActivity } from '../data';
import Icon from './Icon';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof console !== 'undefined' && console.error) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleResetAndReload = async () => {
    try {
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }
      if (typeof window !== 'undefined' && 'caches' in window) {
        const names = await caches.keys();
        for (let name of names) {
          await caches.delete(name);
        }
      }
    } catch (e) {
      if (typeof console !== 'undefined' && console.error) {
        console.error("Erro ao limpar cache PWA:", e);
      }
    }
    if (typeof window !== 'undefined') {
      window.location.reload(true);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          maxWidth: '480px',
          margin: '40px auto',
          background: 'var(--bg-card)',
          border: '1px solid #ef4444',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#ef4444'
          }}>
            <Icon svg={svgAlert} size={28} color="#ef4444" />
          </div>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '8px' }}>
            Ops! Atualização Necessária
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.5 }}>
            O aplicativo foi atualizado com melhorias na biblioteca de treinos e perfis, mas o cache offline do seu navegador pode estar com uma versão anterior presa em memória.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={this.handleResetAndReload}
            style={{
              background: '#10b981',
              color: '#fff',
              padding: '12px 24px',
              fontSize: '0.9rem',
              fontWeight: '700',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: 'auto',
              margin: '0 auto'
            }}
          >
            <Icon svg={svgActivity} size={18} color="#fff" /> Sincronizar e Atualizar App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
