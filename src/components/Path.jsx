import React, { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ranks, getCurrentRankInfo, getFeedSummaryStats, svgWeight, svgClock, svgFlame, svgTrophy, svgCheck } from '../data';
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
                                <div className={nodeClass} style={isUnlocked ? { borderColor: rank.color, display: 'flex', alignItems: 'center', justifyContent: 'center' } : { display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <RankImage rank={rank} size={36} isUnlocked={isUnlocked} />
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
