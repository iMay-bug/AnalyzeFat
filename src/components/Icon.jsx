import React from 'react';

const Icon = ({ svg, size = 16, color = 'currentColor', style = {}, className = '', title = '' }) => {
    if (!svg) return null;
    return (
        <span 
            className={`inline-svg-icon ${className}`}
            title={title}
            style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: color, 
                width: `${size}px`, 
                height: `${size}px`,
                verticalAlign: 'middle',
                flexShrink: 0,
                ...style 
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};

export default Icon;
