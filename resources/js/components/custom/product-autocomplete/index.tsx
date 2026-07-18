import { useHttp } from '@inertiajs/react';
import { Check, ChevronDownIcon, LoaderCircle, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { formatNumberDisplay } from '@/components/custom/number-display';
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

import type {
    ProductAutocompleteOption,
    ProductAutocompleteProps,
} from './types';

export type {
    ProductAutocompleteOption,
    ProductAutocompleteProps,
    ProductAutocompleteSelected,
} from './types';

type SearchResponse = {
    data: ProductAutocompleteOption[];
};

export function ProductAutocomplete({
    value,
    selected,
    onSelect,
    onClear,
    excludeIds = [],
    name,
    label = undefined,
    required = false,
    error,
    placeholder = 'Buscar producto…',
    searchPlaceholder = 'Nombre o código de barra…',
    id: idProp,
    containerClassName,
    searchUrl,
    minChars = 2,
    debounceMs = 300,
}: ProductAutocompleteProps) {
    const baseId = useId();
    const fieldId = idProp ?? baseId;
    const errorMessageId = `${baseId}-error`;
    const searchInputId = `${baseId}-search`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;

    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<ProductAutocompleteOption[]>([]);
    const [searching, setSearching] = useState(false);
    const requestIdRef = useRef(0);
    const excludeIdsKey = excludeIds.join(',');
    const excludeIdsRef = useRef(excludeIds);
    excludeIdsRef.current = excludeIds;

    const searchHttp = useHttp({
        q: '',
        exclude_ids: '',
    });
    const searchHttpRef = useRef(searchHttp);
    searchHttpRef.current = searchHttp;

    useEffect(() => {
        if (!open) {
            return;
        }

        const trimmed = searchQuery.trim();

        if (trimmed.length < minChars) {
            setResults([]);
            setSearching(false);

            return;
        }

        const currentRequestId = ++requestIdRef.current;
        setSearching(true);

        const timeoutId = window.setTimeout(() => {
            void (async () => {
                try {
                    searchHttpRef.current.transform(() => ({
                        q: trimmed,
                        exclude_ids: excludeIdsRef.current.join(','),
                    }));

                    const response = (await searchHttpRef.current.get(
                        searchUrl,
                    )) as SearchResponse;

                    if (currentRequestId !== requestIdRef.current) {
                        return;
                    }

                    setResults(Array.isArray(response?.data) ? response.data : []);
                } catch {
                    if (currentRequestId !== requestIdRef.current) {
                        return;
                    }

                    setResults([]);
                } finally {
                    if (currentRequestId === requestIdRef.current) {
                        setSearching(false);
                    }
                }
            })();
        }, debounceMs);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [open, searchQuery, minChars, debounceMs, searchUrl, excludeIdsKey]);

    const describedByParts = [hasError ? errorMessageId : undefined].filter(
        Boolean,
    ) as string[];
    const ariaDescribedBy =
        describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const hasSelection = value.trim() !== '' && selected !== null;
    const triggerLabel = hasSelection ? selected.name : placeholder;
    const hintMessage =
        searchQuery.trim().length > 0 && searchQuery.trim().length < minChars
            ? `Escribe al menos ${minChars} caracteres…`
            : null;

    return (
        <div className={cn('grid w-full gap-2', containerClassName)}>
            {name ? <input type="hidden" name={name} value={value} /> : null}

            {label ? (
                <Label htmlFor={fieldId} className="leading-none">
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
                        setResults([]);
                        setSearching(false);
                    }
                }}
            >
                <div className="relative">
                    <PopoverTrigger asChild>
                        <Button
                            id={fieldId}
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            aria-controls={`${baseId}-listbox`}
                            data-empty={!hasSelection}
                            className={cn(
                                'h-9 w-full min-w-0 justify-between overflow-hidden px-3 font-normal data-[empty=true]:text-muted-foreground',
                                hasSelection && 'pr-9',
                            )}
                            aria-required={required ? true : undefined}
                            aria-invalid={hasError ? true : undefined}
                            aria-describedby={ariaDescribedBy}
                        >
                            <span
                                className="min-w-0 flex-1 truncate text-left"
                                title={triggerLabel}
                            >
                                {triggerLabel}
                            </span>
                            <ChevronDownIcon
                                aria-hidden
                                className="size-4 shrink-0 opacity-50"
                            />
                        </Button>
                    </PopoverTrigger>

                    {hasSelection ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onClear();
                                setOpen(false);
                                setSearchQuery('');
                                setResults([]);
                            }}
                            aria-label="Quitar producto"
                        >
                            <X className="size-3.5" />
                        </Button>
                    ) : null}
                </div>

                <PopoverContent
                    align="start"
                    className="w-(--radix-popover-trigger-width) p-0"
                    onOpenAutoFocus={(event) => {
                        event.preventDefault();
                        document.getElementById(searchInputId)?.focus();
                    }}
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
                        {searching ? (
                            <li className="text-muted-foreground flex items-center justify-center gap-2 px-2 py-6 text-sm">
                                <LoaderCircle className="size-4 animate-spin" />
                                Buscando…
                            </li>
                        ) : hintMessage ? (
                            <li className="text-muted-foreground px-2 py-6 text-center text-sm">
                                {hintMessage}
                            </li>
                        ) : searchQuery.trim().length < minChars ? (
                            <li className="text-muted-foreground px-2 py-6 text-center text-sm">
                                Escribe para buscar productos.
                            </li>
                        ) : results.length === 0 ? (
                            <li className="text-muted-foreground px-2 py-6 text-center text-sm">
                                Sin resultados.
                            </li>
                        ) : (
                            results.map((option) => {
                                const isSelected = option.id === value;

                                return (
                                    <li key={option.id} role="option">
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected}
                                            className={cn(
                                                'hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm',
                                                isSelected &&
                                                    'bg-accent text-accent-foreground',
                                            )}
                                            onClick={() => {
                                                onSelect(option);
                                                setOpen(false);
                                                setSearchQuery('');
                                                setResults([]);
                                            }}
                                        >
                                            <Check
                                                aria-hidden
                                                className={cn(
                                                    'size-4 shrink-0',
                                                    isSelected
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate font-medium">
                                                    {option.name}
                                                </span>
                                                <span className="text-muted-foreground block truncate text-xs">
                                                    {option.barcode?.trim()
                                                        ? option.barcode
                                                        : 'Sin código'}
                                                </span>
                                            </span>
                                            <span className="text-muted-foreground shrink-0 self-center text-xs tabular-nums">
                                                Stock{' '}
                                                {formatNumberDisplay(
                                                    option.stock,
                                                )}
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
            />
        </div>
    );
}
