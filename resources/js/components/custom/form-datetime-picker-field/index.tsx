import { format, isValid, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarClock, ChevronDownIcon } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import type { Matcher } from 'react-day-picker';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type {
    FormDateTimePickerFieldProps,
    FormDateTimeValue,
} from './types';

export type {
    FormDateTimePickerFieldProps,
    FormDateTimeValue,
} from './types';

const selectClassName = cn(
    'flex h-8 min-w-0 appearance-none rounded-md border border-input bg-transparent px-2 py-1 pr-7 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
);

function parseYmd(value: string): Date | undefined {
    const trimmed = value.trim();

    if (trimmed === '') {
        return undefined;
    }

    const parsed = parse(trimmed, 'yyyy-MM-dd', new Date());

    return isValid(parsed) ? parsed : undefined;
}

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

function formatTriggerLabel(value: FormDateTimeValue): string | null {
    const selectedDate = parseYmd(value.date);
    const selectedTime = parseHm(value.time);

    if (!selectedDate || !selectedTime) {
        return null;
    }

    return `${format(selectedDate, 'd MMM y', { locale: es })} · ${selectedTime.hour}:${selectedTime.minute}`;
}

export function FormDateTimePickerField({
    label = undefined,
    required = false,
    error,
    placeholder = 'Seleccionar fecha y hora',
    id: idProp,
    value,
    onChange,
    minuteStep = 15,
    disabled,
    containerClassName,
    labelClassName,
    errorClassName,
    triggerClassName,
    popoverContentClassName,
    portalled = true,
}: FormDateTimePickerFieldProps) {
    const baseId = useId();
    const fieldId = idProp ?? baseId;
    const hourSelectId = `${fieldId}-hour`;
    const minuteSelectId = `${fieldId}-minute`;
    const errorMessageId = `${baseId}-error`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;

    const selectedDate = useMemo(() => parseYmd(value.date), [value.date]);
    const parsedTime = useMemo(() => parseHm(value.time), [value.time]);
    const minuteOptions = useMemo(() => {
        const options = buildMinuteOptions(minuteStep);
        const currentMinute = parsedTime?.minute;

        if (currentMinute !== undefined && !options.includes(currentMinute)) {
            return [...options, currentMinute].sort();
        }

        return options;
    }, [minuteStep, parsedTime?.minute]);

    const triggerLabel = formatTriggerLabel(value);

    const describedByParts = [hasError ? errorMessageId : undefined].filter(
        Boolean,
    ) as string[];
    const ariaDescribedBy =
        describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const [open, setOpen] = useState(false);

    const updateTime = (hour: string, minute: string) => {
        onChange({
            ...value,
            time: `${hour}:${minute}`,
        });
    };

    const disabledMatchers = useMemo((): Matcher | Matcher[] | undefined => {
        if (disabled === undefined) {
            return undefined;
        }

        return disabled;
    }, [disabled]);

    return (
        <div className={cn('grid w-full gap-2', containerClassName)}>
            {label ? (
                <Label htmlFor={fieldId} className={labelClassName}>
                    {label}
                    {required ? <span aria-hidden="true"> (*)</span> : null}
                </Label>
            ) : null}
            <Popover open={open} onOpenChange={setOpen} modal>
                <PopoverTrigger asChild>
                    <Button
                        id={fieldId}
                        type="button"
                        variant="outline"
                        data-empty={!triggerLabel}
                        className={cn(
                            'h-9 w-full justify-start px-3 font-normal data-[empty=true]:text-muted-foreground',
                            triggerClassName,
                        )}
                        aria-required={required ? true : undefined}
                        aria-invalid={hasError ? true : undefined}
                        aria-describedby={ariaDescribedBy}
                    >
                        <CalendarClock aria-hidden className="size-4 shrink-0" />
                        {triggerLabel ? (
                            <span>{triggerLabel}</span>
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    portalled={portalled}
                    align="start"
                    className={cn(
                        'w-auto border-border p-0 shadow-md',
                        popoverContentClassName,
                    )}
                    onOpenAutoFocus={(event) => event.preventDefault()}
                    onCloseAutoFocus={(event) => event.preventDefault()}
                >
                    <div className="flex flex-col gap-3 p-3 sm:flex-row">
                        <Calendar
                            locale={es}
                            mode="single"
                            defaultMonth={selectedDate}
                            selected={selectedDate}
                            onSelect={(date) => {
                                if (!date) {
                                    onChange({ ...value, date: '' });

                                    return;
                                }

                                onChange({
                                    ...value,
                                    date: format(date, 'yyyy-MM-dd'),
                                });
                            }}
                            disabled={disabledMatchers}
                        />
                        <div className="flex items-center gap-2 border-t pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-3">
                            <div className="relative">
                                <select
                                    id={hourSelectId}
                                    value={parsedTime?.hour ?? '09'}
                                    className={cn(selectClassName, 'w-[4.5rem]')}
                                    aria-label="Hora"
                                    onChange={(event) =>
                                        updateTime(
                                            event.target.value,
                                            parsedTime?.minute ??
                                                minuteOptions[0] ??
                                                '00',
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
                                    value={
                                        parsedTime?.minute ??
                                        minuteOptions[0] ??
                                        '00'
                                    }
                                    className={cn(selectClassName, 'w-[4.5rem]')}
                                    aria-label="Minutos"
                                    onChange={(event) =>
                                        updateTime(
                                            parsedTime?.hour ?? '09',
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
