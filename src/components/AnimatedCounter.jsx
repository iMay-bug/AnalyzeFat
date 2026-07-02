import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ value, duration = 650, decimals = 0, suffix = '', prefix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const endValue = Number(value) || 0;
        if (endValue === 0) {
            setCount(0);
            return;
        }

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Curva Ease-out cúbica para transição suave estilo Whoop/Apple
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const current = (endValue * easeOutProgress);
            
            setCount(current);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setCount(endValue);
            }
        };

        window.requestAnimationFrame(step);
    }, [value, duration]);

    const formatted = count.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

    return <span>{prefix}{formatted}{suffix}</span>;
};

export default AnimatedCounter;
