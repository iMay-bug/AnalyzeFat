import React, { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ranks, getCurrentRankInfo, svgCheck, svgLightning, svgLock } from '../data';
import Icon from './Icon';
import RankImage from './RankImage';

const Roadmap = () => {
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

    return (
        <section id="view-roadmap" className="view-section active">
            <h2 className="section-title">Roadmap de Conquistas</h2>
            
            <div className="xp-hud">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span>XP Acumulado: <strong style={{ color: 'var(--text-main)' }}>{xp} XP</strong></span>
                    {nextRank ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Próxima meta: <strong style={{ color: 'var(--text-main)' }}>{nextRank.name}</strong> • faltam <strong>{xpToNext} XP</strong>
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
            
            <div className="roadmap-container">
                <div className="roadmap-spine"></div>
                {ranks.map((rank, index) => {
                    const isUnlocked = xp >= rank.threshold;
                    const isCurrent = index === currentRankIndex;
                    
                    let stepClass = 'roadmap-step';
                    if (isCurrent) {
                        stepClass += ' current';
                    } else if (isUnlocked) {
                        stepClass += ' unlocked';
                    } else {
                        stepClass += ' locked';
                    }

                    return (
                        <div 
                            className={stepClass} 
                            key={rank.name}
                            ref={isCurrent ? currentRankRef : null}
                        >
                            <div className="roadmap-node" title={isCurrent ? "Rank Atual" : isUnlocked ? "Conquistado" : "Bloqueado"}>
                                {isCurrent ? (
                                    <Icon svg={svgLightning} color="#000" size={14} />
                                ) : isUnlocked ? (
                                    <Icon svg={svgCheck} color="var(--bg-main)" size={14} />
                                ) : (
                                    <Icon svg={svgLock} color="var(--text-muted)" size={12} />
                                )}
                            </div>
                            
                            <div className="roadmap-card">
                                <div className="roadmap-header">
                                    <div className="roadmap-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <RankImage rank={rank} size={32} isUnlocked={isUnlocked} />
                                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: isUnlocked ? 'var(--text-main)' : 'var(--text-muted)' }}>{rank.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px' }}>
                                            {rank.threshold} XP
                                        </span>
                                    </div>
                                    
                                    <div className="roadmap-badge">
                                        {isCurrent ? (
                                            `Em Curso (${progressPercentage}%)`
                                        ) : isUnlocked ? (
                                            "Conquistado"
                                        ) : (
                                            `Meta: ${rank.threshold} XP`
                                        )}
                                    </div>
                                </div>
                                
                                {rank.desc && (
                                    <p className="roadmap-desc">
                                        {rank.desc}
                                    </p>
                                )}

                                {isCurrent && nextRank && (
                                    <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Evolução: <strong>{progressPercentage}%</strong> concluído. Faltam <strong>{xpToNext} XP</strong> para alcançar o rank <strong>{nextRank.name}</strong>.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Roadmap;
