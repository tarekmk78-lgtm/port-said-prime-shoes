import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full h-11 px-4 pr-10 rounded-md border bg-white appearance-none cursor-pointer transition-all duration-200',
              'focus:outline-none focus:border-transparent focus:ring-2',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400',
              className
            )}
            style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
            {...props}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export { Select };
