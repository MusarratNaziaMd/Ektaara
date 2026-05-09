import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, UserCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0D0D1A] border-r border-white/10
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#A1FFC2] rounded-lg flex items-center justify-center">
              <span className="text-[#050810] font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-white">Ethara</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#A1FFC2]/10 text-[#A1FFC2]'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ backgroundColor: user?.avatarColor || '#3A6964' }}
            >
              {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/50 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
