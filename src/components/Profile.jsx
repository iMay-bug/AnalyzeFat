import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getCurrentRankInfo, svgTrophy, svgFlame, svgCalendar, svgTrending, svgScale, svgLock, svgCheck, svgAlert, svgStar, svgTarget, svgBox, svgCamera, getConsistencyStats, getUnlockedBadges, getWeeklyMuscleBalance, getWeeklyTonnage, getRelativeStrengthStatus, getHypertrophyZoneInfo, generateWorkoutSummary, getMonthlyVolumeTimeline, accentColorsDB, svgShare, svgRuler, svgPalette } from '../data';
import Icon from './Icon';
import AnimatedCounter from './AnimatedCounter';
import RankImage from './RankImage';

const Profile = ({ onLogout }) => {
    const { userData, syncData, showNotification, activeSession, sessionElapsed } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    const [showShareModal, setShowShareModal] = useState(false);
    const [showBodyModal, setShowBodyModal] = useState(false);
    const [showPaletteModal, setShowPaletteModal] = useState(false);
    const [bodyWeight, setBodyWeight] = useState(userData?.bodyWeight || 75);
    const [bodyArm, setBodyArm] = useState(userData?.bodyStats?.arm || '');
    const [bodyChest, setBodyChest] = useState(userData?.bodyStats?.chest || '');
    const [bodyWaist, setBodyWaist] = useState(userData?.bodyStats?.waist || '');
    const [bodyThigh, setBodyThigh] = useState(userData?.bodyStats?.thigh || '');

    const xp = userData?.xp || 0;
    const { currentRank } = getCurrentRankInfo(xp);
    const currentRankName = currentRank ? currentRank.name : "Bronze";

    const consistency = getConsistencyStats(userData?.feed);
    const badges = getUnlockedBadges(userData);
    const equippedBadge = userData?.equippedBadge ? badges.find(b => b.id === userData.equippedBadge && b.unlocked) : null;
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
            reader.onloadend = () => {
                syncData({ profileImg: reader.result });
                showNotification("Foto de perfil atualizada!", "success");
            };
            reader.readAsDataURL(file);
        }
    };

    const totalPRs = (userData?.feed || []).reduce((acc, s) => {
        return acc + (s.exercises || []).filter(ex => ex.isPR || ex.isVolumePR).length;
    }, 0);

    const handleCopySummary = () => {
        const summaryText = generateWorkoutSummary(userData?.feed || []);
        navigator.clipboard.writeText(summaryText);
        showNotification("Resumo copiado para a área de transferência! Prontinho para o WhatsApp 🏋️‍♂️", "success");
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
                    <span dangerouslySetInnerHTML={{ __html: svgBox }} style={{ display: 'inline-flex', alignItems: 'center' }}></span> Copiar Resumo para WhatsApp
                </button>
            </div>
            
            <div className="profile-header-card" style={{
                background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(20, 20, 25, 0.95) 100%)',
                border: `1px solid ${currentRank?.color || 'var(--border)'}`,
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap',
                boxShadow: `0 10px 30px -10px ${currentRank?.color ? currentRank.color + '33' : 'rgba(0,0,0,0.5)'}`,
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '28px'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '180px',
                    height: '180px',
                    background: currentRank?.color || '#d4af37',
                    opacity: 0.08,
                    filter: 'blur(50px)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }} />

                <div 
                    className="profile-pic-container" 
                    onClick={() => fileInputRef.current.click()}
                    title="Clique para alterar a foto"
                    style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        border: `3px solid ${currentRank?.color || '#d4af37'}`,
                        padding: '3px',
                        position: 'relative',
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: `0 0 20px ${currentRank?.color ? currentRank.color + '40' : 'rgba(212,175,55,0.2)'}`
                    }}
                >
                    <img 
                        id="profile-img" 
                        src={userData?.profileImg || defaultProfileSVG} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: 'var(--bg-main)' }}
                    />
                    <div className="profile-upload-btn" title="Alterar foto" dangerouslySetInnerHTML={{ __html: svgCamera }} style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-main)'
                    }}></div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                    />
                </div>
                
                <div className="profile-info" style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <input 
                            type="text" 
                            id="profile-name" 
                            className="profile-name-input" 
                            value={userData?.profileName || "Guerreiro do Ferro"} 
                            onChange={handleNameChange}
                            title="Clique para editar seu nome"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '1px dashed transparent',
                                color: 'var(--text-main)',
                                fontSize: '1.6rem',
                                fontWeight: '800',
                                width: 'auto',
                                outline: 'none',
                                padding: '2px 0'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span className="profile-rank" id="profile-rank" style={{ 
                            background: currentRank?.color ? `${currentRank.color}18` : 'rgba(255,255,255,0.05)',
                            color: currentRank?.color || '#fff',
                            border: `1px solid ${currentRank?.color || 'var(--border)'}`,
                            padding: '4px 14px 4px 6px',
                            borderRadius: '30px',
                            fontSize: '0.82rem',
                            fontWeight: '800',
                            letterSpacing: '0.5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: `0 0 15px ${currentRank?.color || '#fff'}20`
                        }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                border: `2px solid ${currentRank?.color || '#fff'}`,
                                padding: '1.5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--bg-main)',
                                flexShrink: 0,
                                overflow: 'hidden'
                            }}>
                                <RankImage rank={currentRank} size="100%" isUnlocked={true} />
                            </div>
                            PATENTE: {currentRankName.toUpperCase()}
                        </span>

                        {equippedBadge ? (
                            <span style={{ 
                                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))',
                                color: '#d4af37',
                                border: '1px solid rgba(212, 175, 55, 0.5)',
                                padding: '4px 14px 4px 6px',
                                borderRadius: '30px',
                                fontSize: '0.82rem',
                                fontWeight: '800',
                                letterSpacing: '0.5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 0 15px rgba(212, 175, 55, 0.2)'
                            }}>
                                <div style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    border: '2px solid #d4af37',
                                    padding: '1.5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--bg-main)',
                                    flexShrink: 0,
                                    overflow: 'hidden'
                                }}>
                                    <Icon svg={equippedBadge.icon} size={16} color="#d4af37" />
                                </div>
                                TÍTULO: {equippedBadge.name.toUpperCase()}
                            </span>
                        ) : (
                            <span style={{ 
                                background: 'var(--bg-main)',
                                color: 'var(--text-muted)',
                                border: '1px dashed var(--border)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                Nenhum título equipado
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* BARRA DE FERRAMENTAS VIP DO PERFIL */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: '#f59e0b',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)'
                    }}
                >
                    <Icon svg={svgShare} size={18} color="#f59e0b" /> Card para Stories
                </button>
                <button
                    type="button"
                    onClick={() => setShowBodyModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: '#10b981',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)'
                    }}
                >
                    <Icon svg={svgRuler} size={18} color="#10b981" /> Diário de Medidas
                </button>
                <button
                    type="button"
                    onClick={() => setShowPaletteModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05))',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: '#a855f7',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(168, 85, 247, 0.1)'
                    }}
                >
                    <Icon svg={svgPalette} size={18} color="#a855f7" /> Cores do App
                </button>
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '36px' }}>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--bg-card), rgba(20,20,30,0.8))', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', transition: 'transform 0.2s ease', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Treinos Concluídos</span>
                        <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon svg={svgCalendar} color="#10b981" size={18} />
                        </div>
                    </div>
                    <div className="stat-val" id="profile-workouts" style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1 }}><AnimatedCounter value={userData?.workouts || 0} /></div>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--bg-card), rgba(20,20,30,0.8))', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', transition: 'transform 0.2s ease', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Experiência Total</span>
                        <div style={{ background: 'rgba(134, 59, 255, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon svg={svgTrending} color="#863bff" size={18} />
                        </div>
                    </div>
                    <div className="stat-val" id="profile-xp" style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1 }}><AnimatedCounter value={xp} /> <span style={{ fontSize: '0.9rem', color: '#863bff', fontWeight: '800' }}>XP</span></div>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--bg-card), rgba(20,20,30,0.8))', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', transition: 'transform 0.2s ease', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recordes (PRs)</span>
                        <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon svg={svgTrophy} color="#d4af37" size={18} />
                        </div>
                    </div>
                    <div className="stat-val" id="profile-prs" style={{ fontSize: '2.2rem', fontWeight: '900', color: '#d4af37', lineHeight: 1 }}><AnimatedCounter value={totalPRs} /></div>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--bg-card), rgba(20,20,30,0.8))', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', transition: 'transform 0.2s ease', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sequência Ativa</span>
                        <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon svg={svgFlame} color="#f59e0b" size={18} />
                        </div>
                    </div>
                    <div className="stat-val" style={{ fontSize: '2.2rem', fontWeight: '900', color: consistency.streak > 0 ? '#f59e0b' : 'var(--text-muted)', display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1 }}>
                        <AnimatedCounter value={consistency.streak} /> <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)' }}>dias</span>
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
                        let cellClass = 'heatmap-cell-0';
                        if (day.count >= 8) {
                            cellClass = 'heatmap-cell-3';
                        } else if (day.count >= 4) {
                            cellClass = 'heatmap-cell-2';
                        } else if (day.hasWorkout || day.count >= 1) {
                            cellClass = 'heatmap-cell-1';
                        }
                        return (
                            <div 
                                key={idx} 
                                className={`day-square ${cellClass}`}
                                title={`${day.dayLabel}: ${day.count > 0 ? `${day.count} séries registradas` : 'Sem treino'}`}
                                style={{
                                    aspectRatio: '1',
                                    borderRadius: '3px',
                                    border: '1px solid var(--border)',
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
                        <div className="heatmap-cell-0" style={{ width: '10px', height: '10px', borderRadius: '2px', border: '1px solid var(--border)' }} />
                        <div className="heatmap-cell-1" style={{ width: '10px', height: '10px', borderRadius: '2px' }} />
                        <div className="heatmap-cell-2" style={{ width: '10px', height: '10px', borderRadius: '2px' }} />
                        <div className="heatmap-cell-3" style={{ width: '10px', height: '10px', borderRadius: '2px' }} />
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

                {/* GRÁFICO DE ÁREA SVG (CURVA DE FORÇA) */}
                {(() => {
                    const maxKg = Math.max(...monthlyTimeline.map(w => w.totalKg), 100);
                    const points = monthlyTimeline.map((w, i) => {
                        const x = i * 90 + 15;
                        const y = 65 - (w.totalKg / maxKg) * 50;
                        return { x, y, ...w };
                    });
                    const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');
                    const areaStr = `15,65 ${polylineStr} 285,65`;

                    return (
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 12px 6px', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                            <svg width="100%" height="80" viewBox="0 0 300 80" style={{ overflow: 'visible' }}>
                                <defs>
                                    <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.35" />
                                        <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                <line x1="15" y1="15" x2="285" y2="15" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                                <line x1="15" y1="40" x2="285" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                                <line x1="15" y1="65" x2="285" y2="65" stroke="rgba(255,255,255,0.1)" />
                                
                                <polygon points={areaStr} fill="url(#goldArea)" />
                                <polyline points={polylineStr} fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                
                                {points.map((p, idx) => (
                                    <g key={idx}>
                                        <circle cx={p.x} cy={p.y} r={p.isPeak ? 5 : 3.5} fill={p.isPeak ? '#d4af37' : '#fff'} stroke="#000" strokeWidth="1.5" />
                                        {p.isPeak && <circle cx={p.x} cy={p.y} r={9} fill="none" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.5" />}
                                    </g>
                                ))}
                            </svg>
                        </div>
                    );
                })()}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {monthlyTimeline.map((w, idx) => (
                        <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                <span style={{ color: 'var(--text-main)', fontWeight: w.isPeak ? '700' : '500' }}>
                                    {w.label} {w.isPeak && <span style={{ color: '#d4af37', fontSize: '0.7rem' }}><span dangerouslySetInnerHTML={{ __html: svgStar }} style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '2px' }}></span> Pico</span>}
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
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span dangerouslySetInnerHTML={{ __html: svgTarget }} style={{ display: 'inline-flex' }}></span> Desafio Semanal de Tonelagem
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            Levante 20.000 kg ao longo de 7 dias
                        </p>
                    </div>
                    {tonnage.isCompleted ? (
                        <span style={{ background: 'var(--text-main)', color: 'var(--bg-main)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span dangerouslySetInnerHTML={{ __html: svgTrophy }} style={{ display: 'inline-flex' }}></span> META!
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
            <div className="badges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', marginBottom: '32px' }}>
                {badges.map((b) => {
                    const isEquipped = userData?.equippedBadge === b.id;
                    return (
                        <div 
                            key={b.id} 
                            className={`badge-card ${b.unlocked ? 'unlocked' : 'locked'}`}
                            style={{
                                background: isEquipped ? 'linear-gradient(145deg, rgba(212, 175, 55, 0.12), rgba(15, 15, 20, 0.9))' : 'var(--bg-card)',
                                border: `1px solid ${isEquipped ? '#d4af37' : (b.unlocked ? 'var(--border-hover)' : 'var(--border)')}`,
                                borderRadius: '16px',
                                padding: '18px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px',
                                opacity: b.unlocked ? 1 : 0.45,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isEquipped ? '0 8px 25px rgba(212, 175, 55, 0.15)' : 'none',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                <div style={{ 
                                    background: b.unlocked ? (isEquipped ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-main)') : 'var(--bg-main)',
                                    width: '54px',
                                    height: '54px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `2.5px solid ${isEquipped ? '#d4af37' : (b.unlocked ? '#10b981' : 'var(--border)')}`,
                                    padding: '3px',
                                    flexShrink: 0,
                                    boxShadow: isEquipped ? '0 0 16px rgba(212, 175, 55, 0.3)' : (b.unlocked ? '0 0 10px rgba(16, 185, 129, 0.15)' : 'none'),
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: b.unlocked ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                                        <Icon svg={b.unlocked ? b.icon : svgLock} size={24} color={isEquipped ? '#d4af37' : (b.unlocked ? '#10b981' : 'var(--text-muted)')} />
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                        <strong style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: '800' }}>{b.name}</strong>
                                        {b.unlocked && <Icon svg={svgCheck} size={16} color="#10b981" />}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                                        {b.desc}
                                    </p>
                                </div>
                            </div>

                            {b.unlocked && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nextBadge = isEquipped ? null : b.id;
                                        syncData({ equippedBadge: nextBadge });
                                        showNotification(isEquipped ? "Título removido do perfil." : `Título "${b.name}" equipado com sucesso!`, "success");
                                    }}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '10px',
                                        fontSize: '0.78rem',
                                        fontWeight: '800',
                                        border: isEquipped ? '1px solid #d4af37' : '1px solid var(--border)',
                                        background: isEquipped ? 'linear-gradient(135deg, #d4af37, #b8860b)' : 'var(--bg-main)',
                                        color: isEquipped ? '#000' : 'var(--text-main)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        width: '100%',
                                        transition: 'all 0.2s ease',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    <Icon svg={isEquipped ? svgStar : svgTrophy} size={14} color={isEquipped ? '#000' : '#d4af37'} />
                                    {isEquipped ? 'Título Equipado' : 'Equipar como Título'}
                                </button>
                            )}
                        </div>
                    );
                })}
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

            {/* MODAL GERADOR DE CARD PARA STORIES */}
            {showShareModal && (() => {
                const totalVol = (userData?.feed || []).reduce((acc, item) => typeof item !== 'string' ? acc + ((item.weight || 0) * (item.reps || 0)) : acc, 0);
                const bestPRs = Object.entries(userData?.prs || {}).slice(0, 3).map(([id, vol]) => `${id}: ${vol} kg`).join(' • ') || "Nenhum PR registrado ainda";
                
                const copyStoryText = () => {
                    const text = `🏆 LIGA DO FERRO - ATLETA VIP 🏆\nAtleta: ${userData?.profileName || 'Guerreiro'}\nPatente: ${currentRankName.toUpperCase()} | XP: ${xp}\nTítulo: ${equippedBadge ? equippedBadge.name : 'Batizado no Ferro'}\nTreinos: ${userData?.workouts || 0} | Carga Acumulada: ${totalVol.toLocaleString('pt-BR')} kg\nPRs em Destaque: ${bestPRs}\n\n#LigaDoFerro #Musculação #AltaPerformance`;
                    navigator.clipboard.writeText(text);
                    showNotification("Texto do seu Card copiado! Cole no WhatsApp ou Instagram!", "success");
                    setShowShareModal(false);
                };

                return (
                    <div className="modal-overlay" onClick={() => setShowShareModal(false)} style={{ zIndex: 9999 }}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: '0 15px 50px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px' }}>Card de Atleta VIP</span>
                                <button type="button" onClick={() => setShowShareModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                            </div>

                            <div style={{ background: 'linear-gradient(145deg, #141417, #1c1c24)', border: '2px solid #d4af37', borderRadius: '16px', padding: '24px', marginBottom: '20px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 25px rgba(212, 175, 55, 0.15)' }}>
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)' }} />
                                
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #d4af37', margin: '0 auto 12px auto', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                                    <img src={userData?.profileImg || defaultProfileSVG} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>

                                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 4px 0' }}>{userData?.profileName || 'Guerreiro do Ferro'}</h3>
                                <span style={{ fontSize: '0.85rem', color: '#d4af37', fontWeight: '800', display: 'block', marginBottom: '14px', textTransform: 'uppercase' }}>
                                    Patente {currentRankName} • {xp} XP
                                </span>

                                {equippedBadge && (
                                    <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.4)', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '800', color: '#d4af37', marginBottom: '16px' }}>
                                        <Icon svg={equippedBadge.icon} size={14} color="#d4af37" /> {equippedBadge.name}
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'var(--bg-main)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'left' }}>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>TREINOS FEITOS</span>
                                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '800' }}>{userData?.workouts || 0}</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>CARGA ACUMULADA</span>
                                        <strong style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: '800' }}>{totalVol.toLocaleString('pt-BR')} kg</strong>
                                    </div>
                                </div>
                            </div>

                            <button type="button" className="btn-primary" onClick={copyStoryText} style={{ width: '100%', padding: '14px', background: '#f59e0b', color: '#000', fontWeight: '800', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Icon svg={svgShare} size={18} color="#000" /> Copiar Resumo para Stories
                            </button>
                        </div>
                    </div>
                );
            })()}

            {/* MODAL DIÁRIO DE MEDIDAS */}
            {showBodyModal && (
                <div className="modal-overlay" onClick={() => setShowBodyModal(false)} style={{ zIndex: 9999 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                    <Icon svg={svgRuler} size={20} color="#10b981" />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Diário de Medidas Físicas</h3>
                            </div>
                            <button type="button" onClick={() => setShowBodyModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Peso Corporal (kg)</label>
                                <input type="number" step="0.1" value={bodyWeight} onChange={e => setBodyWeight(e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontWeight: '800' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Braço (cm)</label>
                                <input type="number" step="0.5" value={bodyArm} onChange={e => setBodyArm(e.target.value)} placeholder="Ex: 40" style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontWeight: '800' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Peitoral (cm)</label>
                                <input type="number" step="0.5" value={bodyChest} onChange={e => setBodyChest(e.target.value)} placeholder="Ex: 105" style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontWeight: '800' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Cintura (cm)</label>
                                <input type="number" step="0.5" value={bodyWaist} onChange={e => setBodyWaist(e.target.value)} placeholder="Ex: 80" style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontWeight: '800' }} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Coxa (cm)</label>
                                <input type="number" step="0.5" value={bodyThigh} onChange={e => setBodyThigh(e.target.value)} placeholder="Ex: 62" style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontWeight: '800' }} />
                            </div>
                        </div>

                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => {
                                syncData({
                                    bodyWeight: Number(bodyWeight),
                                    bodyStats: { arm: bodyArm, chest: bodyChest, waist: bodyWaist, thigh: bodyThigh }
                                });
                                showNotification("Medidas corporais e peso salvos com sucesso!", "success");
                                setShowBodyModal(false);
                            }}
                            style={{ width: '100%', padding: '12px', background: '#10b981', color: '#000', fontWeight: '800', borderRadius: '10px' }}
                        >
                            Salvar Medidas
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL CORES E ACENTO DO APP */}
            {showPaletteModal && (
                <div className="modal-overlay" onClick={() => setShowPaletteModal(false)} style={{ zIndex: 9999 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                    <Icon svg={svgPalette} size={20} color="#a855f7" />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Tema e Cores VIP</h3>
                            </div>
                            <button type="button" onClick={() => setShowPaletteModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                            Escolha sua cor de acento preferida para personalizar destaques e botões no aplicativo:
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
                            {accentColorsDB.map(col => {
                                const isSelected = userData?.accentColor === col.color;
                                return (
                                    <div
                                        key={col.id}
                                        onClick={() => {
                                            syncData({ accentColor: col.color });
                                            document.documentElement.style.setProperty('--accent', col.color);
                                            showNotification(`Tema ${col.name} ativado!`, "success");
                                        }}
                                        style={{
                                            background: isSelected ? col.bgTint : 'var(--bg-main)',
                                            border: `2px solid ${isSelected ? col.color : 'var(--border)'}`,
                                            padding: '12px 14px',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: col.color, flexShrink: 0, boxShadow: `0 0 10px ${col.color}` }} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isSelected ? col.color : 'var(--text-main)' }}>{col.name}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <button type="button" className="btn-primary" onClick={() => setShowPaletteModal(false)} style={{ width: '100%', padding: '12px', background: '#a855f7', color: '#fff', fontWeight: '800', borderRadius: '10px' }}>
                            Concluir Personalização
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Profile;
