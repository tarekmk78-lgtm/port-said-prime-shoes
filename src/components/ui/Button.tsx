import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, fullWidth, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:   'btn-primary',
      secondary: 'btn-secondary',
      outline:   'btn-outline',
      ghost:     'text-gray-800 hover:bg-gray-100 focus:ring-gray-300',
      link:      'text-primary underline-offset-4 hover:underline focus:ring-primary',
      danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    };

    const sizes = {
      sm:   'h-9 px-3 text-sm rounded-md',
      md:   'h-11 px-6 text-base rounded-md',
      lg:   'h-14 px-8 text-lg rounded-lg',
      icon: 'h-10 w-10 rounded-md',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
