'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, Activity, AlertTriangle, ShieldAlert, 
  BrainCircuit, Bell, Users, Settings, LogOut 
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Logs', href: '/logs', icon: Activity },
  { name: 'Anomalies', href: '/anomalies', icon: AlertTriangle },
  { name: 'Incidents', href: '/incidents', icon: ShieldAlert },
  { name: 'Security Events', href: '/security-events', icon: ShieldAlert },
  { name: 'AI Analysis', href: '/ai-analysis', icon: BrainCircuit },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen text-gray-300">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <ShieldAlert className="w-8 h-8 text-indigo-500 mr-2" />
        <span className="text-xl font-bold text-white tracking-wider">LogIQ</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                isActive ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
        {user?.role === 'ADMIN' && (
          <Link href="/users" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-800 hover:text-white">
            <Users className="w-5 h-5 mr-3" /> Users
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link href="/settings" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-800 hover:text-white">
          <Settings className="w-5 h-5 mr-3" /> Settings
        </Link>
        <button onClick={logout} className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-1">
          <LogOut className="w-5 h-5 mr-3" /> Logout
        </button>
      </div>
    </aside>
  );
};