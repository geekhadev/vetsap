import { useHttp } from '@inertiajs/react';
import { LoaderCircle, Stethoscope } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { formatNumberDisplay } from '@/components/custom/number-display';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type PosServiceOption = {
    id: string;
    name: string;
    price: string;
    tax_treatment: string;
};

type SearchResponse = {
    data: PosServiceOption[];
};

type PosAddServiceButtonProps = {
    searchUrl: string;
    disabled?: boolean;
    onSelect: (service: PosServiceOption) => void;
};

export function PosAddServiceButton({
    searchUrl,
    disabled = false,
    onSelect,
}: PosAddServiceButtonProps) {
    const baseId = useId();
    const searchInputId = `${baseId}-search`;
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<PosServiceOption[]>([]);
    const [searching, setSearching] = useState(false);
    const requestIdRef = useRef(0);

    const searchHttp = useHttp({ q: '' });
    const searchHttpRef = useRef(searchHttp);
    searchHttpRef.current = searchHttp;

    useEffect(() => {
        if (!open) {
            return;
        }

        const trimmed = searchQuery.trim();

        if (trimmed.length < 2) {
            setResults([]);
            setSearching(false);

            return;
        }

        const currentRequestId = ++requestIdRef.current;
        setSearching(true);

        const timeoutId = window.setTimeout(() => {
            void (async () => {
                try {
                    searchHttpRef.current.transform(() => ({ q: trimmed }));
                    const response = (await searchHttpRef.current.get(
                        searchUrl,
                    )) as SearchResponse;

                    if (currentRequestId !== requestIdRef.current) {
                        return;
                    }

                    setResults(
                        Array.isArray(response?.data) ? response.data : [],
                    );
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
        }, 300);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [open, searchQuery, searchUrl]);

    return (
        <Popover
            open={open}
            onOpenChange={(nextOpen) => {
                if (disabled) {
                    return;
                }

                setOpen(nextOpen);

                if (!nextOpen) {
                    setSearchQuery('');
                    setResults([]);
                    setSearching(false);
                }
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="text-muted-foreground h-8 px-2"
                >
                    <Stethoscope className="size-3.5" />
                    Agregar servicio
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-80 p-0"
                onOpenAutoFocus={(event) => {
                    event.preventDefault();
                    document.getElementById(searchInputId)?.focus();
                }}
            >
                <div className="border-b p-2">
                    <Input
                        id={searchInputId}
                        value={searchQuery}
                        placeholder="Nombre del servicio…"
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
                    ) : searchQuery.trim().length < 2 ? (
                        <li className="text-muted-foreground px-2 py-6 text-center text-sm">
                            Escribe para buscar servicios.
                        </li>
                    ) : results.length === 0 ? (
                        <li className="text-muted-foreground px-2 py-6 text-center text-sm">
                            Sin resultados.
                        </li>
                    ) : (
                        results.map((option) => (
                            <li key={option.id} role="option">
                                <button
                                    type="button"
                                    role="option"
                                    className={cn(
                                        'hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm',
                                    )}
                                    onClick={() => {
                                        onSelect(option);
                                        setOpen(false);
                                        setSearchQuery('');
                                        setResults([]);
                                    }}
                                >
                                    <span className="min-w-0 flex-1 truncate font-medium">
                                        {option.name}
                                    </span>
                                    <span className="text-muted-foreground shrink-0 self-center text-xs tabular-nums">
                                        {formatNumberDisplay(
                                            Number(option.price) || 0,
                                        )}
                                    </span>
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </PopoverContent>
        </Popover>
    );
}
