import React from 'react';
import { motion } from 'react'; // No, vanilla
import Card from './Card';
import Skeleton from './Skeleton';
import { useDesignSystem } from '../../context/ThemeContext';

const KPI = ({
  title,
  value,
  trend = 0, // +5.2%
  subtitle,
  loading = false,
  color = 'primary'
}) => {
  const { darkMode } = useDesignSystem();

  if (loading) {
    return (
      <Card className="grid place-items-center p-12">
        <div className="space-y-3">
          <Skeleton height="1.5rem" width="60%" />
          <Skeleton height="3rem" width="40%" />
          <Skeleton height="1rem" width="80%" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="text-center group hover:shadow-glow glow-pulse">
      <div className="space-y-2">
        <div className="text-4xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
          {value}
        </div>
        <h3 className="font-semibold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wide">
          {title}
        </h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        {trend !== 0 && (
          <span className={`text-sm font-bold ${
            trend > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {trend > 0 ? '↑' : '↓'}{Math.abs(trend)}%
          </span>
        )}
      </div>
    </Card>
  );
};

KPI.displayName = 'KPI';

export default KPI;
export { KPI };

