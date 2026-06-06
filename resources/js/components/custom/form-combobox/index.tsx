import { Check, ChevronDownIcon } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { FormComboboxProps } from './types';

export type { FormComboboxOption, FormComboboxProps } from './types';

function normalizeSearch(value: string): string {
    return value.trim().toLowerCase();
}

export function FormCombobox({
    options,
    value,
    onValueChange,
    label = undefined,
    required = false,
    error,
    placeholder = 'Seleccionar…',
    searchPlaceholder = 'Buscar…',
    emptyMessage = 'Sin resultados.',
    id: idProp,
    containerClassName,
    labelClassName,
    errorClassName,
    triggerClassName,
    popoverContentClassName,
}: FormComboboxProps) {
    const baseId = useId();
    const fieldId = idProp ?? baseId;
    const errorMessageId = `${baseId}-error`;
    const searchInputId = `${baseId}-search`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const selectedOption = useMemo(
        () => options.find((option) => option.value === value),
        [options, value],
    );

    const normalizedQuery = normalizeSearch(searchQuery);

    const filteredOptions = useMemo(() => {
        if (normalizedQuery === '') {
            return options;
        }

        return options.filter((option) => {
            const haystack = normalizeSearch(
                option.searchText ?? option.label,
            );

            return haystack.includes(normalizedQuery);
        });
    }, [normalizedQuery, options]);

    const describedByParts = [hasError ? errorMessageId : undefined].filter(
        Boolean,
    ) as string[];
    const ariaDescribedBy =
        describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const triggerLabel =
        selectedOption?.label ??
        (value.trim() !== '' ? value : placeholder);

    return (
        <div className={cn('grid w-full gap-2', containerClassName)}>
            {label ? (
                <Label htmlFor={fieldId} className={labelClassName}>
                    {label}
                    {required ? <span aria-hidden="true"> (*)</span> : null}
                </Label>
            ) : null}
            <Popover
                open={open}
                onOpenChange={(nextOpen) => {
                    setOpen(nextOpen);

                    if (!nextOpen) {
                        setSearchQuery('');
                    }
                }}
            >
                <PopoverTrigger asChild>
                    <Button
                        id={fieldId}
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={`${baseId}-listbox`}
                        data-empty={value.trim() === ''}
                        className={cn(
                            'h-9 w-full justify-between px-3 font-normal data-[empty=true]:text-muted-foreground',
                            triggerClassName,
                        )}
                        aria-required={required ? true : undefined}
                        aria-invalid={hasError ? true : undefined}
                        aria-describedby={ariaDescribedBy}
                    >
                        <span className="min-w-0 truncate text-left">
                            {triggerLabel}
                        </span>
                        <ChevronDownIcon
                            aria-hidden
                            className="size-4 shrink-0 opacity-50"
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className={cn(
                        'w-(--radix-popover-trigger-width) p-0',
                        popoverContentClassName,
                    )}
                >
                    <div className="border-b border-border p-2">
                        <Input
                            id={searchInputId}
                            value={searchQuery}
                            placeholder={searchPlaceholder}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            autoComplete="off"
                        />
                    </div>
                    <ul
                        id={`${baseId}-listbox`}
                        role="listbox"
                        className="max-h-60 overflow-y-auto p-1"
                    >
                        {filteredOptions.length === 0 ? (
                            <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                                {emptyMessage}
                            </li>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = option.value === value;

                                return (
                                    <li key={option.value} role="option">
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected}
                                            className={cn(
                                                'flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                                                isSelected &&
                                                    'bg-accent text-accent-foreground',
                                            )}
                                            onClick={() => {
                                                onValueChange(option.value);
                                                setOpen(false);
                                                setSearchQuery('');
                                            }}
                                        >
                                            <Check
                                                aria-hidden
                                                className={cn(
                                                    'mt-0.5 size-4 shrink-0',
                                                    isSelected
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                            <span className="min-w-0 flex-1 wrap-break-word">
                                                {option.label}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
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
