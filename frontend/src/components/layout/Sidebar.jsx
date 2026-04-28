import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Plus, Package, Wallet, Users, HelpCircle, LogOut, Mic2
} from 'lucide-react';

const links = [
  { to: '/dashboard',            label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/dashboard/new-order',  label: 'Novo Pedido',  icon: Plus },
  { to: '/dashboard/orders',     label: 'Meus Pedidos', icon: Package },
  { to: '/dashboard/credits',    label: 'Créditos',     icon: Wallet },
  { to: '/dashboard/support',    label: 'Suporte',      icon: HelpCircle },
];

export default function Sidebar() {
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
            <Mic2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SpotTunner</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
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
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
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
