import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export type FilterRowWithClearProps = {
    children: ReactNode;
    canClear: boolean;
    onClear: () => void;
    clearLabel: string;
};

export function FilterRowWithClear({
    children,
    canClear,
    onClear,
    clearLabel,
}: FilterRowWithClearProps) {
    return (
        <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">{children}</div>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-40"
                disabled={!canClear}
                onClick={onClear}
                aria-label={clearLabel}
            >
                <X className="size-4" aria-hidden />
            </Button>
        </div>
    );
}
