import React from 'react';

interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const ClayInput = React.forwardRef<HTMLInputElement, ClayInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-[#6B6F63] uppercase tracking-wider pl-1">
            {label}
          </label>
        )}
        <input ref={ref} className={`clay-input ${className}`} {...props} />
        {error ? (
          <span className="text-xs text-rose-600 pl-1 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-[#6B6F63] pl-1">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

ClayInput.displayName = 'ClayInput';
