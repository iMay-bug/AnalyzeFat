import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { exercisesDB, formatElapsed, calculate1RM, getExerciseHistory, calculatePlates, getExerciseRoutineGroup, getWeeklyTonnage, svgLightning, svgBox, svgSearch, svgActivity, svgClock, svgStop, svgStar, svgTarget, svgTrending, svgDumbbell, svgFlame, svgBiceps, svgPlay, svgBack, svgPlus, svgCheck, svgCalculator } from '../data';
import Icon from './Icon';

const Library = () => {
    const { userData, syncData, showRewardModal, showNotification, activeSession, startSession, endSession, logToSession, restTimer, startRestTimer, stopRestTimer, sessionElapsed } = useContext(AuthContext);
    
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [routineFilter, setRoutineFilter] = useState('ALL');
    const [rpe, setRpe] = useState('NORMAL');
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customGroup, setCustomGroup] = useState('Peito');
    const [customRoutine, setCustomRoutine] = useState('A');

    const [showCreateRoutineModal, setShowCreateRoutineModal] = useState(false);
    const [newRoutineName, setNewRoutineName] = useState('');
    const [newRoutineColor, setNewRoutineColor] = useState('#863bff');
    const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
    const [addExerciseSearch, setAddExerciseSearch] = useState('');

    const [showCalcModal, setShowCalcModal] = useState(false);
    const [calcWeight, setCalcWeight] = useState('100');
    const [calcBar, setCalcBar] = useState(20);

    const defaultRoutinesList = useMemo(() => [
        { id: 'A', name: 'Treino A (Peito/Tríceps)', label: 'Treino A', color: '#ef4444', dotClass: 'dot-a' },
        { id: 'B', name: 'Treino B (Costas/Bíceps)', label: 'Treino B', color: '#3b82f6', dotClass: 'dot-b' },
        { id: 'C', name: 'Treino C (Pernas)', label: 'Treino C', color: '#10b981', dotClass: 'dot-c' },
        { id: 'D', name: 'Treino D (Ombros/Core)', label: 'Treino D', color: '#f59e0b', dotClass: 'dot-d' }
    ], []);

    const allRoutines = useMemo(() => {
        const custom = Array.isArray(userData?.customRoutines) ? userData.customRoutines : [];
        return [...defaultRoutinesList, ...custom];
    }, [defaultRoutinesList, userData?.customRoutines]);

    const handleCreateRoutine = (e) => {
        e.preventDefault();
        if (!newRoutineName.trim()) return;
        const newId = 'rot_' + Date.now();
        const newRot = {
            id: newId,
            name: newRoutineName.trim(),
            label: newRoutineName.trim().substring(0, 15),
            color: newRoutineColor,
            isCustom: true
        };
        const currentCustom = Array.isArray(userData?.customRoutines) ? userData.customRoutines : [];
        syncData({
            customRoutines: [...currentCustom, newRot]
        });
        showNotification(`Treino "${newRoutineName}" criado com sucesso!`, "success");
        setNewRoutineName('');
        setShowCreateRoutineModal(false);
        setRoutineFilter(newId);
    };

    const handleCreateCustomExercise = (e) => {
        e.preventDefault();
        if (!customName.trim()) return;
        const newId = 'custom_' + Date.now();
        const newEx = {
            id: newId,
            name: customName.trim(),
            desc: `${customGroup} • Exercício Personalizado`,
            img: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%2318181b' rx='12'/%3E%3Crect width='400' height='200' fill='rgba(255,255,255,0.02)' rx='12'/%3E%3Ctext x='200' y='110' text-anchor='middle' font-family='sans-serif' font-weight='700' font-size='20' fill='%23f4f4f5'%3E${encodeURIComponent(customName.trim().toUpperCase())}%3C/text%3E%3Ctext x='200' y='140' text-anchor='middle' font-family='sans-serif' font-weight='400' font-size='13' fill='%2371717a'%3E${encodeURIComponent(customGroup + " • Personalizado")}%3C/text%3E%3C/svg%3E`,
            group: customGroup
        };
        const currentCustom = userData?.customExercises || [];
        const currentRoutineMap = userData?.routineMap || {};
        const currentFavs = userData?.favorites || [];
        syncData({
            customExercises: [...currentCustom, newEx],
            routineMap: { ...currentRoutineMap, [newId]: customRoutine },
            favorites: [...currentFavs, newId]
        });
        showNotification(`Exercício "${customName}" criado e adicionado ao Treino ${customRoutine}!`, "success");
        setCustomName('');
        setShowCustomModal(false);
    };

    const favorites = useMemo(() => Array.isArray(userData?.favorites) ? userData.favorites : [], [userData?.favorites]);

    const allExercisesDB = useMemo(() => {
        const custom = Array.isArray(userData?.customExercises) ? userData.customExercises : [];
        if (custom.length === 0) return exercisesDB;

        const customGrouped = {};
        custom.forEach(c => {
            if (!c || typeof c !== 'object') return;
            const grp = c.group || 'Geral';
            if (!customGrouped[grp]) customGrouped[grp] = [];
            customGrouped[grp].push(c);
        });

        return exercisesDB.map(group => {
            const extra = customGrouped[group.group] || [];
            return {
                ...group,
                items: [...(group.items || []), ...extra]
            };
        });
    }, [userData?.customExercises]);

    const toggleFavorite = (e, exId) => {
        e.stopPropagation();
        const exists = favorites.includes(exId);
        const newFavs = exists ? favorites.filter(id => id !== exId) : [...favorites, exId];
        syncData({ favorites: newFavs });
        showNotification(exists ? "Removido dos favoritos." : "Adicionado aos favoritos!", "info");
    };

    const openModal = (ex) => {
        setSelectedExercise(ex);
        setWeight('');
        setReps('');
        setRpe('NORMAL');
    };

    const closeModal = () => {
        setSelectedExercise(null);
    };

    const handleLogWorkout = (e) => {
        e.preventDefault();
        if (!selectedExercise) return;

        const w = parseFloat(weight);
        const r = parseInt(reps);
        if (isNaN(w) || isNaN(r)) return;

        const volume = w * r;
        const currentPrs = userData?.prs || {};
        const isPR = !currentPrs[selectedExercise.id] || volume > currentPrs[selectedExercise.id];

        const newPrs = { ...currentPrs };
        if (isPR) {
            newPrs[selectedExercise.id] = volume;
        }

        let xpGained = Math.floor(volume / 250);
        if (xpGained < 1) xpGained = 1;
        if (isPR) xpGained += 5;
        if (rpe === 'FAIL') xpGained += 2;

        const oldTonnage = getWeeklyTonnage(userData?.feed);
        const newFeedItem = {
            id: Date.now() + Math.random().toString(36).substring(2, 7),
            exerciseId: selectedExercise.id,
            name: selectedExercise.name,
            weight: w,
            reps: r,
            rpe: rpe,
            xpGained: xpGained,
            isPR: isPR,
            date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
            isoDate: new Date().toISOString()
        };

        let newFeed = [newFeedItem, ...(userData?.feed || [])];
        if (newFeed.length > 50) newFeed.pop();

        const newTonnage = getWeeklyTonnage(newFeed);
        let extraBonus = 0;
        if (!oldTonnage.isCompleted && newTonnage.isCompleted) {
            extraBonus = 50;
            xpGained += 50;
        }

        const newXp = (userData?.xp || 0) + xpGained;
        const newWorkouts = (userData?.workouts || 0) + 1;

        syncData({
            xp: newXp,
            workouts: newWorkouts,
            prs: newPrs,
            feed: newFeed
        });

        if (activeSession) {
            logToSession(volume, xpGained, 1);
        }

        showRewardModal({
            title: extraBonus > 0 ? "DESAFIO SEMANAL BATIDO!" : (isPR ? "NOVO RECORDE PESSOAL" : "SÉRIE CONCLUÍDA"),
            xpGained: xpGained,
            isPR: isPR || extraBonus > 0,
            exerciseName: `${selectedExercise.name} (${w}kg × ${r} reps)${extraBonus > 0 ? " • +50 XP Tonelagem" : ""}`
        });
        showNotification(extraBonus > 0 ? `Desafio Concluído! +${xpGained} XP registrado!` : `+${xpGained} XP registrado com sucesso.`, 'success');

        closeModal();
    };

    const adjustWeight = (amount) => {
        const current = parseFloat(weight) || 0;
        const next = Math.max(0, current + amount);
        setWeight(next.toString());
    };

    const adjustReps = (amount) => {
        const current = parseInt(reps) || 0;
        const next = Math.max(1, current + amount);
        setReps(next.toString());
    };

    const filteredGroups = useMemo(() => {
        const term = (searchTerm || "").trim().toLowerCase();
        return (allExercisesDB || []).map(group => {
            if (!group || !Array.isArray(group.items)) return null;
            const matchingItems = group.items.filter(ex => {
                if (!ex || typeof ex !== 'object') return false;
                const matchesTerm = !term || (ex.name || "").toLowerCase().includes(term) || (ex.desc || "").toLowerCase().includes(term);
                if (!matchesTerm) return false;
                if (routineFilter === 'FAV') return Array.isArray(favorites) && favorites.includes(ex.id);
                if (routineFilter !== 'ALL') return getExerciseRoutineGroup(ex, ex?.id, userData?.routineMap) === routineFilter;
                return true;
            });
            if (((group.group || "").toLowerCase().includes(term) && routineFilter === 'ALL') || matchingItems.length > 0) {
                return {
                    ...group,
                    items: matchingItems.length > 0 ? matchingItems : (routineFilter === 'ALL' ? group.items : [])
                };
            }
            return null;
        }).filter(g => g && Array.isArray(g.items) && g.items.length > 0);
    }, [searchTerm, routineFilter, favorites, allExercisesDB, userData?.routineMap]);

    return (
        <section id="view-workouts" className="view-section active">
            {/* SESSÃO DE TREINO AO VIVO (5) E CRONÔMETRO DE DESCANSO (1) */}
            <div className="live-session-header" style={{ 
                background: activeSession ? 'var(--bg-card-hover)' : 'var(--bg-card)', 
                border: `1px solid ${activeSession ? 'var(--text-main)' : 'var(--border)'}`, 
                borderRadius: '12px', 
                padding: '16px 20px', 
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }} dangerouslySetInnerHTML={{ __html: activeSession ? svgActivity : svgLightning }}></span>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                    {activeSession ? 'Sessão de Treino em Andamento' : 'Modo Foco: Sessão de Treino'}
                                </strong>
                                {activeSession && (
                                    <span style={{ 
                                        background: 'var(--text-main)', 
                                        color: 'var(--bg-main)', 
                                        padding: '2px 8px', 
                                        borderRadius: '6px', 
                                        fontSize: '0.8rem', 
                                        fontWeight: '800',
                                        fontFamily: 'monospace'
                                    }}>
                                        <span dangerouslySetInnerHTML={{ __html: svgClock }} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '4px' }}></span>{formatElapsed(sessionElapsed)}
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                {activeSession 
                                    ? `${activeSession.sets} ${activeSession.sets === 1 ? 'série concluída' : 'séries concluídas'} • ${activeSession.volume} kg totais • +${activeSession.xpGained} XP`
                                    : 'Inicie uma sessão para agrupar suas séries de hoje e acompanhar o tempo.'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {activeSession ? (
                            <button 
                                className="btn-secondary" 
                                style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'auto', borderColor: '#ef4444', color: '#ef4444' }}
                                onClick={endSession}
                            >
                                <span dangerouslySetInnerHTML={{ __html: svgStop }} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '4px' }}></span> Finalizar Sessão
                            </button>
                        ) : (
                            <button 
                                className="btn-primary" 
                                style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={startSession}
                            >
                                <span dangerouslySetInnerHTML={{ __html: svgPlay }}></span> Iniciar Sessão de Hoje
                            </button>
                        )}
                    </div>
                </div>

                {/* CONTROLES DO CRONÔMETRO DE DESCANSO (1) */}
                <div style={{ 
                    borderTop: '1px solid var(--border)', 
                    paddingTop: '12px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    gap: '10px' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span dangerouslySetInnerHTML={{ __html: svgClock }}></span> Descanso entre séries:
                        </span>
                        {restTimer && restTimer.active ? (
                            <span style={{ 
                                background: 'var(--text-main)', 
                                color: 'var(--bg-main)', 
                                padding: '2px 8px', 
                                borderRadius: '6px', 
                                fontSize: '0.85rem', 
                                fontWeight: '800' 
                            }}>
                                {Math.floor(restTimer.secondsLeft / 60)}:{String(restTimer.secondsLeft % 60).padStart(2, '0')}
                            </span>
                        ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pronto para iniciar</span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto', borderRadius: '6px' }}
                            onClick={() => startRestTimer(45)}
                        >
                            45s
                        </button>
                        <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto', borderRadius: '6px' }}
                            onClick={() => startRestTimer(60)}
                        >
                            60s
                        </button>
                        <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto', borderRadius: '6px' }}
                            onClick={() => startRestTimer(90)}
                        >
                            90s
                        </button>
                        <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto', borderRadius: '6px' }}
                            onClick={() => startRestTimer(120)}
                        >
                            120s
                        </button>
                        {restTimer && restTimer.active && (
                            <button 
                                className="btn-secondary" 
                                style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto', borderRadius: '6px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                onClick={stopRestTimer}
                            >
                                Parar
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="library-tools">
                <h2 className="section-title" style={{ marginBottom: 0 }}>
                    {selectedGroup ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button 
                                className="btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }} 
                                onClick={() => setSelectedGroup(null)}
                            >
                                <span dangerouslySetInnerHTML={{ __html: svgBack }}></span> Voltar
                            </button>
                            <span>{selectedGroup.group}</span>
                        </div>
                    ) : (
                        "Biblioteca de Treinos"
                    )}
                </h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: '8px 14px', fontSize: '0.8rem', width: 'auto', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', background: '#d4af37', color: '#000', fontWeight: '800' }}
                        onClick={() => setShowCustomModal(true)}
                    >
                        <span dangerouslySetInnerHTML={{ __html: svgPlus }}></span> Criar Meu Exercício
                    </button>
                    <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.8rem', width: 'auto', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#38bdf8', color: '#38bdf8', fontWeight: '800' }}
                        onClick={() => setShowCalcModal(true)}
                    >
                        <Icon svg={svgCalculator} size={16} color="#38bdf8" /> Calculadora de Anilhas
                    </button>
                    <div className="search-input-container" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <span className="search-icon" style={{ position: 'absolute', left: '10px', display: 'flex', alignItems: 'center' }}><Icon svg={svgSearch} color="var(--text-muted)" size={14} /></span>
                        <input 
                            type="text" 
                            placeholder="Buscar exercício ou grupo..." 
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ABAS DE ROTINA RÁPIDA E FAVORITOS */}
            <div className="routine-filters" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
                <button 
                    className={`btn-secondary ${routineFilter === 'ALL' ? 'active' : ''}`} 
                    style={{ padding: '8px 16px', fontSize: '0.8rem', width: 'auto', borderRadius: '10px', background: routineFilter === 'ALL' ? 'var(--text-main)' : 'var(--bg-card)', color: routineFilter === 'ALL' ? 'var(--bg-main)' : 'var(--text-main)', fontWeight: '700', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}
                    onClick={() => { setRoutineFilter('ALL'); setSelectedGroup(null); }}
                >
                    <span dangerouslySetInnerHTML={{ __html: svgDumbbell }}></span> Todos os Grupos
                </button>
                <button 
                    className={`btn-secondary ${routineFilter === 'FAV' ? 'active' : ''}`} 
                    style={{ padding: '8px 16px', fontSize: '0.8rem', width: 'auto', borderRadius: '10px', background: routineFilter === 'FAV' ? '#d4af37' : 'var(--bg-card)', color: routineFilter === 'FAV' ? '#000' : '#d4af37', fontWeight: '700', borderColor: '#d4af37', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}
                    onClick={() => { setRoutineFilter('FAV'); setSelectedGroup(null); }}
                >
                    <span dangerouslySetInnerHTML={{ __html: svgStar }}></span> Meus Favoritos ({favorites.length})
                </button>
                {allRoutines.map(rot => {
                    const isSel = routineFilter === rot.id;
                    return (
                        <button
                            key={rot.id}
                            className={`btn-secondary ${isSel ? 'active' : ''}`}
                            style={{ 
                                padding: '8px 16px', 
                                fontSize: '0.8rem', 
                                width: 'auto', 
                                borderRadius: '10px', 
                                background: isSel ? (rot.color || 'var(--text-main)') : 'var(--bg-card)', 
                                color: isSel ? '#000' : 'var(--text-main)', 
                                fontWeight: '700', 
                                borderColor: isSel ? rot.color : 'var(--border)',
                                whiteSpace: 'nowrap', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                boxShadow: isSel ? `0 0 14px ${rot.color || '#fff'}40` : 'none',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => { setRoutineFilter(rot.id); setSelectedGroup(null); }}
                        >
                            {rot.dotClass ? (
                                <span className={`routine-badge-dot ${rot.dotClass}`}></span>
                            ) : (
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: rot.color || '#863bff', display: 'inline-block' }}></span>
                            )}
                            {rot.name}
                        </button>
                    );
                })}
                <button 
                    type="button"
                    className="btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '0.8rem', width: 'auto', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(134,59,255,0.2), rgba(212,175,55,0.15))', color: '#d4af37', fontWeight: '800', borderColor: '#d4af37', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onClick={() => setShowCreateRoutineModal(true)}
                >
                    <Icon svg={svgPlus} size={14} color="#d4af37" /> Criar Meu Treino
                </button>
            </div>
            
            {routineFilter !== 'ALL' && routineFilter !== 'FAV' && (() => {
                const activeRot = allRoutines.find(r => r.id === routineFilter) || { name: `Treino ${routineFilter}`, color: '#d4af37' };
                const routineExercisesCount = (selectedGroup ? (selectedGroup.items || []) : filteredGroups.flatMap(g => g.items || [])).filter(Boolean).length;
                return (
                    <div className="routine-banner" style={{
                        background: `linear-gradient(135deg, ${activeRot.color || '#d4af37'}18, rgba(20,20,30,0.8))`,
                        border: `1px solid ${activeRot.color || '#d4af37'}66`,
                        borderRadius: '16px',
                        padding: '20px 24px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: `${activeRot.color || '#d4af37'}33`,
                                border: `2px solid ${activeRot.color || '#d4af37'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: activeRot.color || '#d4af37'
                            }}>
                                <Icon svg={svgDumbbell} size={24} color={activeRot.color || '#d4af37'} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {activeRot.name}
                                    {activeRot.isCustom && (
                                        <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-muted)' }}>Personalizado</span>
                                    )}
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {routineExercisesCount} exercícios vinculados a esta ficha de treino.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setShowAddExerciseModal(true)}
                                style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#10b981', color: '#000', fontWeight: '800', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', cursor: 'pointer' }}
                            >
                                <Icon svg={svgPlus} size={16} color="#000" /> Adicionar Exercícios
                            </button>
                            {activeRot.isCustom && (
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        if (window.confirm(`Tem certeza que deseja excluir a rotina "${activeRot.name}"? Os exercícios retornarão às categorias padrão.`)) {
                                            const remaining = (userData?.customRoutines || []).filter(r => r.id !== activeRot.id);
                                            syncData({ customRoutines: remaining });
                                            setRoutineFilter('ALL');
                                            showNotification("Rotina excluída.", "info");
                                        }
                                    }}
                                    style={{ padding: '8px 12px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Excluir Rotina
                                </button>
                            )}
                        </div>
                    </div>
                );
            })()}
            
            <div id="exercise-library" className="exercise-library">
                {!selectedGroup && routineFilter === 'ALL' ? (
                    <div className="exercise-card-grid">
                        {filteredGroups.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                                Nenhum exercício encontrado para "{searchTerm}".
                            </p>
                        ) : (
                            filteredGroups.map(group => (
                                <div className="exercise-card" key={group.group} onClick={() => {
                                    if (searchTerm.trim() && group.items.length === 1) {
                                        openModal(group.items[0]);
                                    } else {
                                        setSelectedGroup(group);
                                    }
                                }}>
                                    <img src={group.items[0]?.img} alt={group.group} className="exercise-card-img" style={{ height: '140px' }} />
                                    <div className="exercise-card-info" style={{ alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)' }}>
                                        <span className="exercise-card-name" style={{ fontSize: '1.15rem', marginBottom: '2px', color: 'var(--text-main)' }}>
                                            {group.group}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {group.items.length} exercícios
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="exercise-card-grid">
                        {(selectedGroup ? (selectedGroup.items || []) : filteredGroups.flatMap(g => g.items || [])).filter(Boolean).length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                                {routineFilter === 'FAV' ? 'Nenhum exercício favoritado ainda. Clique na estrela para salvá-los aqui!' : 'Nenhum exercício encontrado.'}
                            </p>
                        ) : (
                            (selectedGroup ? (selectedGroup.items || []) : filteredGroups.flatMap(g => g.items || [])).filter(Boolean).map(ex => {
                                const exSets = (userData?.feed || []).filter(i => i && typeof i === 'object' && i.exerciseId === ex.id);
                                const best1RM = exSets.length > 0 ? Math.max(...exSets.map(s => calculate1RM(s?.weight, s?.reps))) : 0;
                                const isFav = Array.isArray(favorites) && favorites.includes(ex.id);

                                return (
                                    <div className="exercise-card" key={ex.id} onClick={() => openModal(ex)} style={{ position: 'relative' }}>
                                        <button 
                                            type="button"
                                            onClick={(e) => toggleFavorite(e, ex.id)}
                                            title="Favoritar exercício"
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: 'rgba(0,0,0,0.6)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: isFav ? '#d4af37' : '#8e8e93',
                                                fontSize: '1rem',
                                                cursor: 'pointer',
                                                zIndex: 2,
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: svgStar }}></span>
                                        </button>
                                        <img src={ex.img} alt={ex.name} className="exercise-card-img" />
                                        <div className="exercise-card-info" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <span className="exercise-card-name" style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>{ex.name}</span>
                                            
                                            {/* PÍLULAS E BADGES TÉCNICAS (PILLS) */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                                <span style={{ 
                                                    background: 'rgba(255, 255, 255, 0.05)', 
                                                    border: '1px solid var(--border)', 
                                                    color: 'var(--text-main)', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '6px', 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: '700',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    {(() => {
                                                        const rGroup = getExerciseRoutineGroup(ex, ex.id, userData?.routineMap);
                                                        const dotColor = rGroup === 'A' ? '#ef4444' : rGroup === 'B' ? '#3b82f6' : rGroup === 'C' ? '#10b981' : '#f59e0b';
                                                        return (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: dotColor }}></span>
                                                                Treino {rGroup}
                                                            </span>
                                                        );
                                                    })()}
                                                </span>
                                                {best1RM > 0 && (
                                                    <span style={{ 
                                                        background: 'rgba(212, 175, 55, 0.1)', 
                                                        border: '1px solid rgba(212, 175, 55, 0.3)', 
                                                        color: '#d4af37', 
                                                        padding: '2px 8px', 
                                                        borderRadius: '6px', 
                                                        fontSize: '0.7rem', 
                                                        fontWeight: '700',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                    <Icon svg={svgLightning} color="#d4af37" size={14} /> 1RM: {best1RM}kg
                                                    </span>
                                                )}
                                                {exSets.length > 0 && (
                                                    <span style={{ 
                                                        background: 'rgba(16, 185, 129, 0.08)', 
                                                        border: '1px solid rgba(16, 185, 129, 0.25)', 
                                                        color: '#10b981', 
                                                        padding: '2px 8px', 
                                                        borderRadius: '6px', 
                                                        fontWeight: '700',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <Icon svg={svgBox} color="#10b981" size={14} /> {exSets.length} {exSets.length === 1 ? 'série' : 'séries'}
                                                    </span>
                                                )}
                                            </div>

                                            <span className="exercise-card-desc" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                                                {ex.desc}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {selectedExercise && (
                <div id="exercise-modal" className="modal">
                    <div className="modal-content">
                        <button className="close-modal" onClick={closeModal}>×</button>
                        <h2 id="modal-title" style={{ fontSize: '1.35rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                            {selectedExercise.name}
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            {selectedExercise.desc}
                        </p>
                        <img src={selectedExercise.img} alt={selectedExercise.name} className="modal-img" />
                        
                        {/* SELETOR DE TREINO PERSONALIZADO */}
                        <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span dangerouslySetInnerHTML={{ __html: svgTarget }}></span> Em qual Ficha/Treino este exercício entra?</span>
                                <span style={{ fontSize: '0.7rem', color: '#d4af37' }}>Personalizável</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px' }}>
                                {allRoutines.map((rot) => {
                                    const currentRot = getExerciseRoutineGroup(selectedExercise, selectedExercise.id, userData?.routineMap);
                                    const isSel = currentRot === rot.id;
                                    return (
                                        <button
                                            key={rot.id}
                                            type="button"
                                            className="btn-secondary"
                                            style={{
                                                padding: '8px 6px',
                                                fontSize: '0.75rem',
                                                borderRadius: '8px',
                                                background: isSel ? (rot.color || 'var(--text-main)') : 'var(--bg-card)',
                                                color: isSel ? '#000' : 'var(--text-main)',
                                                fontWeight: isSel ? '700' : '500',
                                                borderColor: isSel ? (rot.color || 'var(--text-main)') : 'var(--border)',
                                                boxShadow: isSel ? `0 0 10px ${rot.color || '#fff'}40` : 'none',
                                                transition: 'all 0.15s ease'
                                            }}
                                            onClick={() => {
                                                const newMap = { ...(userData?.routineMap || {}), [selectedExercise.id]: rot.id };
                                                syncData({ routineMap: newMap });
                                                showNotification(`Atribuído a ${rot.name}!`, "info");
                                            }}
                                        >
                                            {rot.label || rot.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* MEMÓRIA DE TREINO DO EXERCÍCIO (2) */}
                        {(() => {
                            const history = getExerciseHistory(selectedExercise.id, selectedExercise.name, userData?.feed, 3);
                            if (history.length === 0) return null;
                            return (
                                <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span dangerouslySetInnerHTML={{ __html: svgTrending }}></span> Memória (Últimos Treinos)
                                        </span>
                                        <button 
                                            type="button"
                                            className="btn-secondary" 
                                            style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto', borderColor: '#d4af37', color: '#d4af37', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            onClick={() => {
                                                setWeight(history[0].weight.toString());
                                                setReps(history[0].reps.toString());
                                                showNotification(`Carga repetida: ${history[0].weight}kg × ${history[0].reps} reps`, 'info');
                                            }}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: svgLightning }}></span> Repetir ({history[0].weight}kg × {history[0].reps})
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {history.map((h, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: i < history.length - 1 ? '4px' : '0' }}>
                                                <span>{h.date}: <strong style={{ color: 'var(--text-main)' }}>{h.weight}kg × {h.reps} reps</strong></span>
                                                <span style={{ color: '#d4af37', fontWeight: '600' }}>1RM: ~{h.estimated1RM}kg</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* GRÁFICO DE PROGRESSÃO DE FORÇA (1) */}
                        {(() => {
                            const chartItems = (userData?.feed || []).filter(i => i && typeof i === 'object' && i.exerciseId === selectedExercise.id).slice(0, 7).reverse();
                            if (chartItems.length < 2) return null;
                            const maxW = Math.max(...chartItems.map(h => parseFloat(h.weight) || 0));
                            return (
                                <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span dangerouslySetInnerHTML={{ __html: svgTrending }}></span> Progressão de Carga (Últimos {chartItems.length} treinos)
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '80px', paddingTop: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '4px', gap: '8px' }}>
                                        {chartItems.map((item, idx) => {
                                            const wVal = parseFloat(item.weight) || 0;
                                            const hPercent = maxW > 0 ? Math.max(25, Math.round((wVal / maxW) * 100)) : 25;
                                            const isBest = wVal === maxW;
                                            return (
                                                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: isBest ? '#d4af37' : 'var(--text-main)' }}>{wVal}kg</span>
                                                    <div style={{ width: '100%', height: `${hPercent}%`, background: isBest ? '#d4af37' : 'var(--text-main)', borderRadius: '3px 3px 0 0', transition: 'height 0.3s ease' }} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        <span>Mais antigo</span>
                                        <span>Mais recente</span>
                                    </div>
                                </div>
                            );
                        })()}

                        <form id="workout-form" onSubmit={handleLogWorkout}>
                            <div className="input-group">
                                <label>Carga (kg)</label>
                                <input 
                                    type="number" 
                                    required 
                                    min="0" 
                                    step="0.5" 
                                    placeholder="0"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                                <div className="quick-increment-group">
                                    <button type="button" className="btn-quick" onClick={() => adjustWeight(-2.5)}>-2.5</button>
                                    <button type="button" className="btn-quick" onClick={() => adjustWeight(2.5)}>+2.5</button>
                                    <button type="button" className="btn-quick" onClick={() => adjustWeight(5)}>+5</button>
                                    <button type="button" className="btn-quick" onClick={() => adjustWeight(10)}>+10</button>
                                </div>
                                {/* MONTADOR DE ANILHAS DE BARRA (4) */}
                                {parseFloat(weight) > 20 && (
                                    <div style={{ marginTop: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        <span style={{ color: 'var(--text-main)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><span dangerouslySetInnerHTML={{ __html: svgDumbbell }}></span> Barra Olímpica (20kg):</span>
                                        <span>{calculatePlates(weight, 20).message}</span>
                                    </div>
                                )}
                            </div>
                            <div className="input-group">
                                <label>Repetições</label>
                                <input 
                                    type="number" 
                                    required 
                                    min="1" 
                                    placeholder="0"
                                    value={reps}
                                    onChange={(e) => setReps(e.target.value)}
                                />
                                <div className="quick-increment-group">
                                    <button type="button" className="btn-quick" onClick={() => setReps('8')}>8</button>
                                    <button type="button" className="btn-quick" onClick={() => setReps('10')}>10</button>
                                    <button type="button" className="btn-quick" onClick={() => setReps('12')}>12</button>
                                    <button type="button" className="btn-quick" onClick={() => adjustReps(1)}>+1</button>
                                </div>
                            </div>

                            {/* ESCALA DE INTENSIDADE E FALHA MUSCULAR RPE (3) */}
                            <div className="input-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>
                                    <span dangerouslySetInnerHTML={{ __html: svgFlame }}></span> Esforço e Intensidade (RPE)
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        style={{ padding: '8px 4px', fontSize: '0.75rem', borderRadius: '8px', background: rpe === 'LIGHT' ? 'var(--text-main)' : 'var(--bg-card)', color: rpe === 'LIGHT' ? 'var(--bg-main)' : 'var(--text-main)', fontWeight: '600', borderColor: rpe === 'LIGHT' ? 'var(--text-main)' : 'var(--border)' }}
                                        onClick={() => setRpe('LIGHT')}
                                    >
                                        Leve / Controle
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        style={{ padding: '8px 4px', fontSize: '0.75rem', borderRadius: '8px', background: rpe === 'NORMAL' ? 'var(--text-main)' : 'var(--bg-card)', color: rpe === 'NORMAL' ? 'var(--bg-main)' : 'var(--text-main)', fontWeight: '600', borderColor: rpe === 'NORMAL' ? 'var(--text-main)' : 'var(--border)' }}
                                        onClick={() => setRpe('NORMAL')}
                                    >
                                        Pesado (RPE 8-9)
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        style={{ padding: '8px 4px', fontSize: '0.75rem', borderRadius: '8px', background: rpe === 'FAIL' ? '#ef4444' : 'var(--bg-card)', color: rpe === 'FAIL' ? '#fff' : '#ef4444', fontWeight: '700', borderColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                        onClick={() => setRpe('FAIL')}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: svgFlame }}></span> Falha (+2 XP)
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
                                Registrar Série
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL CRIAR EXERCÍCIO PERSONALIZADO */}
            {showCustomModal && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '420px' }}>
                        <button className="close-modal" onClick={() => setShowCustomModal(false)}>×</button>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span dangerouslySetInnerHTML={{ __html: svgBiceps }}></span> Criar Novo Exercício
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Adicione um exercício próprio e escolha em qual ficha de treino ele deve aparecer.
                        </p>
                        <form onSubmit={handleCreateCustomExercise}>
                            <div className="input-group">
                                <label>Nome do Exercício</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="Ex: Remada Articulada Pegada Aberta" 
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>Grupo Muscular</label>
                                <select 
                                    className="search-input"
                                    style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    value={customGroup}
                                    onChange={(e) => setCustomGroup(e.target.value)}
                                >
                                    <option value="Peito">Peito</option>
                                    <option value="Costas">Costas</option>
                                    <option value="Pernas">Pernas</option>
                                    <option value="Ombros">Ombros</option>
                                    <option value="Bíceps">Bíceps</option>
                                    <option value="Tríceps">Tríceps</option>
                                    <option value="Abdômen">Abdômen</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Ficha / Treino Padrão</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '6px' }}>
                                    {allRoutines.map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className="btn-secondary"
                                            style={{
                                                padding: '8px 6px',
                                                fontSize: '0.75rem',
                                                borderRadius: '8px',
                                                background: customRoutine === item.id ? (item.color || 'var(--text-main)') : 'var(--bg-card)',
                                                color: customRoutine === item.id ? '#000' : 'var(--text-main)',
                                                fontWeight: customRoutine === item.id ? '700' : '500',
                                                borderColor: customRoutine === item.id ? (item.color || 'var(--text-main)') : 'var(--border)'
                                            }}
                                            onClick={() => setCustomRoutine(item.id)}
                                        >
                                            {item.label || item.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ marginTop: '20px', background: '#d4af37', color: '#000', fontWeight: '800' }}>
                                Salvar e Adicionar ao Treino
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CRIAR NOVO TREINO / ROTINA */}
            {showCreateRoutineModal && (
                <div className="modal-overlay active" onClick={() => setShowCreateRoutineModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(20, 20, 25, 0.98) 100%)', border: '1px solid #d4af37', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icon svg={svgDumbbell} size={20} color="#d4af37" /> Criar Meu Treino
                            </h3>
                            <button type="button" className="btn-close" onClick={() => setShowCreateRoutineModal(false)}>✕</button>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.4 }}>
                            Crie uma ficha de treino exclusiva com as cores e nomes da sua preferência para organizar sua semana.
                        </p>
                        <form onSubmit={handleCreateRoutine}>
                            <div className="input-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Nome do Treino / Rotina</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="Ex: Treino E (Glúteos), Sábado Pesado, Braço Insano..." 
                                    value={newRoutineName}
                                    onChange={(e) => setNewRoutineName(e.target.value)}
                                    style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600' }}
                                />
                            </div>
                            <div className="input-group" style={{ marginTop: '16px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Cor do Treino (Destaque visual)</label>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {[
                                        { color: '#ef4444', name: 'Vermelho' },
                                        { color: '#3b82f6', name: 'Azul' },
                                        { color: '#10b981', name: 'Verde' },
                                        { color: '#f59e0b', name: 'Laranja' },
                                        { color: '#d4af37', name: 'Dourado' },
                                        { color: '#863bff', name: 'Roxo' },
                                        { color: '#ec4899', name: 'Rosa' },
                                        { color: '#06b6d4', name: 'Ciano' }
                                    ].map(c => (
                                        <button
                                            key={c.color}
                                            type="button"
                                            onClick={() => setNewRoutineColor(c.color)}
                                            style={{
                                                width: '34px',
                                                height: '34px',
                                                borderRadius: '50%',
                                                background: c.color,
                                                border: newRoutineColor === c.color ? '3px solid #fff' : '2px solid transparent',
                                                cursor: 'pointer',
                                                boxShadow: newRoutineColor === c.color ? `0 0 12px ${c.color}` : 'none',
                                                transition: 'transform 0.15s ease',
                                                transform: newRoutineColor === c.color ? 'scale(1.15)' : 'scale(1)'
                                            }}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '24px', padding: '14px', background: 'linear-gradient(135deg, #d4af37, #b8860b)', color: '#000', fontWeight: '800', fontSize: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)' }}>
                                Criar e Acessar Ficha de Treino
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE ADICIONAR EXERCÍCIOS AO TREINO ATUAL */}
            {showAddExerciseModal && (() => {
                const activeRot = allRoutines.find(r => r.id === routineFilter) || { name: `Treino ${routineFilter}`, color: '#d4af37', id: routineFilter };
                const allExercisesList = (allExercisesDB || []).flatMap(g => g.items || []).filter(Boolean);
                const filteredList = addExerciseSearch ? allExercisesList.filter(ex => (ex.name || '').toLowerCase().includes(addExerciseSearch.toLowerCase()) || (ex.group || '').toLowerCase().includes(addExerciseSearch.toLowerCase())) : allExercisesList;

                return (
                    <div className="modal-overlay active" onClick={() => setShowAddExerciseModal(false)}>
                        <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(20, 20, 25, 0.98) 100%)', border: `1px solid ${activeRot.color || '#d4af37'}`, borderRadius: '20px', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexShrink: 0 }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: activeRot.color || '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Icon svg={svgDumbbell} size={20} color={activeRot.color || '#d4af37'} /> Adicionar a: {activeRot.name}
                                </h3>
                                <button type="button" className="btn-close" onClick={() => setShowAddExerciseModal(false)}>✕</button>
                            </div>
                            <div style={{ marginBottom: '16px', flexShrink: 0 }}>
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou músculo (ex: supino, peito...)"
                                    value={addExerciseSearch}
                                    onChange={(e) => setAddExerciseSearch(e.target.value)}
                                    className="search-input"
                                    style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '10px' }}
                                />
                            </div>
                            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '6px' }}>
                                {filteredList.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Nenhum exercício encontrado.</p>
                                ) : (
                                    filteredList.map(ex => {
                                        const currentRotId = getExerciseRoutineGroup(ex, ex.id, userData?.routineMap);
                                        const isIncluded = currentRotId === activeRot.id;
                                        const currentRotObj = allRoutines.find(r => r.id === currentRotId);

                                        return (
                                            <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: isIncluded ? `${activeRot.color || '#10b981'}15` : 'var(--bg-main)', border: `1px solid ${isIncluded ? activeRot.color : 'var(--border)'}`, borderRadius: '12px', gap: '12px', transition: 'all 0.15s ease' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                                    <img src={ex.img} alt={ex.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', background: '#000', flexShrink: 0 }} />
                                                    <div style={{ overflow: 'hidden' }}>
                                                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.group} {currentRotObj && !isIncluded && `• Atual: ${currentRotObj.label || currentRotObj.name}`}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newMap = { ...(userData?.routineMap || {}) };
                                                        if (isIncluded) {
                                                            delete newMap[ex.id];
                                                        } else {
                                                            newMap[ex.id] = activeRot.id;
                                                        }
                                                        syncData({ routineMap: newMap });
                                                    }}
                                                    style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '800',
                                                        background: isIncluded ? (activeRot.color || '#10b981') : 'var(--bg-card)',
                                                        color: isIncluded ? '#000' : 'var(--text-main)',
                                                        border: `1px solid ${isIncluded ? activeRot.color : 'var(--border)'}`,
                                                        cursor: 'pointer',
                                                        flexShrink: 0,
                                                        transition: 'all 0.15s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    {isIncluded ? '✓ Adicionado' : '+ Adicionar'}
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', textAlign: 'right', flexShrink: 0 }}>
                                <button type="button" className="btn-primary" onClick={() => setShowAddExerciseModal(false)} style={{ padding: '10px 24px', width: 'auto', background: activeRot.color || '#d4af37', color: '#000', fontWeight: '800', borderRadius: '10px' }}>
                                    Concluir e Ver Ficha
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* MODAL CALCULADORA DE ANILHAS */}
            {showCalcModal && (() => {
                const total = parseFloat(calcWeight) || 0;
                const calcResult = calculatePlates(total, calcBar);
                return (
                    <div className="modal-overlay" onClick={() => setShowCalcModal(false)} style={{ zIndex: 9999 }}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                        <Icon svg={svgCalculator} size={20} color="#38bdf8" />
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Calculadora de Anilhas</h3>
                                </div>
                                <button type="button" onClick={() => setShowCalcModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Carga Total (kg)</label>
                                    <input 
                                        type="number" 
                                        value={calcWeight} 
                                        onChange={e => setCalcWeight(e.target.value)} 
                                        style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '800', textAlign: 'center' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Peso da Barra (kg)</label>
                                    <select 
                                        value={calcBar} 
                                        onChange={e => setCalcBar(Number(e.target.value))}
                                        style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '800', textAlign: 'center' }}
                                    >
                                        <option value={20}>20 kg (Olímpica)</option>
                                        <option value={15}>15 kg (Feminina)</option>
                                        <option value={12}>12 kg (W-Bar/EZ)</option>
                                        <option value={10}>10 kg (Padrão)</option>
                                        <option value={0}>0 kg (Apenas Anilhas)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Para cada lado da barra coloque:</span>
                                <strong style={{ fontSize: '1.8rem', color: '#38bdf8', fontWeight: '800', display: 'block', margin: '4px 0' }}>
                                    {calcResult.perSide} kg
                                </strong>
                                {calcResult.remainder > 0 && (
                                    <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Falta distribuir: {calcResult.remainder} kg por lado (sem anilhas compatíveis)</span>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>Anilhas por lado:</strong>
                                {calcResult.plates.length > 0 ? (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {calcResult.plates.map((p, idx) => (
                                            <div key={idx} style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', padding: '8px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>{p.count}x</strong>
                                                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '700' }}>{p.weight} kg</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma anilha necessária para esta carga.</span>
                                )}
                            </div>

                            <button type="button" className="btn-primary" onClick={() => setShowCalcModal(false)} style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#000', fontWeight: '800', borderRadius: '10px' }}>
                                Fechar Calculadora
                            </button>
                        </div>
                    </div>
                );
            })()}
        </section>
    );
};

export default Library;
