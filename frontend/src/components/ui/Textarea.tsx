'use client';

import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import classNames from 'classnames';
import TextareaAutosize from 'react-textarea-autosize';
import { WarningCircle } from '@phosphor-icons/react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  minRows?: number;
  maxRows?: number;
  autoSize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      containerClassName,
      className,
      id,
      minRows = 3,
      maxRows = 10,
      autoSize = true,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    const textareaClassName = classNames(
      'w-full px-4 py-3 bg-surface-900/50 border rounded-xl text-surface-100 placeholder-surface-500 transition-all duration-200 resize-none',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      error
        ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
        : 'border-surface-700 focus:border-primary-500 focus:ring-primary-500/20',
      className
    );

    return (
      <div className={classNames('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {autoSize ? (
            <TextareaAutosize
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              minRows={minRows}
              maxRows={maxRows}
              className={textareaClassName}
              {...props}
            />
          ) : (
            <textarea
              ref={ref}
              id={inputId}
              rows={minRows}
              className={textareaClassName}
              {...props}
            />
          )}
          {error && (
            <div className="absolute top-3 right-3 text-danger-500">
              <WarningCircle className="w-5 h-5" weight="fill" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-danger-400">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-surface-500">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;


