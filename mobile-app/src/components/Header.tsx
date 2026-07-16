import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSync?: () => void;
  syncing?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ title, subtitle, onSync, syncing, rightAction }: HeaderProps) {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-bee-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-bee-text">{title}</h1>
          {subtitle && <p className="text-xs text-bee-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
            isOnline ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
          )}>
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isOnline ? 'متصل' : 'غير متصل'}
          </span>
          {onSync && (
            <button
              onClick={onSync}
              disabled={syncing}
              className="p-2 rounded-full hover:bg-bee-border transition-colors"
            >
              <RefreshCw size={18} className={cn('text-honey', syncing && 'animate-spin')} />
            </button>
          )}
          {rightAction}
        </div>
      </div>
    </header>
  );
}
