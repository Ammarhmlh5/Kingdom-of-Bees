
import React from 'react';
import { cn } from '@/lib/utils';

interface GaugeProps {
    value: number; // 0 to 100
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

export function Gauge({ value, label, size = 'md', color = 'text-amber-500' }: GaugeProps) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    // We want a half circle (180 degrees), so we only show half the circumference
    const offset = circumference - ((value / 100) * (circumference / 2));

    // Size classes
    const sizeClasses = {
        sm: 'w-24 h-12',
        md: 'w-32 h-16',
        lg: 'w-48 h-24'
    };

    const strokeWidth = size === 'sm' ? 6 : 8;

    // Determine color based on value if not provided or generic
    const getColor = (val: number) => {
        if (val < 30) return 'text-red-500';
        if (val < 70) return 'text-yellow-500';
        return 'text-emerald-500';
    };

    const finalColor = color === 'dynamic' ? getColor(value) : color;

    return (
        <div className="flex flex-col items-center justify-center">
            <div className={cn("relative overflow-hidden", sizeClasses[size])}>
                <svg
                    className={cn("w-full h-full transform rotate-0", sizeClasses[size].replace('h-', 'h-[200%]'))} // Double height for full circle context
                    viewBox="0 0 100 50"
                    preserveAspectRatio="none"
                >
                    {/* Background Arc */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-slate-100"
                        strokeLinecap="round"
                    />
                    {/* Value Arc */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className={cn("transition-all duration-1000 ease-out", finalColor)}
                        strokeDasharray={126} // Approx length of arc
                        strokeDashoffset={126 - (value / 100) * 126}
                        strokeLinecap="round"
                    />
                </svg>
                {/* Needle Base (Optional, kept simple for now) */}
            </div>
            <div className="text-center -mt-2">
                <span className={cn("font-bold", size === 'sm' ? "text-lg" : "text-2xl", finalColor)}>
                    {value}%
                </span>
                {label && <p className="text-xs text-muted-foreground">{label}</p>}
            </div>
        </div>
    );
}
