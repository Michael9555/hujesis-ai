'use client';

import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
    accent: 'bg-accent-500/20 text-accent-300 border-accent-500/30',
    success: 'bg-success-500/20 text-success-400 border-success-500/30',
    warning: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
    danger: 'bg-danger-500/20 text-danger-400 border-danger-500/30',
    neutral: 'bg-surface-700/50 text-surface-300 border-surface-600/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full font-medium border',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;


