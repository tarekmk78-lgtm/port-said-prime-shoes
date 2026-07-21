import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full h-11 px-4 rounded-md border bg-white transition-all duration-200 placeholder:text-gray-400',
            'focus:outline-none focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400 focus:ring-2',
            className
          )}
          style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
          {...props}
        />
        {error      && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
