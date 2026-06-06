import { useId } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export type GlobalRecordFormToggleProps = {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    error?: string;
    label?: string;
    description?: string;
    name?: string;
};

export function GlobalRecordFormToggle({
    checked,
    onCheckedChange,
    error,
    label = 'Registro global',
    description = 'Visible para todas las empresas (sin empresa asociada).',
    name = 'is_global',
}: GlobalRecordFormToggleProps) {
    const controlId = useId();

    return (
        <div className={cn('grid w-full gap-2')}>
            <div className="flex flex-row flex-wrap items-center justify-between gap-3">
                <div className="grid min-w-0 gap-1">
                    <Label htmlFor={controlId}>{label}</Label>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <input type="hidden" name={name} value={checked ? '1' : '0'} />
                    <Switch
                        id={controlId}
                        checked={checked}
                        onCheckedChange={onCheckedChange}
                    />
                </div>
            </div>
            <InputError message={error} />
        </div>
    );
}
