import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-3 py-2 rounded-lg border border-white/10 bg-[#2E2A4A] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#A1FFC2]/50 focus:border-transparent transition-colors ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
