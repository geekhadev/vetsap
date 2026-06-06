import { useId } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { APPOINTMENT_STATUS_COLOR_BADGE_CLASS } from '@/lib/appointment-status-colors';
import {
    APPOINTMENT_STATUS_COLORS,
    formatAppointmentStatusColorLabel,
} from '@/lib/appointment-status-colors';
import { cn } from '@/lib/utils';
import type { FormAppointmentStatusColorPickerProps } from './types';

export type { FormAppointmentStatusColorPickerProps } from './types';

export function FormAppointmentStatusColorPicker({
    name,
    defaultValue = 'blue',
    label = 'Color',
    required = false,
    error,
    containerClassName,
}: FormAppointmentStatusColorPickerProps) {
    const baseId = useId();
    const errorMessageId = `${baseId}-error`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;

    return (
        <div className={cn('grid w-full gap-2', containerClassName)}>
            {label ? (
                <Label className={hasError ? 'text-destructive' : undefined}>
                    {label}
                    {required ? <span aria-hidden="true"> (*)</span> : null}
                </Label>
            ) : null}

            <div
                className="grid grid-cols-4 gap-2 sm:grid-cols-8"
                role="radiogroup"
                aria-invalid={hasError ? true : undefined}
                aria-describedby={hasError ? errorMessageId : undefined}
            >
                {APPOINTMENT_STATUS_COLORS.map((color) => {
                    const inputId = `${baseId}-${color}`;

                    return (
                        <label
                            key={color}
                            htmlFor={inputId}
                            title={formatAppointmentStatusColorLabel(color)}
                            className={cn(
                                'flex cursor-pointer flex-col items-center gap-1 rounded-md border border-transparent p-1 transition-colors',
                                'has-[:checked]:border-ring has-[:checked]:bg-muted/40',
                                'hover:bg-muted/30',
                            )}
                        >
                            <input
                                type="radio"
                                id={inputId}
                                name={name}
                                value={color}
                                defaultChecked={defaultValue === color}
                                required={required}
                                className="sr-only"
                            />
                            <span
                                aria-hidden
                                className={cn(
                                    'size-7 rounded-full border shadow-xs',
                                    APPOINTMENT_STATUS_COLOR_BADGE_CLASS[color],
                                )}
                            />
                            <span className="text-muted-foreground max-w-full truncate text-[10px] leading-tight">
                                {formatAppointmentStatusColorLabel(color)}
                            </span>
                        </label>
                    );
                })}
            </div>

            <InputError
                id={errorMessageId}
                message={hasError ? trimmedError : undefined}
            />
        </div>
    );
}
