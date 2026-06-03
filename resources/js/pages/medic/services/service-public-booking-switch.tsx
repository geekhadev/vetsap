import { useId, useState } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type ServicePublicBookingSwitchProps = {
    defaultChecked?: boolean;
    error?: string;
};

export function ServicePublicBookingSwitch({
    defaultChecked = false,
    error,
}: ServicePublicBookingSwitchProps) {
    const baseId = useId();
    const controlId = `${baseId}-is_public_booking`;
    const errorMessageId = `${baseId}-error`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;
    const [checked, setChecked] = useState(defaultChecked);

    return (
        <div className={cn('grid w-full gap-2')}>
            <div className="flex flex-row flex-wrap items-center justify-between gap-3">
                <div className="grid min-w-0 gap-1">
                    <Label htmlFor={controlId}>Citas web públicas</Label>
                    <p className="text-muted-foreground text-sm">
                        Para uso en el formulario de citas de la web
                        pública.
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <input
                        type="hidden"
                        name="is_public_booking"
                        value={checked ? '1' : '0'}
                    />
                    <Switch
                        id={controlId}
                        checked={checked}
                        onCheckedChange={setChecked}
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
