import { useId, useState } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type SpecialtyActiveSwitchProps = {
    defaultChecked?: boolean;
    hasActiveServices?: boolean;
    error?: string;
};

export function SpecialtyActiveSwitch({
    defaultChecked = true,
    hasActiveServices = false,
    error,
}: SpecialtyActiveSwitchProps) {
    const baseId = useId();
    const controlId = `${baseId}-is_active`;
    const errorMessageId = `${baseId}-error`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;
    const [checked, setChecked] = useState(defaultChecked);

    const handleCheckedChange = (next: boolean) => {
        if (!next && hasActiveServices) {
            const confirmed = window.confirm(
                'Esta especialidad tiene servicios activos asociados. Si la desactivas, dejará de mostrarse en la web pública y en el selector de citas, pero el sistema puede rechazar el cambio hasta que esos servicios se desactiven.',
            );

            if (!confirmed) {
                return;
            }
        }

        setChecked(next);
    };

    return (
        <div className={cn('grid w-full gap-2')}>
            <div className="flex flex-row flex-wrap items-center justify-between gap-3">
                <div className="grid min-w-0 gap-1">
                    <Label htmlFor={controlId}>Activa</Label>
                    <p className="text-muted-foreground text-sm">
                        Controla la visibilidad en la web pública y en la agenda.
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <input type="hidden" name="is_active" value={checked ? '1' : '0'} />
                    <Switch
                        id={controlId}
                        checked={checked}
                        onCheckedChange={handleCheckedChange}
                        aria-invalid={hasError ? true : undefined}
                        aria-describedby={hasError ? errorMessageId : undefined}
                    />
                </div>
            </div>
            <InputError
                id={errorMessageId}
                message={hasError ? trimmedError : undefined}
            />
        </div>
    );
}
