import React, { useState } from 'react';
import Icon from './Icon';

const RankImage = ({ rank, size = 28, isUnlocked = true, className = "", style = {} }) => {
    const [imgError, setImgError] = useState(false);

    const sizeStr = typeof size === 'number' ? `${size}px` : size;

    if (rank?.image && !imgError) {
        return (
            <img 
                src={rank.image} 
                alt={rank?.name || "Rank"} 
                className={className}
                style={{ 
                    width: sizeStr, 
                    height: sizeStr, 
                    objectFit: 'cover', 
                    filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.4)',
                    transition: 'all 0.2s ease',
                    borderRadius: '50%',
                    display: 'block',
                    margin: '0 auto',
                    ...style
                }} 
                onError={() => setImgError(true)} 
            />
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: sizeStr, height: sizeStr, borderRadius: '50%', ...style }}>
            <Icon svg={rank?.icon || ''} size={typeof size === 'number' ? Math.floor(size * 0.65) : 24} color={isUnlocked ? (rank?.color || '#d4af37') : 'var(--text-muted)'} />
        </div>
    );
};

export default RankImage;

