import { useId } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import type { FormHexColorInputProps } from './types';

export type { FormHexColorInputProps } from './types';

const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

function normalizeHexInput(raw: string): string {
    const trimmed = raw.trim();

    if (trimmed === '') {
        return '';
    }

    const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

    return withHash.toUpperCase();
}

function toColorPickerValue(value: string, fallbackColor: string): string {
    if (HEX_COLOR_PATTERN.test(value)) {
        if (value.length === 4) {
            const [, r, g, b] = value;

            return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
        }

        return value.slice(0, 7).toUpperCase();
    }

    return fallbackColor;
}

export function FormHexColorInput({
    label,
    required = false,
    error,
    helperText,
    containerClassName,
    fallbackColor = '#06B6D4',
    inputProps,
}: FormHexColorInputProps) {
    const baseId = useId();
    const textInputId = inputProps.id ?? baseId;
    const colorInputId = `${baseId}-picker`;
    const errorMessageId = `${baseId}-error`;
    const helperId = `${baseId}-helper`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;
    const value = inputProps.value;
    const pickerValue = toColorPickerValue(value, fallbackColor);

    const describedByParts = [
        helperText ? helperId : undefined,
        hasError ? errorMessageId : undefined,
    ].filter(Boolean) as string[];
    const ariaDescribedBy =
        describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    return (
        <div className={cn('grid w-full gap-2', containerClassName)}>
            {label ? (
                <Label htmlFor={textInputId}>
                    {label}
                    {required ? <span aria-hidden="true"> (*)</span> : null}
                </Label>
            ) : null}

            <div className="flex items-center gap-2">
                <Input
                    id={colorInputId}
                    type="color"
                    value={pickerValue}
                    disabled={inputProps.disabled}
                    aria-label={typeof label === 'string' ? label : 'Selector de color'}
                    className="h-9 w-12 shrink-0 cursor-pointer p-1"
                    onChange={(e) =>
                        inputProps.onChange(e.target.value.toUpperCase())
                    }
                />
                <Input
                    id={textInputId}
                    name={inputProps.name}
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={fallbackColor}
                    maxLength={9}
                    value={value}
                    disabled={inputProps.disabled}
                    aria-invalid={hasError ? true : undefined}
                    aria-describedby={ariaDescribedBy}
                    className="font-mono uppercase"
                    onChange={(e) =>
                        inputProps.onChange(normalizeHexInput(e.target.value))
                    }
                />
            </div>

            {helperText ? (
                <p id={helperId} className="text-muted-foreground text-sm">
                    {helperText}
                </p>
            ) : null}

            <InputError
                id={errorMessageId}
                message={hasError ? trimmedError : undefined}
            />
        </div>
    );
}
