import React, { useState, useEffect, useContext, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { svgMoon, svgSun, svgActivity, svgClock, svgStop, svgFlame, svgLightning, getConsistencyStats, getUnlockedBadges, formatElapsed } from '../data';
import Icon from '../components/Icon';
import ErrorBoundary from '../components/ErrorBoundary';

const Path = lazy(() => import('../components/Path'));
const Roadmap = lazy(() => import('../components/Roadmap'));
const Library = lazy(() => import('../components/Library'));
const Profile = lazy(() => import('../components/Profile'));

const Dashboard = () => {
    const { activeUser, userData, logout, activeSession, restTimer, sessionElapsed, endSession } = useContext(AuthContext);
    const navigate = useNavigate();

    const [currentTab, setCurrentTab] = useState('view-path');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        if (!activeUser) {
            navigate('/login');
        }
    }, [activeUser, navigate]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    if (!activeUser) return null;

    const xp = userData?.xp || 0;
    const consistency = getConsistencyStats(userData?.feed);
    const badges = getUnlockedBadges(userData);
    const equippedBadge = userData?.equippedBadge ? badges.find(b => b.id === userData.equippedBadge && b.unlocked) : null;

    return (
        <>
            <nav className="top-nav" id="top-nav">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logoapp.png" alt="Liga do Ferro" style={{ height: '38px', width: '38px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 2px 10px rgba(134, 59, 255, 0.3)' }} />
                    <h1 className="logo">LIGA DO FERRO</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ 
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border)', 
                        padding: '6px 10px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--text-main)'
                    }} title="Dias consecutivos treinados">
                        <span dangerouslySetInnerHTML={{ __html: svgFlame }} style={{ display: 'inline-flex', alignItems: 'center' }}></span> {consistency.streak} <span style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.75rem' }}>{consistency.streak === 1 ? 'dia' : 'dias'}</span>
                    </div>
                    <div style={{ 
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border)', 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--text-main)'
                    }} title="Seu XP Total na Liga">
                        <span dangerouslySetInnerHTML={{ __html: svgLightning }} style={{ display: 'inline-flex', alignItems: 'center' }}></span> {xp} <span style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.75rem' }}>XP</span>
                    </div>
                    {equippedBadge && (
                        <div style={{ 
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))', 
                            border: '1px solid rgba(212, 175, 55, 0.5)', 
                            padding: '6px 10px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '5px',
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            color: '#d4af37',
                            boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }} title="Conquista / Título Equipado">
                            <Icon svg={equippedBadge.icon} color="#d4af37" size={14} />
                            <span>{equippedBadge.name}</span>
                        </div>
                    )}
                    <button 
                        id="theme-toggle" 
                        className="theme-toggle" 
                        onClick={toggleTheme}
                        title="Alternar Modo Claro/Escuro"
                        dangerouslySetInnerHTML={{ __html: theme === 'dark' ? svgSun : svgMoon }}
                    ></button>
                </div>
            </nav>

            <main className="app-content">
                <ErrorBoundary>
                    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</div>}>
                        {currentTab === 'view-path' && <Path />}
                        {currentTab === 'view-roadmap' && <Roadmap />}
                        {currentTab === 'view-workouts' && <Library />}
                        {currentTab === 'view-profile' && <Profile onLogout={logout} />}
                    </Suspense>
                </ErrorBoundary>
            </main>

            {/* MINI-PLAYER FIXO DE TREINO AO VIVO (STICKY WORKOUT BAR) */}
            {activeSession && (
                <div style={{
                    position: 'sticky',
                    bottom: '64px',
                    left: 0,
                    right: 0,
                    zIndex: 999,
                    background: 'var(--bg-card)',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div 
                        onClick={() => setCurrentTab('view-workouts')} 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        title="Clique para abrir sua sessão"
                    >
                        <Icon svg={svgActivity} color="#10b981" size={16} />
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Icon svg={svgClock} color="#d4af37" size={14} /> {formatElapsed(sessionElapsed)}
                                </strong>
                                {restTimer && restTimer.active && (
                                    <span style={{ background: '#d4af37', color: '#000', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800' }}>
                                        Descanso: {Math.floor(restTimer.secondsLeft / 60)}:{String(restTimer.secondsLeft % 60).padStart(2, '0')}
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {activeSession.sets} {activeSession.sets === 1 ? 'série' : 'séries'} • {activeSession.volume} kg
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', width: 'auto', background: 'var(--text-main)', color: 'var(--bg-main)', fontWeight: '700' }}
                            onClick={() => setCurrentTab('view-workouts')}
                        >
                            + Série
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', width: 'auto', borderColor: '#ef4444', color: '#ef4444', fontWeight: '700' }}
                            onClick={endSession}
                            title="Encerrar treino"
                        >
                            <Icon svg={svgStop} color="#ef4444" size={14} />
                        </button>
                    </div>
                </div>
            )}

            <nav className="bottom-nav" id="bottom-nav">
                <button 
                    className={`nav-btn ${currentTab === 'view-path' ? 'active' : ''}`} 
                    onClick={() => setCurrentTab('view-path')}
                >
                    <span className="nav-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                    </span>
                    <span>Trilha</span>
                </button>
                <button 
                    className={`nav-btn ${currentTab === 'view-roadmap' ? 'active' : ''}`} 
                    onClick={() => setCurrentTab('view-roadmap')}
                >
                    <span className="nav-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                    </span>
                    <span>Roadmap</span>
                </button>
                <button 
                    className={`nav-btn ${currentTab === 'view-workouts' ? 'active' : ''}`} 
                    onClick={() => setCurrentTab('view-workouts')}
                >
                    <span className="nav-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5l11 11"/><path d="M21 21l-1-1"/><path d="M3 3l1 1"/><path d="M18 22l4-4"/><path d="M2 6l4-4"/><path d="M3 10l7-7"/><path d="M14 21l7-7"/></svg>
                    </span>
                    <span>Treinos</span>
                </button>
                <button 
                    className={`nav-btn ${currentTab === 'view-profile' ? 'active' : ''}`} 
                    onClick={() => setCurrentTab('view-profile')}
                >
                    <span className="nav-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </span>
                    <span>Perfil</span>
                </button>
            </nav>
        </>
    );
};

export default Dashboard;
