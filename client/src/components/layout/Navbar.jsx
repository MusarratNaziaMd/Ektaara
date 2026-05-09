import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <header className="h-16 bg-[#050810] border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
      <button onClick={onMenuClick} className="lg:hidden p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg">
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={logout}
          className="p-2 text-white/50 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
            style={{ backgroundColor: user?.avatarColor || '#3A6964' }}
          >
            {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-white/50 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
