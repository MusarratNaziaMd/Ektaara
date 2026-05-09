export default function Avatar({ name, color, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white ${className}`}
      style={{ backgroundColor: color || '#6366f1' }}
      title={name}
    >
      {initials}
    </div>
  );
}
