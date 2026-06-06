import { Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type FilterDropdownFooterProps = {
    onApply: () => void;
    onReset: () => void;
};

export function FilterDropdownFooter({
    onApply,
    onReset,
}: FilterDropdownFooterProps) {
    return (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            <Button type="button" onClick={onApply}>
                <Check />
                Aplicar
            </Button>
            <Button type="button" variant="outline" onClick={onReset}>
                <RotateCcw />
                Reiniciar
            </Button>
        </div>
    );
}
