import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { svgMoon, svgSun, getConsistencyStats, formatElapsed } from '../data';

import Path from '../components/Path';
import Roadmap from '../components/Roadmap';
import Library from '../components/Library';
import Profile from '../components/Profile';

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

    return (
        <>
            <nav className="top-nav" id="top-nav">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                        🔥 {consistency.streak} <span style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.75rem' }}>{consistency.streak === 1 ? 'dia' : 'dias'}</span>
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
                        ⚡ {xp} <span style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.75rem' }}>XP</span>
                    </div>
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
                {currentTab === 'view-path' && <Path />}
                {currentTab === 'view-roadmap' && <Roadmap />}
                {currentTab === 'view-workouts' && <Library />}
                {currentTab === 'view-profile' && <Profile onLogout={logout} />}
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
                        <span style={{ fontSize: '1rem' }}>🟢</span>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                                    ⏱️ {formatElapsed(sessionElapsed)}
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
                            ⏹️
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
