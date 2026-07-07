/* oxlint-disable react/only-export-components */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { formatElapsed, svgTarget, svgTrophy, svgFlame } from '../data';

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
                        showNotification('Descanso esgotado! Hora da próxima série!', 'success');
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
        const localKey = `analyze_fat_user_${userId}`;
        const localCached = localStorage.getItem(localKey);
        let cachedData = null;
        if (localCached) {
            try {
                cachedData = JSON.parse(localCached);
                if (cachedData) {
                    setActiveUser(cachedData.profileName || email?.split('@')[0] || 'Monstro');
                    setUserData(cachedData);
                    setLoading(false);
                }
            } catch (e) {
                console.error("Error parsing local cache:", e);
            }
        }

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (data) {
            const rawPrs = data.prs || {};
            const meta = rawPrs.__meta || {};
            const cleanPrs = { ...rawPrs };
            delete cleanPrs.__meta;

            const profileName = data.username || email?.split('@')[0] || 'Monstro';
            setActiveUser(profileName);

            const mergedData = {
                xp: data.xp || cachedData?.xp || 0,
                workouts: data.workouts || cachedData?.workouts || 0,
                prs: Object.keys(cleanPrs).length > 0 ? cleanPrs : (cachedData?.prs || {}),
                feed: (data.feed && data.feed.length > 0) ? data.feed : (cachedData?.feed || []),
                profileImg: data.profile_img || cachedData?.profileImg || null,
                profileName: profileName,
                customExercises: (meta.customExercises && meta.customExercises.length > 0) ? meta.customExercises : (cachedData?.customExercises || []),
                routineMap: (meta.routineMap && Object.keys(meta.routineMap).length > 0) ? meta.routineMap : (cachedData?.routineMap || {}),
                favorites: (meta.favorites && meta.favorites.length > 0) ? meta.favorites : (cachedData?.favorites || []),
                bodyWeight: meta.bodyWeight || cachedData?.bodyWeight || 75
            };

            setUserData(mergedData);
            localStorage.setItem(localKey, JSON.stringify(mergedData));
        } else if (!cachedData) {
            const defaultName = metadata?.username || email?.split('@')[0] || 'Monstro';
            setActiveUser(defaultName);
            const defaultData = {
                xp: 0,
                workouts: 0,
                prs: {},
                feed: [],
                profileImg: null,
                profileName: defaultName,
                customExercises: [],
                routineMap: {},
                favorites: [],
                bodyWeight: 75
            };
            setUserData(defaultData);
            localStorage.setItem(localKey, JSON.stringify(defaultData));
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
        
        const updatedData = { ...userData, ...newData };
        setUserData(updatedData);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            localStorage.setItem(`analyze_fat_user_${session.user.id}`, JSON.stringify(updatedData));
        }

        if (!session?.user) return;

        const sqlData = {
            xp: updatedData.xp || 0,
            workouts: updatedData.workouts || 0,
            feed: updatedData.feed || [],
            profile_img: updatedData.profileImg || null,
            username: updatedData.profileName || activeUser || 'Monstro',
            prs: {
                ...(updatedData.prs || {}),
                __meta: {
                    customExercises: updatedData.customExercises || [],
                    routineMap: updatedData.routineMap || {},
                    favorites: updatedData.favorites || [],
                    bodyWeight: updatedData.bodyWeight || 75
                }
            }
        };

        const { error } = await supabase
            .from('profiles')
            .upsert({ id: session.user.id, ...sqlData }, { onConflict: 'id' });
        
        if (error) {
            console.error("Failed to sync data to SQL:", error.message);
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
        showNotification('Sessão de treino iniciada! Foco total!', 'success');
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
        showNotification(`Descanso de ${seconds}s iniciado.`, 'info');
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
                            <span className="reward-icon" dangerouslySetInnerHTML={{ __html: rewardModal.isSessionEnd ? svgTarget : rewardModal.isPR ? svgTrophy : svgFlame }}></span>
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
