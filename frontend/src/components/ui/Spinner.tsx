'use client';

import React from 'react';
import classNames from 'classnames';
import { CircleNotch } from '@phosphor-icons/react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <CircleNotch
      className={classNames(
        'animate-spin text-primary-500',
        sizes[size],
        className
      )}
      weight="bold"
    />
  );
};

export const FullPageSpinner: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm z-50">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="xl" />
      <p className="text-surface-300 text-sm animate-pulse">Loading...</p>
    </div>
  </div>
);

export default Spinner;


