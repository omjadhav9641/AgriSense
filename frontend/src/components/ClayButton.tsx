import React from 'react';
import { Loader2 } from 'lucide-react';

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const ClayButton: React.FC<ClayButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  loading = false,
  disabled,
  ...props
}) => {
  const variantClass =
    variant === 'secondary'
      ? 'clay-button-secondary'
      : variant === 'outline'
      ? 'clay-button-outline'
      : variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
      : 'clay-button';

  const sizeClass =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs rounded-xl'
      : size === 'lg'
      ? 'px-6 py-3 text-base rounded-2xl'
      : 'px-4 py-2.5 text-sm rounded-xl';

  return (
    <button
      className={`${variantClass} ${sizeClass} ${className} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin inline-flex items-center justify-center" />
      ) : (
        icon && <span className="w-4 h-4 inline-flex items-center justify-center">{icon}</span>
      )}
      {children}
    </button>
  );
};
