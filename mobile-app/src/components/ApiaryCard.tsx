import { MapPin, Layers } from 'lucide-react';
import { Card } from './ui/Card';
import type { Apiary } from '@/types';

interface ApiaryCardProps {
  apiary: Apiary;
  onClick?: () => void;
}

export function ApiaryCard({ apiary, onClick }: ApiaryCardProps) {
  return (
    <Card onClick={onClick} className="mb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-base text-bee-text">{apiary.name}</h3>
          <span className="inline-block mt-1 px-2 py-0.5 bg-honey/10 text-honey text-xs rounded-full font-medium">
            {apiary.type}
          </span>
        </div>
        <div className="flex items-center gap-1 text-bee-muted text-xs">
          <Layers size={14} />
          <span>{apiary.hiveCount || 0}</span>
        </div>
      </div>
      {apiary.location && (
        <div className="flex items-center gap-1 mt-2 text-bee-muted text-xs">
          <MapPin size={12} />
          <span>{apiary.location}</span>
        </div>
      )}
    </Card>
  );
}
