import React from 'react';
import './Skeleton.css'; // Inline styles or global

const Skeleton = ({
  className = '',
  width = '100%',
  height = '1rem',
  variant = 'line'
}) => {
  const baseClasses = 'skeleton rounded-md bg-gradient-to-r';

  const variantClasses = {
    line: `w-${width} h-${height}`,
    card: 'w-full h-64 rounded-xl',
    avatar: 'w-16 h-16 rounded-full'
  }[variant] || '';

  return <div className={`${baseClasses} ${variantClasses} ${className}`} />;
};

Skeleton.displayName = 'Skeleton';

export default Skeleton;
export { Skeleton };

