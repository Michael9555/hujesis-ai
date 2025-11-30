"use client";

import React, { forwardRef, InputHTMLAttributes } from "react";
import classNames from "classnames";
import { WarningCircle } from "@phosphor-icons/react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <div className={classNames("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={classNames(
              "w-full px-4 py-3 bg-surface-900/50 border rounded-xl text-surface-100 placeholder-surface-500 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              error
                ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20"
                : "border-surface-700 focus:border-primary-500 focus:ring-primary-500/20",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />
          {rightIcon && !error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-surface-500">
              {rightIcon}
            </div>
          )}
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-danger-500">
              <WarningCircle className="w-5 h-5" weight="fill" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-danger-400 flex items-center gap-1">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-surface-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
