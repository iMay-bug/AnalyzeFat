import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { formatElapsed } from '../data';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [activeUser, setActiveUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [rewardModal, setRewardModal] = useState(null);

    const [activeSession, setActiveSession] = useState(() => {
        const s = localStorage.getItem('activeSession');
        return s ? JSON.parse(s) : null;
    });
    const [restTimer, setRestTimer] = useState(null);
    const [sessionElapsed, setSessionElapsed] = useState(0);

    useEffect(() => {
        let interval = null;
        if (activeSession && activeSession.startTime) {
            setSessionElapsed(Math.floor((Date.now() - activeSession.startTime) / 1000));
            interval = setInterval(() => {
                setSessionElapsed(Math.floor((Date.now() - activeSession.startTime) / 1000));
            }, 1000);
        } else {
            setSessionElapsed(0);
        }
        return () => clearInterval(interval);
    }, [activeSession]);

    useEffect(() => {
        let interval = null;
        if (restTimer && restTimer.active && restTimer.secondsLeft > 0) {
            interval = setInterval(() => {
                setRestTimer(prev => {
                    if (!prev || !prev.active) return null;
                    if (prev.secondsLeft <= 1) {
                        showNotification('⏱️ Descanso esgotado! Hora da próxima série!', 'success');
                        return null;
                    }
                    return { ...prev, secondsLeft: prev.secondsLeft - 1 };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [restTimer]);

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification((prev) => prev?.message === message ? null : prev);
        }, 4500);
    };

    const showRewardModal = (rewardData) => {
        setRewardModal(rewardData);
    };

    const fetchUserProfile = async (userId, email, metadata) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (data) {
            setActiveUser(data.username || email?.split('@')[0] || 'Monstro');
            setUserData({
                xp: data.xp || 0,
                workouts: data.workouts || 0,
                prs: data.prs || {},
                feed: data.feed || [],
                profileImg: data.profile_img || null,
                profileName: data.username || email?.split('@')[0] || 'Monstro'
            });
        } else {
            // Fallback robusto: se o perfil ainda não existir no banco, inicializa com objeto padrão em vez de null
            const defaultName = metadata?.username || email?.split('@')[0] || 'Monstro';
            setActiveUser(defaultName);
            setUserData({
                xp: 0,
                workouts: 0,
                prs: {},
                feed: [],
                profileImg: null,
                profileName: defaultName
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        // Fetch current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchUserProfile(session.user.id, session.user.email, session.user.user_metadata);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchUserProfile(session.user.id, session.user.email, session.user.user_metadata);
            } else {
                setActiveUser(null);
                setUserData(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, pass) => {
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: pass,
        });
        
        if (error) {
            console.error("Login error:", error.message);
            return { success: false, message: error.message };
        }
        return { success: true };
    };

    const register = async (email, pass, username) => {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: pass,
            options: {
                data: {
                    username: username ? username.trim() : email.split('@')[0]
                }
            }
        });

        if (error) {
            console.error("Register error:", error.message);
            return { success: false, message: error.message };
        }
        
        if (!data.session) {
            return { success: false, message: "O Supabase está exigindo Confirmação de E-mail. Vá no painel do Supabase > Authentication > Providers > Email e DESATIVE a opção 'Confirm email'." };
        }

        return { success: true };
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const syncData = async (newData) => {
        if (!activeUser) return;
        
        // Optimistic UI update com rollback
        const previousData = { ...userData };
        const updatedData = { ...userData, ...newData };
        setUserData(updatedData);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Map React state keys to SQL column names
        const sqlData = {};
        if (newData.xp !== undefined) sqlData.xp = newData.xp;
        if (newData.workouts !== undefined) sqlData.workouts = newData.workouts;
        if (newData.prs !== undefined) sqlData.prs = newData.prs;
        if (newData.feed !== undefined) sqlData.feed = newData.feed;
        if (newData.profileImg !== undefined) sqlData.profile_img = newData.profileImg;
        if (newData.profileName !== undefined) sqlData.username = newData.profileName;

        // Push to Supabase SQL Table usando upsert para evitar erros caso a linha do perfil não exista
        const { error } = await supabase
            .from('profiles')
            .upsert({ id: session.user.id, ...sqlData }, { onConflict: 'id' });
        
        if (error) {
            console.error("Failed to sync data to SQL:", error.message);
            setUserData(previousData);
            showNotification("Erro ao sincronizar dados no servidor. Alterações foram revertidas.", "error");
        }
    };

    const startSession = () => {
        const newSession = {
            startTime: Date.now(),
            sets: 0,
            volume: 0,
            xpGained: 0
        };
        setActiveSession(newSession);
        localStorage.setItem('activeSession', JSON.stringify(newSession));
        showNotification('🚀 Sessão de treino iniciada! Foco total!', 'success');
    };

    const endSession = () => {
        if (!activeSession) return;
        const exactTime = formatElapsed(Math.floor((Date.now() - activeSession.startTime) / 1000));
        showRewardModal({
            title: "SESSÃO DE TREINO FINALIZADA!",
            xpGained: activeSession.xpGained,
            isPR: false,
            isSessionEnd: true,
            exerciseName: `Duração: ${exactTime} • ${activeSession.sets} séries • ${activeSession.volume} kg totais`
        });
        setActiveSession(null);
        localStorage.removeItem('activeSession');
    };

    const logToSession = (volume, xpGained, setsCount = 1) => {
        if (!activeSession) return;
        const updated = {
            ...activeSession,
            sets: activeSession.sets + setsCount,
            volume: activeSession.volume + volume,
            xpGained: activeSession.xpGained + xpGained
        };
        setActiveSession(updated);
        localStorage.setItem('activeSession', JSON.stringify(updated));
    };

    const startRestTimer = (seconds) => {
        setRestTimer({ secondsLeft: seconds, totalSeconds: seconds, active: true });
        showNotification(`⏱️ Descanso de ${seconds}s iniciado.`, 'info');
    };

    const stopRestTimer = () => {
        setRestTimer(null);
    };

    return (
        <AuthContext.Provider value={{ 
            activeUser, 
            userData, 
            login, 
            register, 
            logout, 
            syncData, 
            loading,
            showNotification,
            showRewardModal,
            activeSession,
            startSession,
            endSession,
            logToSession,
            restTimer,
            startRestTimer,
            stopRestTimer,
            sessionElapsed
        }}>
            {!loading && children}

            {/* Custom Toast Notification */}
            {notification && (
                <div className={`toast-notification toast-${notification.type}`}>
                    <div className="toast-content">
                        <span>{notification.message}</span>
                    </div>
                    <button onClick={() => setNotification(null)} className="toast-close">&times;</button>
                </div>
            )}

            {/* Custom Reward Celebration Modal */}
            {rewardModal && (
                <div className="modal reward-modal active" onClick={() => setRewardModal(null)}>
                    <div className="modal-content reward-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setRewardModal(null)}>×</button>
                        <div className="reward-header">
                            <span className="reward-icon">{rewardModal.isSessionEnd ? '🎯' : rewardModal.isPR ? '🏆' : '🔥'}</span>
                            <h2>{rewardModal.isSessionEnd ? 'TREINO CONCLUÍDO!' : rewardModal.isPR ? 'NOVO RECORDE PESSOAL!' : 'SÉRIE REGISTRADA!'}</h2>
                        </div>
                        <p className="reward-exercise">{rewardModal.exerciseName}</p>
                        <div className="reward-xp-badge">
                            +{rewardModal.xpGained} XP
                        </div>
                        {rewardModal.isPR && !rewardModal.isSessionEnd && (
                            <p className="reward-pr-text">Você superou sua marca anterior neste exercício! Monstro!</p>
                        )}
                        {rewardModal.isSessionEnd && (
                            <p className="reward-pr-text" style={{ color: 'var(--text-main)' }}>Sessão finalizada com sucesso. Ótima constância!</p>
                        )}
                        <button 
                            className="btn-primary" 
                            style={{ marginTop: '20px', width: '100%' }}
                            onClick={() => setRewardModal(null)}
                        >
                            {rewardModal.isSessionEnd ? 'FECHAR RESUMO' : 'CONTINUAR ESMAGANDO'}
                        </button>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};
