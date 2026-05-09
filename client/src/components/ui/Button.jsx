import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[#A1FFC2] text-[#050810] hover:brightness-110 shadow-sm font-semibold',
  secondary: 'bg-[#2E2A4A] text-white border border-white/10 hover:bg-[#3A3555]',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  ghost: 'text-white/60 hover:text-white hover:bg-white/10',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#A1FFC2]/50 focus:ring-offset-2 focus:ring-offset-[#050810] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
