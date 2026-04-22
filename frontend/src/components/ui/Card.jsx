import React from 'react';
import { useDesignSystem } from '../../context/ThemeContext';
import './Card.css'; // Will create next if needed, but use global for now

const Card = ({
  children,
  className = '',
  variant = 'default',
  hoverGlow = true,
  loading = false,
  size = 'md',
  ...props
}) => {
  const { darkMode } = useDesignSystem();

  const baseClasses = 'card relative overflow-hidden';
  const variantClasses = {
    default: '',
    elevated: 'shadow-xl ring-1 ring-inset ring-white/10',
    glass: 'bg-white/20 backdrop-blur-xl border-white/20 shadow-2xl'
  }[variant];

  const sizeClasses = {
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-12'
  }[size];

  const glowClasses = hoverGlow ? 'hover:shadow-glow hover:scale-[1.02] hover:-translate-y-2' : '';

  return (
    <div 
      className={`
        ${baseClasses} ${variantClasses} ${sizeClasses} ${glowClasses} ${className}
        ${loading ? 'animate-pulse bg-gradient-to-r from-slate-200/30 to-slate-300/30 dark:from-slate-800/50 dark:to-slate-700/50' : ''}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

Card.displayName = 'Card';

export default Card;
export { Card };

