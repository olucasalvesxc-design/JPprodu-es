import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Mic2, Package, Users, Settings, BarChart3, LogOut, Shield
} from 'lucide-react';

const links = [
  { to: '/admin',           label: 'Visão Geral',  icon: LayoutDashboard },
  { to: '/admin/voices',    label: 'Vozes',         icon: Mic2 },
  { to: '/admin/orders',    label: 'Pedidos',       icon: Package },
  { to: '/admin/users',     label: 'Usuários',      icon: Users },
  { to: '/admin/reports',   label: 'Relatórios',    icon: BarChart3 },
  { to: '/admin/settings',  label: 'Configurações', icon: Settings },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <aside className="w-64 min-h-screen bg-dark-800 border-r border-dark-600 flex flex-col shrink-0">
      <div className="p-6 border-b border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">SpotTunner</span>
            <p className="text-xs text-brand-400 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-dark-600'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-600">
        <div className="flex items-center gap-3 px-3 py-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-400 text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-brand-400 font-medium">Administrador</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-400
                     hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
