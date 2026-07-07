import React, { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ranks, getCurrentRankInfo, getFeedSummaryStats, getWeeklyQuests, svgWeight, svgClock, svgFlame, svgTrophy, svgCheck, svgQuest } from '../data';
import Icon from './Icon';
import AnimatedCounter from './AnimatedCounter';
import RankImage from './RankImage';

const Path = () => {
    const { userData } = useContext(AuthContext);
    const xp = userData?.xp || 0;
    const currentRankRef = useRef(null);
    const { currentRankIndex, nextRank, progressPercentage, xpToNext } = getCurrentRankInfo(xp);

    useEffect(() => {
        if (currentRankRef.current) {
            setTimeout(() => {
                currentRankRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [currentRankIndex]);

    const reversedRanks = [...ranks].reverse();
    const quests = getWeeklyQuests(userData);

    return (
        <section id="view-path" className="view-section active">
            <h2 className="section-title">Trilha do Atleta</h2>

            {/* PAINEL DE ESTATÍSTICAS RESUMIDAS (HEADER DE IMPACTO) */}
            {(() => {
                const stats = getFeedSummaryStats(userData?.feed, userData?.prs);
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                        <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Icon svg={svgWeight} color="var(--text-muted)" size={14} /> Carga Total</span>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '800' }}><AnimatedCounter value={stats.totalCargaMonth} suffix=" kg" /></strong>
                        </div>
                        <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Icon svg={svgClock} color="var(--text-muted)" size={14} /> Tempo sob Ferro</span>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '800' }}><AnimatedCounter value={stats.totalTimeHours} decimals={1} suffix="h" /></strong>
                        </div>
                        <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Icon svg={svgFlame} color="var(--text-muted)" size={14} /> Séries em Falha</span>
                            <strong style={{ fontSize: '1.1rem', color: '#ef4444', fontWeight: '800' }}><AnimatedCounter value={stats.failSets} suffix=" séries" /></strong>
                        </div>
                        <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Icon svg={svgTrophy} color="var(--text-muted)" size={14} /> Recordes (PRs)</span>
                            <strong style={{ fontSize: '1.1rem', color: '#d4af37', fontWeight: '800' }}><AnimatedCounter value={stats.totalPRs} suffix=" PRs" /></strong>
                        </div>
                    </div>
                );
            })()}

            {/* PAINEL DE MISSÕES DA SEMANA */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', marginBottom: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px', color: '#38bdf8', display: 'flex' }}>
                            <Icon svg={svgQuest} size={18} color="#38bdf8" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Missões da Semana</h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Desafios automáticos que rendem XP de progressão</span>
                        </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon svg={svgCheck} size={14} color="#10b981" /> Renovação Semanal
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                    {quests.map(q => {
                        const pct = Math.min(100, Math.round((q.progress / q.goal) * 100));
                        return (
                            <div key={q.id} style={{
                                background: 'var(--bg-main)',
                                border: `1px solid ${q.completed ? '#10b981' : 'var(--border)'}`,
                                borderRadius: '10px',
                                padding: '12px 14px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                    <div>
                                        <strong style={{ fontSize: '0.9rem', color: q.completed ? '#10b981' : 'var(--text-main)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {q.title} {q.completed && <Icon svg={svgCheck} size={14} color="#10b981" />}
                                        </strong>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0', lineHeight: 1.3 }}>
                                            {q.desc}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#d4af37', background: 'rgba(212, 175, 55, 0.15)', padding: '2px 8px', borderRadius: '12px', flexShrink: 0 }}>
                                        +{q.xpReward} XP
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                    <span>Progresso</span>
                                    <span style={{ color: q.completed ? '#10b981' : 'var(--text-main)' }}>{q.progress.toLocaleString('pt-BR')} / {q.goal.toLocaleString('pt-BR')} {q.unit} ({pct}%)</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: q.completed ? '#10b981' : '#38bdf8', transition: 'width 0.4s ease' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="xp-hud">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span>Progresso Total: <strong id="total-xp-display" style={{ color: 'var(--text-main)' }}><AnimatedCounter value={xp} suffix=" XP" /></strong></span>
                    {nextRank ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Rumo a <strong style={{ color: 'var(--text-main)' }}>{nextRank.name}</strong> • faltam <strong>{xpToNext} XP</strong>
                        </span>
                    ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon svg={svgCheck} color="#10b981" size={16} /> Nível Máximo Alcançado
                        </span>
                    )}
                </div>
                {nextRank && (
                    <div className="hud-progress-bar" title={`${progressPercentage}% concluído para o próximo nível`}>
                        <div className="hud-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                )}
            </div>
            
            <div className="path-container" id="path-container">
                {reversedRanks.map((rank, index) => {
                    const originalIndex = ranks.length - 1 - index;
                    const isUnlocked = xp >= rank.threshold;
                    const isCurrent = originalIndex === currentRankIndex;
                    
                    let nodeClass = 'path-node';
                    if (!isUnlocked) {
                        nodeClass += ' locked';
                    } else {
                        nodeClass += ' unlocked';
                    }
                    if (isCurrent) {
                        nodeClass += ' current-rank';
                    }

                    const verticalSpacing = 130;
                    const horizontalOffset = 45;

                    const isLeft = originalIndex % 2 === 0;
                    const xOffset = isLeft ? -horizontalOffset : horizontalOffset;

                    const nextRank = reversedRanks[index + 1];
                    const showLine = !!nextRank;
                    const isLineUnlocked = nextRank && xp >= nextRank.threshold;
                    
                    let lineStyle = {};
                    if (showLine) {
                        const nextOriginalIndex = originalIndex - 1;
                        const nextIsLeft = nextOriginalIndex % 2 === 0;
                        const nextXOffset = nextIsLeft ? -horizontalOffset : horizontalOffset;
                        
                        const dx = nextXOffset - xOffset;
                        const dy = verticalSpacing;
                        const length = Math.sqrt(dx*dx + dy*dy);
                        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

                        lineStyle = {
                            width: `${length}px`,
                            top: '38px',
                            left: `calc(50% + ${xOffset}px)`,
                            transform: `translateY(-50%) rotate(${angle}deg)`
                        };
                    }

                    return (
                        <div 
                            className="path-node-wrapper" 
                            key={rank.name} 
                            style={{ height: `${verticalSpacing}px` }}
                            ref={isCurrent ? currentRankRef : null}
                        >
                            <div className="path-node-content" style={{ transform: `translateX(calc(-50% + ${xOffset}px))` }}>
                                <div className={nodeClass} style={{
                                    width: '84px',
                                    height: '84px',
                                    borderRadius: '50%',
                                    border: `3.5px solid ${isUnlocked ? rank.color : 'var(--border)'}`,
                                    padding: '3px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--bg-main)',
                                    boxShadow: isCurrent ? `0 0 25px ${rank.color || '#fff'}99` : isUnlocked ? `0 0 14px ${rank.color || '#fff'}40` : 'none',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <RankImage rank={rank} size="100%" isUnlocked={isUnlocked} />
                                </div>
                                <div className="path-label" style={isCurrent ? { color: 'var(--text-main)' } : {}}>
                                    {rank.name}<br />
                                    <small style={{ color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)' }}>{rank.threshold} XP</small>
                                </div>
                            </div>
                            {showLine && (
                                <div 
                                    className={`path-line ${isLineUnlocked ? 'active' : ''}`} 
                                    style={lineStyle}
                                ></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Path;
