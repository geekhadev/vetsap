import { useId, useState } from 'react';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export type FormBooleanSwitchConfirmUncheck = {
    when: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
};

export type FormBooleanSwitchProps = {
    label: string;
    name: string;
    id?: string;
    defaultChecked?: boolean;
    error?: string;
    containerClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    switchClassName?: string;
    description?: string;
    confirmUncheck?: FormBooleanSwitchConfirmUncheck;
    disabled?: boolean;
};

/**
 * Campo booleano para formularios HTML: envía `0` o `1` (compatible con validación Laravel `boolean`).
 */
export function FormBooleanSwitch({
    label,
    name,
    id,
    defaultChecked = false,
    error,
    containerClassName,
    labelClassName,
    errorClassName,
    switchClassName,
    description,
    confirmUncheck,
    disabled = false,
}: FormBooleanSwitchProps) {
    const baseId = useId();
    const controlId = id ?? `${baseId}-${name}`;
    const errorMessageId = `${baseId}-error`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;
    const [checked, setChecked] = useState(defaultChecked);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleCheckedChange = (next: boolean) => {
        if (!next && confirmUncheck?.when) {
            setConfirmOpen(true);

            return;
        }

        setChecked(next);
    };

    return (
        <div className={cn('grid w-full gap-2', containerClassName)}>
            <div className="flex flex-row flex-wrap items-center justify-between gap-3">
                <div className="grid min-w-0 gap-1">
                    <Label htmlFor={controlId} className={labelClassName}>
                        {label}
                    </Label>
                    {description ? (
                        <p className="text-muted-foreground text-sm">{description}</p>
                    ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <input type="hidden" name={name} value={checked ? '1' : '0'} />
                    <Switch
                        id={controlId}
                        checked={checked}
                        onCheckedChange={handleCheckedChange}
                        className={switchClassName}
                        disabled={disabled}
                        aria-invalid={hasError ? true : undefined}
                        aria-describedby={
                            hasError ? errorMessageId : undefined
                        }
                    />
                </div>
            </div>
            <InputError
                id={errorMessageId}
                message={hasError ? trimmedError : undefined}
                className={errorClassName}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={confirmUncheck?.title ?? '¿Desactivar?'}
                description={confirmUncheck?.message ?? ''}
                confirmLabel={confirmUncheck?.confirmLabel ?? 'Desactivar'}
                confirmVariant="destructive"
                onConfirm={() => {
                    setConfirmOpen(false);
                    setChecked(false);
                }}
            />
        </div>
    );
}
