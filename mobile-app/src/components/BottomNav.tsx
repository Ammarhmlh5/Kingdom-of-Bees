import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, Compass, Cloud, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/', icon: Home, label: 'الرئيسية' },
  { to: '/shop', icon: ShoppingCart, label: 'السوق' },
  { to: '/explore', icon: Compass, label: 'استكشف' },
  { to: '/weather', icon: Cloud, label: 'الطقس' },
  { to: '/settings', icon: Settings, label: 'الإعدادات' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-bee-border z-50 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[52px]',
                isActive ? 'text-honey' : 'text-bee-muted'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
