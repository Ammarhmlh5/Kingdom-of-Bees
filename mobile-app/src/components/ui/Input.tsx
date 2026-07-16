import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-bee-text">{label}</label>}
      <input
        className={cn(
          'w-full px-3 py-2.5 rounded-lg border border-bee-border bg-white text-bee-text text-sm',
          'placeholder:text-bee-muted focus:border-honey focus:ring-2 focus:ring-honey/20',
          'transition-colors',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-bee-text">{label}</label>}
      <textarea
        className={cn(
          'w-full px-3 py-2.5 rounded-lg border border-bee-border bg-white text-bee-text text-sm',
          'placeholder:text-bee-muted focus:border-honey focus:ring-2 focus:ring-honey/20',
          'transition-colors resize-none',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-bee-text">{label}</label>}
      <select
        className={cn(
          'w-full px-3 py-2.5 rounded-lg border border-bee-border bg-white text-bee-text text-sm',
          'focus:border-honey focus:ring-2 focus:ring-honey/20 transition-colors',
          error && 'border-danger',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
