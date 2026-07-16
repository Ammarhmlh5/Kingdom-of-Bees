import { cn } from '@/lib/utils';
import type { Apiary } from '@/types';

interface ApiaryContextSelectorProps {
  apiaries: Apiary[];
  selectedApiaryId: string | null;
  onSelect: (id: string | null) => void;
}

export function ApiaryContextSelector({ apiaries, selectedApiaryId, onSelect }: ApiaryContextSelectorProps) {
  if (apiaries.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
          !selectedApiaryId
            ? 'bg-honey text-white'
            : 'bg-bee-border text-bee-muted hover:bg-gray-200'
        )}
      >
        الكل
      </button>
      {apiaries.map((apiary) => (
        <button
          key={apiary.id}
          onClick={() => onSelect(apiary.id)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            selectedApiaryId === apiary.id
              ? 'bg-honey text-white'
              : 'bg-bee-border text-bee-muted hover:bg-gray-200'
          )}
        >
          {apiary.name}
        </button>
      ))}
    </div>
  );
}
