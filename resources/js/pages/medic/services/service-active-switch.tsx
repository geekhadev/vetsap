import { useId, useState } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type ServiceActiveSwitchProps = {
    defaultChecked?: boolean;
    hasActiveAppointments?: boolean;
    error?: string;
};

export function ServiceActiveSwitch({
    defaultChecked = true,
    hasActiveAppointments = false,
    error,
}: ServiceActiveSwitchProps) {
    const baseId = useId();
    const controlId = `${baseId}-is_active`;
    const errorMessageId = `${baseId}-error`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;
    const [checked, setChecked] = useState(defaultChecked);

    const handleCheckedChange = (next: boolean) => {
        if (!next && hasActiveAppointments) {
            const confirmed = window.confirm(
                'Este servicio tiene citas pendientes o confirmadas. Si lo desactivas, dejará de estar disponible para nuevas reservas.',
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
                    <Label htmlFor={controlId}>Activo</Label>
                    <p className="text-muted-foreground text-sm">
                        Disponible para uso interno y asignación en el sistema.
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
