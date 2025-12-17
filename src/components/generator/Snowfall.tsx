import React from 'react';

// Simple CSS-only snowfall component using the .snowflake class defined in globals.css
export function Snowfall({ count = 50 }: { count?: number }) {
    const flakes = Array.from({ length: count });
    return (
        <div className="snow-container" aria-hidden="true">
            {flakes.map((_, i) => {
                const left = Math.random() * 100; // percentage
                const size = Math.random() * 8 + 4; // 4-12px
                const duration = Math.random() * 5 + 5; // 5-10s
                const delay = Math.random() * 5; // 0-5s
                return (
                    <div
                        key={i}
                        className="snowflake"
                        style={{
                            left: `${left}%`,
                            width: `${size}px`,
                            height: `${size}px`,
                            animationDuration: `${duration}s`,
                            animationDelay: `${delay}s`,
                        }}
                    />
                );
            })}
        </div>
    );
}
