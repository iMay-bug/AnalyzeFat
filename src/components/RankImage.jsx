import React, { useState } from 'react';
import Icon from './Icon';

const RankImage = ({ rank, size = 28, isUnlocked = true, className = "", style = {} }) => {
    const [imgError, setImgError] = useState(false);

    if (rank?.image && !imgError) {
        return (
            <img 
                src={rank.image} 
                alt={rank?.name || "Rank"} 
                className={className}
                style={{ 
                    width: `${size}px`, 
                    height: `${size}px`, 
                    objectFit: 'contain', 
                    filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.4)',
                    transition: 'all 0.2s ease',
                    ...style
                }} 
                onError={() => setImgError(true)} 
            />
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${size}px`, height: `${size}px`, ...style }}>
            <Icon svg={rank?.icon || ''} size={Math.floor(size * 0.7)} color={isUnlocked ? (rank?.color || '#d4af37') : 'var(--text-muted)'} />
        </div>
    );
};

export default RankImage;
