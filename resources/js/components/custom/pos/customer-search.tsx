import { useHttp } from '@inertiajs/react';
import { LoaderCircle, Search, UserRound, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { PosCustomerSearchResult } from '@/components/custom/pos/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatIdentityDocument } from '@/types';

type PosCustomerSearchProps = {
    searchUrl: string;
    disabled?: boolean;
    onSelect: (customer: PosCustomerSearchResult) => void;
};

type SearchResponse = {
    data: PosCustomerSearchResult[];
};

export function PosCustomerSearch({
    searchUrl,
    disabled = false,
    onSelect,
}: PosCustomerSearchProps) {
    const baseId = useId();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<PosCustomerSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const requestIdRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const searchHttp = useHttp({ q: '' });
    const searchHttpRef = useRef(searchHttp);
    searchHttpRef.current = searchHttp;

    useEffect(() => {
        if (!open || disabled) {
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

                    setResults(response.data ?? []);
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

        return () => window.clearTimeout(timeoutId);
    }, [disabled, open, searchQuery, searchUrl]);

    useEffect(() => {
        function handlePointerDown(event: MouseEvent): void {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);

        return () =>
            document.removeEventListener('mousedown', handlePointerDown);
    }, []);

    return (
        <div ref={containerRef} className="relative space-y-1.5">
            <Label htmlFor={baseId}>Cliente</Label>
            <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <Input
                    id={baseId}
                    value={searchQuery}
                    disabled={disabled}
                    placeholder="Nombre, RUT, teléfono o paciente…"
                    className="pl-9"
                    onFocus={() => setOpen(true)}
                    onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setOpen(true);
                    }}
                    autoComplete="off"
                />
                {searchQuery ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                        onClick={() => {
                            setSearchQuery('');
                            setResults([]);
                        }}
                        aria-label="Limpiar búsqueda"
                    >
                        <X className="size-3.5" />
                    </Button>
                ) : null}
            </div>

            {open && searchQuery.trim().length >= 2 ? (
                <div className="bg-popover absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border shadow-md">
                    {searching ? (
                        <div className="text-muted-foreground flex items-center gap-2 px-3 py-3 text-sm">
                            <LoaderCircle className="size-4 animate-spin" />
                            Buscando…
                        </div>
                    ) : results.length === 0 ? (
                        <p className="text-muted-foreground px-3 py-3 text-sm">
                            No hay clientes con ventas abiertas.
                        </p>
                    ) : (
                        <ul className="py-1">
                            {results.map((customer) => (
                                <li key={customer.id}>
                                    <button
                                        type="button"
                                        className={cn(
                                            'hover:bg-accent flex w-full items-start gap-2 px-3 py-2 text-left text-sm',
                                        )}
                                        onClick={() => {
                                            onSelect(customer);
                                            setSearchQuery('');
                                            setResults([]);
                                            setOpen(false);
                                        }}
                                    >
                                        <UserRound className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate font-medium">
                                                {customer.name}
                                            </span>
                                            <span className="text-muted-foreground block truncate text-xs">
                                                {formatIdentityDocument(
                                                    customer.document_type,
                                                    customer.document_number,
                                                )}
                                                {customer.open_sales_count > 0
                                                    ? ` · ${customer.open_sales_count} venta${customer.open_sales_count === 1 ? '' : 's'} abierta${customer.open_sales_count === 1 ? '' : 's'}`
                                                    : ''}
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : null}
        </div>
    );
}
