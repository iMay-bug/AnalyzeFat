import React, { useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getCurrentRankInfo, svgTrophy, svgFlame, svgCalendar, svgTrending, svgScale, svgLock, svgCheck, svgAlert, getConsistencyStats, getUnlockedBadges, getWeeklyMuscleBalance, getWeeklyTonnage, getRelativeStrengthStatus, getHypertrophyZoneInfo, generateWorkoutSummary, getMonthlyVolumeTimeline } from '../data';
import Icon from './Icon';

const Profile = ({ onLogout }) => {
    const { userData, syncData, showNotification, activeSession, sessionElapsed } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    const xp = userData?.xp || 0;
    const { currentRank } = getCurrentRankInfo(xp);
    const currentRankName = currentRank ? currentRank.name : "Bronze";

    const consistency = getConsistencyStats(userData?.feed);
    const badges = getUnlockedBadges(userData);
    const balance = getWeeklyMuscleBalance(userData?.feed);
    const tonnage = getWeeklyTonnage(userData?.feed);
    const relativeLifts = getRelativeStrengthStatus(userData?.feed, userData?.bodyWeight || 75);
    const monthlyTimeline = getMonthlyVolumeTimeline(userData?.feed);

    const defaultProfileSVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='8' r='5'/%3E%3Cpath d='M20 21a8 8 0 1 0-16 0'/%3E%3C/svg%3E";

    const handleNameChange = (e) => {
        syncData({ profileName: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 200;
                    const MAX_HEIGHT = 200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    syncData({ profileImg: dataUrl });
                    showNotification("Foto de perfil atualizada com sucesso!", "success");
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const totalPRs = Object.keys(userData?.prs || {}).length;

    const handleCopySummary = () => {
        const text = generateWorkoutSummary(userData, activeSession, sessionElapsed);
        navigator.clipboard.writeText(text);
        showNotification("📋 Resumo copiado! Prontinho para colar no WhatsApp/Instagram 🚀", "success");
    };

    return (
        <section id="view-profile" className="view-section active">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Perfil do Atleta</h2>
                <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={handleCopySummary}
                    style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'auto', borderRadius: '8px', borderColor: '#10b981', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    📋 Copiar Resumo para WhatsApp
                </button>
            </div>
            
            <div className="profile-header">
                <div 
                    className="profile-pic-container" 
                    onClick={() => fileInputRef.current.click()}
                    title="Clique para alterar a foto"
                >
                    <img 
                        id="profile-img" 
                        src={userData?.profileImg || defaultProfileSVG} 
                        alt="Profile" 
                    />
                    <div className="profile-upload-btn" title="Alterar foto">
                        📷
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                    />
                </div>
                <div className="profile-info">
                    <input 
                        type="text" 
                        id="profile-name" 
                        className="profile-name-input" 
                        value={userData?.profileName || "Guerreiro do Ferro"} 
                        onChange={handleNameChange}
                        title="Clique para editar seu nome"
                    />
                    <span className="profile-rank" id="profile-rank" style={{ color: currentRank?.color }}>{currentRankName}</span>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Treinos Concluídos</div>
                    <div className="stat-val" id="profile-workouts">{userData?.workouts || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Experiência (XP)</div>
                    <div className="stat-val" id="profile-xp">{xp}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Recordes (PRs)</div>
                    <div className="stat-val" id="profile-prs">{totalPRs}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Sequência Atual</div>
                    <div className="stat-val" style={{ color: consistency.streak > 0 ? 'var(--text-main)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon svg={svgFlame} color="#d4af37" size={20} /> {consistency.streak} <span style={{ fontSize: '0.8rem', fontWeight: '400' }}>dias</span>
                    </div>
                </div>
            </div>

            <div className="relative-strength-section" style={{ marginTop: '32px', background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon svg={svgScale} color="#d4af37" size={18} /> Padrão Esportivo de Força Relativa
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            Classificação de elite baseada em: Carga Máxima ÷ Peso Corporal
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', margin: 0 }}>Seu Peso:</label>
                        <input 
                            type="number" 
                            min="30" 
                            max="250" 
                            value={userData?.bodyWeight || 75} 
                            onChange={(e) => syncData({ bodyWeight: parseFloat(e.target.value) || 75 })}
                            style={{ width: '60px', background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: '700', fontSize: '0.95rem', textAlign: 'right', outline: 'none' }}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kg</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {relativeLifts.map((l, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{l.name}</span>
                                <span style={{ fontSize: '0.75rem', color: l.color, fontWeight: '800', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '6px', border: `1px solid ${l.color}` }}>{l.level}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{l.weight > 0 ? `${l.weight} kg` : '---'}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{l.ratio > 0 ? `${l.ratio}x peso` : 'Sem dados'}</span>
                            </div>
                            {/* REGUA / BARRA DE NÍVEL VISUAL */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                                    <div style={{ width: `${Math.min(100, (l.ratio / 2.0) * 100)}%`, background: l.color, transition: 'width 0.4s ease' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                    <span>Iniciante</span>
                                    <span>Intermediário</span>
                                    <span>Avançado</span>
                                    <span>Elite</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="consistency-section" style={{ marginTop: '32px', background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon svg={svgCalendar} color="#d4af37" size={18} /> Matriz de Consistência (Últimos 60 dias)
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            O hábito supera a motivação • {consistency.streak} {consistency.streak === 1 ? 'dia seguido' : 'dias seguidos'} de foco
                        </p>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', background: 'var(--bg-main)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon svg={svgFlame} color="#d4af37" size={14} /> {consistency.thisWeekCount} treinos esta semana
                    </span>
                </div>
                <div className="consistency-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(20, 1fr)', 
                    gap: '5px' 
                }}>
                    {(consistency.last60Days || consistency.last30Days).map((day, idx) => {
                        let bg = 'rgba(255, 255, 255, 0.04)';
                        let border = 'var(--border)';
                        if (day.count >= 10) {
                            bg = '#d4af37';
                            border = '#d4af37';
                        } else if (day.count >= 5) {
                            bg = '#a1a1aa';
                            border = '#a1a1aa';
                        } else if (day.hasWorkout) {
                            bg = '#52525b';
                            border = '#71717a';
                        }
                        return (
                            <div 
                                key={idx} 
                                className="day-square"
                                title={`${day.dayLabel}: ${day.count > 0 ? `${day.count} séries registradas` : 'Sem treino'}`}
                                style={{
                                    aspectRatio: '1',
                                    borderRadius: '3px',
                                    background: bg,
                                    border: `1px solid ${border}`,
                                    transition: 'all 0.15s ease'
                                }}
                            />
                        );
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '10px' }}>
                    <span>60 dias atrás</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Menos</span>
                        <div style={{ width: '10px', height: '10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)', borderRadius: '2px' }} />
                        <div style={{ width: '10px', height: '10px', background: '#52525b', borderRadius: '2px' }} />
                        <div style={{ width: '10px', height: '10px', background: '#a1a1aa', borderRadius: '2px' }} />
                        <div style={{ width: '10px', height: '10px', background: '#d4af37', borderRadius: '2px' }} />
                        <span>Mais</span>
                    </div>
                    <span>Hoje</span>
                </div>
            </div>

            {/* LINHA DO TEMPO DA FORÇA (EVOLUÇÃO MENSAL DE VOLUME) */}
            <div style={{ marginTop: '32px', background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon svg={svgTrending} color="#d4af37" size={18} /> Linha do Tempo da Força (Evolução de Volume)
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            Volume total levantado nas últimas 4 semanas
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {monthlyTimeline.map((w, idx) => (
                        <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                <span style={{ color: 'var(--text-main)', fontWeight: w.isPeak ? '700' : '500' }}>
                                    {w.label} {w.isPeak && <span style={{ color: '#d4af37', fontSize: '0.7rem' }}>★ Pico</span>}
                                </span>
                                <span style={{ fontWeight: '700', color: w.isPeak ? '#d4af37' : 'var(--text-main)' }}>
                                    {w.totalKg.toLocaleString('pt-BR')} kg
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                <div style={{ 
                                    width: `${w.percentage}%`, 
                                    height: '100%', 
                                    background: w.isPeak ? '#d4af37' : 'var(--text-main)', 
                                    borderRadius: '4px',
                                    transition: 'width 0.4s ease'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="tonnage-challenge-section" style={{ marginTop: '32px', background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                            🎯 Desafio Semanal de Tonelagem
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            Levante 20.000 kg ao longo de 7 dias
                        </p>
                    </div>
                    {tonnage.isCompleted ? (
                        <span style={{ background: 'var(--text-main)', color: 'var(--bg-main)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                            🏆 META!
                        </span>
                    ) : (
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                            {tonnage.totalTonnage.toLocaleString('pt-BR')} / 20.000 kg
                        </span>
                    )}
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ 
                        width: `${Math.min(tonnage.percentage, 100)}%`, 
                        height: '100%', 
                        background: tonnage.isCompleted ? '#10b981' : 'var(--text-main)', 
                        borderRadius: '4px',
                        transition: 'width 0.4s ease' 
                    }} />
                </div>
            </div>

            <div className="muscle-balance-section" style={{ marginTop: '32px', background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                            Balanço Muscular & Farol de Hipertrofia
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            Distribuição das {balance.totalWeeklySets} séries registradas nos últimos 7 dias
                        </p>
                    </div>
                    {balance.hasNeglected && (
                        <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon svg={svgAlert} color="#ef4444" size={14} /> Simetria em Alerta
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {balance.balanceList.map(b => {
                        const zone = getHypertrophyZoneInfo(b.count);
                        return (
                            <div key={b.name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                                            {b.name} <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.75rem' }}>({b.desc})</span>
                                        </span>
                                        <span style={{ background: 'rgba(255,255,255,0.05)', color: zone.color, padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', border: `1px solid ${zone.color}` }}>
                                            {zone.label}
                                        </span>
                                    </div>
                                    <span style={{ fontWeight: '700', color: b.isNeglected ? '#ef4444' : 'var(--text-main)' }}>
                                        {b.percentage}% <span style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.75rem' }}>({b.count} {b.count === 1 ? 'série' : 'séries'})</span>
                                    </span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <div style={{ 
                                        width: `${b.percentage}%`, 
                                        height: '100%', 
                                        background: b.isNeglected ? '#ef4444' : b.color, 
                                        borderRadius: '4px',
                                        transition: 'width 0.4s ease'
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <h3 className="history-title" style={{ marginTop: '32px' }}>
                Insígnias e Conquistas ({badges.filter(b => b.unlocked).length}/{badges.length})
            </h3>
            <div className="badges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                {badges.map((b) => (
                    <div 
                        key={b.id} 
                        className={`badge-card ${b.unlocked ? 'unlocked' : 'locked'}`}
                        style={{
                            background: 'var(--bg-card)',
                            border: `1px solid ${b.unlocked ? 'var(--border-hover)' : 'var(--border)'}`,
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            opacity: b.unlocked ? 1 : 0.45,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{ 
                            background: b.unlocked ? 'var(--bg-main)' : 'transparent',
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${b.unlocked ? 'var(--border)' : 'transparent'}`
                        }}>
                            <Icon svg={b.unlocked ? b.icon : svgLock} size={22} color={b.unlocked ? '#d4af37' : 'var(--text-muted)'} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{b.name}</strong>
                                {b.unlocked && <Icon svg={svgCheck} size={14} color="#10b981" />}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                                {b.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            
            <h3 className="history-title">Histórico de Séries Recentes</h3>
            <div id="feed-container" className="feed-container">
                {(userData?.feed || []).length === 0 ? (
                    <div style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '36px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', marginBottom: '4px' }}>
                            Nenhum treino registrado ainda.
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Vá até a aba Treinos e registre sua primeira série para ganhar XP.
                        </p>
                    </div>
                ) : (
                    (userData?.feed || []).map((item, index) => {
                        if (typeof item === 'string') {
                            return (
                                <div 
                                    key={index} 
                                    className="feed-item" 
                                    dangerouslySetInnerHTML={{ __html: item.replace('<div class="feed-item">', '').replace(/<\/div>$/, '') }}
                                />
                            );
                        }
                        
                        return (
                            <div key={item.id || index} className="feed-item">
                                <div>
                                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.name}</strong><br />
                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {item.weight}kg × {item.reps} reps {item.date ? `• ${item.date}` : ''}
                                    </small>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: '700' }}>
                                        +{item.xpGained} XP
                                    </strong>
                                    {item.isPR && (
                                        <div style={{ 
                                            color: '#eab308', fontSize: '0.75rem', display: 'flex', 
                                            alignItems: 'center', justifyContent: 'flex-end', gap: '4px', 
                                            marginTop: '2px', fontWeight: '600'
                                        }}>
                                            <Icon svg={svgTrophy} color="#eab308" size={14} /> PR
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <button 
                id="logout-btn" 
                className="btn-secondary" 
                style={{ width: '100%', marginTop: '32px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={onLogout}
            >
                Sair da Conta
            </button>
        </section>
    );
};

export default Profile;
