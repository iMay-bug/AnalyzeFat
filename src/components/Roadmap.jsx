import React, { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ranks, getCurrentRankInfo } from '../data';

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
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                            ✓ Nível Máximo Alcançado
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
                                    <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>⚡</span>
                                ) : isUnlocked ? (
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>✓</span>
                                ) : (
                                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>🔒</span>
                                )}
                            </div>
                            
                            <div className="roadmap-card">
                                <div className="roadmap-header">
                                    <div className="roadmap-title">
                                        <span 
                                            style={{ 
                                                width: '10px', 
                                                height: '10px', 
                                                borderRadius: '50%', 
                                                backgroundColor: rank.color,
                                                display: 'inline-block'
                                            }} 
                                        />
                                        <span>{rank.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
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
