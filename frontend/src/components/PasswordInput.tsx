import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-[#6B6F63] uppercase tracking-wider pl-1">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`clay-input pr-11 ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C665D] hover:text-[#2C2825] focus:outline-none focus:ring-2 focus:ring-[#2E6F40]/30 rounded-lg p-1 transition-all duration-200 ease-in-out"
          >
            <div className="relative w-4 h-4 flex items-center justify-center">
              <Eye
                className={`w-4 h-4 absolute inset-0 transition-all duration-200 ease-in-out ${
                  showPassword ? 'opacity-0 scale-75 rotate-12' : 'opacity-100 scale-100 rotate-0'
                }`}
              />
              <EyeOff
                className={`w-4 h-4 absolute inset-0 transition-all duration-200 ease-in-out ${
                  showPassword ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-12'
                }`}
              />
            </div>
          </button>
        </div>
        {error ? (
          <span className="text-xs text-rose-600 pl-1 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-[#6B6F63] pl-1">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
