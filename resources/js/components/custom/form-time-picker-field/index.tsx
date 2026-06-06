import { ChevronDownIcon, Clock } from 'lucide-react';
import { useId, useMemo } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { FormTimePickerFieldProps } from './types';

export type { FormTimePickerFieldProps } from './types';

const selectClassName = cn(
    'flex h-8 min-w-0 appearance-none rounded-md border border-input bg-transparent px-2 py-1 pr-7 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
);

function parseHm(value: string): { hour: string; minute: string } | null {
    const match = /^(\d{2}):(\d{2})$/.exec(value.trim());

    if (!match) {
        return null;
    }

    return { hour: match[1], minute: match[2] };
}

function buildMinuteOptions(step: number): string[] {
    const options: string[] = [];

    for (let minute = 0; minute < 60; minute += step) {
        options.push(String(minute).padStart(2, '0'));
    }

    return options;
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) =>
    String(hour).padStart(2, '0'),
);

export function FormTimePickerField({
    value,
    onChange,
    label = undefined,
    required = false,
    error,
    placeholder = 'Seleccionar hora',
    id: idProp,
    minuteStep = 15,
    containerClassName,
    labelClassName,
    errorClassName,
    triggerClassName,
    popoverContentClassName,
    popoverSide = 'top',
}: FormTimePickerFieldProps) {
    const baseId = useId();
    const fieldId = idProp ?? baseId;
    const hourSelectId = `${fieldId}-hour`;
    const minuteSelectId = `${fieldId}-minute`;
    const errorMessageId = `${baseId}-error`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;

    const parsed = useMemo(() => parseHm(value), [value]);
    const minuteOptions = useMemo(() => {
        const options = buildMinuteOptions(minuteStep);
        const currentMinute = parsed?.minute;

        if (
            currentMinute !== undefined &&
            !options.includes(currentMinute)
        ) {
            return [...options, currentMinute].sort();
        }

        return options;
    }, [minuteStep, parsed?.minute]);

    const describedByParts = [hasError ? errorMessageId : undefined].filter(
        Boolean,
    ) as string[];
    const ariaDescribedBy =
        describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const updateTime = (hour: string, minute: string) => {
        onChange(`${hour}:${minute}`);
    };

    return (
        <div className={cn('grid w-full gap-2', containerClassName)}>
            {label ? (
                <Label htmlFor={fieldId} className={labelClassName}>
                    {label}
                    {required ? <span aria-hidden="true"> (*)</span> : null}
                </Label>
            ) : null}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id={fieldId}
                        type="button"
                        variant="outline"
                        data-empty={!parsed}
                        className={cn(
                            'h-9 w-full justify-start px-3 font-normal data-[empty=true]:text-muted-foreground',
                            triggerClassName,
                        )}
                        aria-required={required ? true : undefined}
                        aria-invalid={hasError ? true : undefined}
                        aria-describedby={ariaDescribedBy}
                    >
                        <Clock aria-hidden className="size-4 shrink-0" />
                        {parsed ? (
                            <span>{`${parsed.hour}:${parsed.minute}`}</span>
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    portalled
                    side={popoverSide}
                    align="start"
                    className={cn('w-auto border-border p-3 shadow-md', popoverContentClassName)}
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                id={hourSelectId}
                                value={parsed?.hour ?? '09'}
                                required={required}
                                className={cn(selectClassName, 'w-[4.5rem]')}
                                aria-label="Hora"
                                onChange={(event) =>
                                    updateTime(
                                        event.target.value,
                                        parsed?.minute ?? minuteOptions[0] ?? '00',
                                    )
                                }
                            >
                                {HOUR_OPTIONS.map((hour) => (
                                    <option key={hour} value={hour}>
                                        {hour}
                                    </option>
                                ))}
                            </select>
                            <ChevronDownIcon
                                aria-hidden
                                className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-muted-foreground opacity-50"
                            />
                        </div>
                        <span className="text-muted-foreground text-sm">:</span>
                        <div className="relative">
                            <select
                                id={minuteSelectId}
                                value={parsed?.minute ?? minuteOptions[0] ?? '00'}
                                required={required}
                                className={cn(selectClassName, 'w-[4.5rem]')}
                                aria-label="Minutos"
                                onChange={(event) =>
                                    updateTime(
                                        parsed?.hour ?? '09',
                                        event.target.value,
                                    )
                                }
                            >
                                {minuteOptions.map((minute) => (
                                    <option key={minute} value={minute}>
                                        {minute}
                                    </option>
                                ))}
                            </select>
                            <ChevronDownIcon
                                aria-hidden
                                className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-muted-foreground opacity-50"
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            <InputError
                id={errorMessageId}
                message={hasError ? trimmedError : undefined}
                className={errorClassName}
            />
        </div>
    );
}
