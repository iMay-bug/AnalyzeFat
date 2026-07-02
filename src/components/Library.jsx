import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { exercisesDB, formatElapsed, calculate1RM, getExerciseHistory, calculatePlates, getExerciseRoutineGroup, getWeeklyTonnage } from '../data';

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
        showNotification(`💪 Exercício "${customName}" criado e adicionado ao Treino ${customRoutine}!`, "success");
        setCustomName('');
        setShowCustomModal(false);
    };

    const favorites = useMemo(() => userData?.favorites || [], [userData?.favorites]);

    const allExercisesDB = useMemo(() => {
        const custom = userData?.customExercises || [];
        if (custom.length === 0) return exercisesDB;

        const customGrouped = {};
        custom.forEach(c => {
            if (!customGrouped[c.group]) customGrouped[c.group] = [];
            customGrouped[c.group].push(c);
        });

        return exercisesDB.map(group => {
            const extra = customGrouped[group.group] || [];
            return {
                ...group,
                items: [...group.items, ...extra]
            };
        });
    }, [userData?.customExercises]);

    const toggleFavorite = (e, exId) => {
        e.stopPropagation();
        const exists = favorites.includes(exId);
        const newFavs = exists ? favorites.filter(id => id !== exId) : [...favorites, exId];
        syncData({ favorites: newFavs });
        showNotification(exists ? "Removido dos favoritos." : "★ Adicionado aos favoritos!", "info");
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
            title: extraBonus > 0 ? "🏆 DESAFIO SEMANAL BATIDO!" : (isPR ? "NOVO RECORDE PESSOAL" : "SÉRIE CONCLUÍDA"),
            xpGained: xpGained,
            isPR: isPR || extraBonus > 0,
            exerciseName: `${selectedExercise.name} (${w}kg × ${r} reps)${extraBonus > 0 ? " • +50 XP Tonelagem" : ""}`
        });
        showNotification(extraBonus > 0 ? `🏆 Desafio Concluído! +${xpGained} XP registrado!` : `+${xpGained} XP registrado com sucesso.`, 'success');

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
        const term = searchTerm.trim().toLowerCase();
        return allExercisesDB.map(group => {
            const matchingItems = group.items.filter(ex => {
                const matchesTerm = !term || ex.name.toLowerCase().includes(term) || ex.desc.toLowerCase().includes(term);
                if (!matchesTerm) return false;
                if (routineFilter === 'FAV') return favorites.includes(ex.id);
                if (routineFilter !== 'ALL') return getExerciseRoutineGroup(ex, ex.id, userData?.routineMap) === routineFilter;
                return true;
            });
            if ((group.group.toLowerCase().includes(term) && routineFilter === 'ALL') || matchingItems.length > 0) {
                return {
                    ...group,
                    items: matchingItems.length > 0 ? matchingItems : (routineFilter === 'ALL' ? group.items : [])
                };
            }
            return null;
        }).filter(g => g && g.items.length > 0);
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
                        <span style={{ fontSize: '1.2rem' }}>{activeSession ? '🟢' : '⚡'}</span>
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
                                        ⏱️ {formatElapsed(sessionElapsed)}
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
                                ⏹️ Finalizar Sessão
                            </button>
                        ) : (
                            <button 
                                className="btn-primary" 
                                style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'auto' }}
                                onClick={startSession}
                            >
                                ▶️ Iniciar Sessão de Hoje
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
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                            ⏱️ Descanso entre séries:
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

                    <div style={{ display: 'flex', gap: '6px' }}>
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
                                style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto', borderRadius: '8px' }} 
                                onClick={() => setSelectedGroup(null)}
                            >
                                ← Voltar
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
                        ➕ Criar Meu Exercício
                    </button>
                    <div className="search-input-container">
                        <span className="search-icon">🔍</span>
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

            {/* ABAS DE ROTINA RÁPIDA E FAVORITOS (3) */}
            <div className="routine-filters" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
                <button 
                    className={`btn-secondary ${routineFilter === 'ALL' ? 'active' : ''}`} 
                    style={{ padding: '6px 14px', fontSize: '0.8rem', width: 'auto', borderRadius: '8px', background: routineFilter === 'ALL' ? 'var(--text-main)' : 'var(--bg-card)', color: routineFilter === 'ALL' ? 'var(--bg-main)' : 'var(--text-main)', fontWeight: '700', whiteSpace: 'nowrap' }}
                    onClick={() => { setRoutineFilter('ALL'); setSelectedGroup(null); }}
                >
                    🏋️ Todos os Grupos
                </button>
                <button 
                    className={`btn-secondary ${routineFilter === 'FAV' ? 'active' : ''}`} 
                    style={{ padding: '6px 14px', fontSize: '0.8rem', width: 'auto', borderRadius: '8px', background: routineFilter === 'FAV' ? '#d4af37' : 'var(--bg-card)', color: routineFilter === 'FAV' ? '#000' : '#d4af37', fontWeight: '700', borderColor: '#d4af37', whiteSpace: 'nowrap' }}
                    onClick={() => { setRoutineFilter('FAV'); setSelectedGroup(null); }}
                >
                    ★ Meus Favoritos ({favorites.length})
                </button>
                <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 14px', fontSize: '0.8rem', width: 'auto', borderRadius: '8px', background: routineFilter === 'A' ? 'var(--text-main)' : 'var(--bg-card)', color: routineFilter === 'A' ? 'var(--bg-main)' : 'var(--text-main)', fontWeight: '600', whiteSpace: 'nowrap' }}
                    onClick={() => { setRoutineFilter('A'); setSelectedGroup(null); }}
                >
                    🔴 Treino A (Peito/Tríceps)
                </button>
                <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 14px', fontSize: '0.8rem', width: 'auto', borderRadius: '8px', background: routineFilter === 'B' ? 'var(--text-main)' : 'var(--bg-card)', color: routineFilter === 'B' ? 'var(--bg-main)' : 'var(--text-main)', fontWeight: '600', whiteSpace: 'nowrap' }}
                    onClick={() => { setRoutineFilter('B'); setSelectedGroup(null); }}
                >
                    🔵 Treino B (Costas/Bíceps)
                </button>
                <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 14px', fontSize: '0.8rem', width: 'auto', borderRadius: '8px', background: routineFilter === 'C' ? 'var(--text-main)' : 'var(--bg-card)', color: routineFilter === 'C' ? 'var(--bg-main)' : 'var(--text-main)', fontWeight: '600', whiteSpace: 'nowrap' }}
                    onClick={() => { setRoutineFilter('C'); setSelectedGroup(null); }}
                >
                    🟢 Treino C (Pernas)
                </button>
                <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 14px', fontSize: '0.8rem', width: 'auto', borderRadius: '8px', background: routineFilter === 'D' ? 'var(--text-main)' : 'var(--bg-card)', color: routineFilter === 'D' ? 'var(--bg-main)' : 'var(--text-main)', fontWeight: '600', whiteSpace: 'nowrap' }}
                    onClick={() => { setRoutineFilter('D'); setSelectedGroup(null); }}
                >
                    🟡 Treino D (Ombros/Core)
                </button>
            </div>
            
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
                        {(selectedGroup ? selectedGroup.items : filteredGroups.flatMap(g => g.items)).length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                                {routineFilter === 'FAV' ? 'Nenhum exercício favoritado ainda. Clique na estrela ★ para salvá-los aqui!' : 'Nenhum exercício encontrado.'}
                            </p>
                        ) : (
                            (selectedGroup ? selectedGroup.items : filteredGroups.flatMap(g => g.items)).map(ex => {
                                const exSets = (userData?.feed || []).filter(i => i.exerciseId === ex.id);
                                const best1RM = exSets.length > 0 ? Math.max(...exSets.map(s => calculate1RM(s.weight, s.reps))) : 0;
                                const isFav = favorites.includes(ex.id);

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
                                            ★
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
                                                        return rGroup === 'A' ? '🔴 Treino A' : rGroup === 'B' ? '🔵 Treino B' : rGroup === 'C' ? '🟢 Treino C' : '🟡 Treino D';
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
                                                        ⚡ 1RM: {best1RM}kg
                                                    </span>
                                                )}
                                                {exSets.length > 0 && (
                                                    <span style={{ 
                                                        background: 'rgba(16, 185, 129, 0.08)', 
                                                        border: '1px solid rgba(16, 185, 129, 0.25)', 
                                                        color: '#10b981', 
                                                        padding: '2px 8px', 
                                                        borderRadius: '6px', 
                                                        fontSize: '0.7rem', 
                                                        fontWeight: '700'
                                                    }}>
                                                        📦 {exSets.length} {exSets.length === 1 ? 'série' : 'séries'}
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
                                <span>🎯 Em qual Ficha/Treino este exercício entra?</span>
                                <span style={{ fontSize: '0.7rem', color: '#d4af37' }}>Personalizável</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                {['A', 'B', 'C', 'D'].map((rot) => {
                                    const labels = { A: '🔴 Treino A', B: '🔵 Treino B', C: '🟢 Treino C', D: '🟡 Treino D' };
                                    const currentRot = getExerciseRoutineGroup(selectedExercise, selectedExercise.id, userData?.routineMap);
                                    const isSel = currentRot === rot;
                                    return (
                                        <button
                                            key={rot}
                                            type="button"
                                            className="btn-secondary"
                                            style={{
                                                padding: '6px 4px',
                                                fontSize: '0.75rem',
                                                borderRadius: '6px',
                                                background: isSel ? 'var(--text-main)' : 'var(--bg-card)',
                                                color: isSel ? 'var(--bg-main)' : 'var(--text-main)',
                                                fontWeight: isSel ? '700' : '500',
                                                borderColor: isSel ? 'var(--text-main)' : 'var(--border)'
                                            }}
                                            onClick={() => {
                                                const newMap = { ...(userData?.routineMap || {}), [selectedExercise.id]: rot };
                                                syncData({ routineMap: newMap });
                                                showNotification(`Atribuído ao Treino ${rot}!`, "info");
                                            }}
                                        >
                                            {labels[rot]}
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
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                            📈 Memória (Últimos Treinos)
                                        </span>
                                        <button 
                                            type="button"
                                            className="btn-secondary" 
                                            style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto', borderColor: '#d4af37', color: '#d4af37', borderRadius: '6px' }}
                                            onClick={() => {
                                                setWeight(history[0].weight.toString());
                                                setReps(history[0].reps.toString());
                                                showNotification(`⚡ Carga repetida: ${history[0].weight}kg × ${history[0].reps} reps`, 'info');
                                            }}
                                        >
                                            ⚡ Repetir ({history[0].weight}kg × {history[0].reps})
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
                                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '12px' }}>
                                        📊 Progressão de Carga (Últimos {chartItems.length} treinos)
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
                                        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>🏋️ Barra Olímpica (20kg):</span>
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
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>
                                    🔥 Esforço e Intensidade (RPE)
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        style={{ padding: '8px 4px', fontSize: '0.75rem', borderRadius: '8px', background: rpe === 'LIGHT' ? 'var(--text-main)' : 'var(--bg-card)', color: rpe === 'LIGHT' ? 'var(--bg-main)' : 'var(--text-main)', fontWeight: '600', borderColor: rpe === 'LIGHT' ? 'var(--text-main)' : 'var(--border)' }}
                                        onClick={() => setRpe('LIGHT')}
                                    >
                                        🟢 Leve / Controle
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        style={{ padding: '8px 4px', fontSize: '0.75rem', borderRadius: '8px', background: rpe === 'NORMAL' ? 'var(--text-main)' : 'var(--bg-card)', color: rpe === 'NORMAL' ? 'var(--bg-main)' : 'var(--text-main)', fontWeight: '600', borderColor: rpe === 'NORMAL' ? 'var(--text-main)' : 'var(--border)' }}
                                        onClick={() => setRpe('NORMAL')}
                                    >
                                        🟡 Pesado (RPE 8-9)
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        style={{ padding: '8px 4px', fontSize: '0.75rem', borderRadius: '8px', background: rpe === 'FAIL' ? '#ef4444' : 'var(--bg-card)', color: rpe === 'FAIL' ? '#fff' : '#ef4444', fontWeight: '700', borderColor: '#ef4444' }}
                                        onClick={() => setRpe('FAIL')}
                                    >
                                        🔥 Falha (+2 XP)
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
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                            💪 Criar Novo Exercício
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
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                    {[
                                        { id: 'A', label: '🔴 Treino A' },
                                        { id: 'B', label: '🔵 Treino B' },
                                        { id: 'C', label: '🟢 Treino C' },
                                        { id: 'D', label: '🟡 Treino D' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className="btn-secondary"
                                            style={{
                                                padding: '8px 4px',
                                                fontSize: '0.75rem',
                                                borderRadius: '6px',
                                                background: customRoutine === item.id ? 'var(--text-main)' : 'var(--bg-card)',
                                                color: customRoutine === item.id ? 'var(--bg-main)' : 'var(--text-main)',
                                                fontWeight: customRoutine === item.id ? '700' : '500',
                                                borderColor: customRoutine === item.id ? 'var(--text-main)' : 'var(--border)'
                                            }}
                                            onClick={() => setCustomRoutine(item.id)}
                                        >
                                            {item.label}
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
        </section>
    );
};

export default Library;
