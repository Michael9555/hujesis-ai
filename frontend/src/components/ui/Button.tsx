'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';
import { CircleNotch } from '@phosphor-icons/react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 focus-visible:ring-primary-500',
      secondary: 'bg-surface-800 text-surface-100 border border-surface-600 hover:bg-surface-700 hover:border-surface-500 focus-visible:ring-surface-500',
      accent: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-400 hover:to-accent-500 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 focus-visible:ring-accent-500',
      ghost: 'bg-transparent text-surface-300 hover:bg-surface-800 hover:text-surface-100 focus-visible:ring-surface-500',
      danger: 'bg-danger-500 text-white hover:bg-danger-600 shadow-lg shadow-danger-500/25 focus-visible:ring-danger-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={classNames(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <CircleNotch className="w-5 h-5 animate-spin" weight="bold" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;


