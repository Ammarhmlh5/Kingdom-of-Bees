import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  color?: string;
}

export function Icon({ icon: IconComponent, size = 24, className, color }: IconProps) {
  return <IconComponent size={size} className={className} color={color} />;
}

export function ApiaryIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function HiveIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}
