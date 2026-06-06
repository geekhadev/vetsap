import { Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
    formatDuration,
    formatPrice,
} from '@/pages/medic/services/types';
import type { DoctorServiceAssignment, ServiceOption } from './types';

type DoctorServicesEditorProps = {
    serviceOptions: ServiceOption[];
    assigned?: DoctorServiceAssignment[];
};

type RowState = {
    selected: boolean;
    durationOverride: string;
    priceOverride: string;
};

function normalizeSearchTerm(value: string): string {
    return value.trim().toLocaleLowerCase('es-CL');
}

function matchesServiceSearch(service: ServiceOption, term: string): boolean {
    if (term === '') {
        return true;
    }

    const serviceName = service.name.toLocaleLowerCase('es-CL');
    const specialtyName = service.specialty?.name.toLocaleLowerCase('es-CL') ?? '';

    return serviceName.includes(term) || specialtyName.includes(term);
}

function buildInitialState(
    serviceOptions: ServiceOption[],
    assigned: DoctorServiceAssignment[] | undefined,
): Record<string, RowState> {
    const assignedMap = new Map(
        (assigned ?? []).map((s) => [
            s.id,
            {
                durationOverride:
                    s.pivot.duration_override_minutes != null
                        ? String(s.pivot.duration_override_minutes)
                        : '',
                priceOverride:
                    s.pivot.price_override != null && s.pivot.price_override !== ''
                        ? String(s.pivot.price_override)
                        : '',
            },
        ]),
    );

    const state: Record<string, RowState> = {};

    for (const option of serviceOptions) {
        const assignedRow = assignedMap.get(option.id);
        state[option.id] = {
            selected: assignedRow !== undefined,
            durationOverride: assignedRow?.durationOverride ?? '',
            priceOverride: assignedRow?.priceOverride ?? '',
        };
    }

    return state;
}

export function DoctorServicesEditor({
    serviceOptions,
    assigned,
}: DoctorServicesEditorProps) {
    const baseId = useId();
    const searchInputId = `${baseId}-search`;
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState(() =>
        buildInitialState(serviceOptions, assigned),
    );

    const normalizedSearch = useMemo(() => normalizeSearchTerm(search), [search]);

    const filteredServiceOptions = useMemo(
        () =>
            serviceOptions.filter((service) =>
                matchesServiceSearch(service, normalizedSearch),
            ),
        [normalizedSearch, serviceOptions],
    );

    const selectedEntries = useMemo(
        () =>
            Object.entries(rows).filter(([, row]) => row.selected),
        [rows],
    );

    const toggle = (serviceId: string, selected: boolean) => {
        setRows((prev) => ({
            ...prev,
            [serviceId]: {
                ...prev[serviceId],
                selected,
            },
        }));
    };

    const setDurationOverride = (serviceId: string, durationOverride: string) => {
        setRows((prev) => ({
            ...prev,
            [serviceId]: {
                ...prev[serviceId],
                durationOverride,
            },
        }));
    };

    const setPriceOverride = (serviceId: string, priceOverride: string) => {
        setRows((prev) => ({
            ...prev,
            [serviceId]: {
                ...prev[serviceId],
                priceOverride,
            },
        }));
    };

    if (serviceOptions.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                No hay servicios activos en la empresa. Crea servicios en
                Medicina → Servicios antes de asignarlos.
            </p>
        );
    }

    return (
        <div className="grid gap-3">
            <input type="hidden" name="services_present" value="1" />
            <div>
                <Label>Servicios que presta</Label>
                <p className="text-muted-foreground text-sm">
                    Activa los servicios con el interruptor y, si aplica,
                    define duración o precio distintos al catálogo.
                </p>
            </div>

            <div className="relative">
                <Search
                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    aria-hidden
                />
                <Input
                    id={searchInputId}
                    type="search"
                    placeholder="Buscar por servicio o especialidad…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoComplete="off"
                    className="pl-9"
                />
            </div>

            <ul
                className={cn(
                    'divide-y rounded-md border',
                    'max-h-[min(50vh,24rem)] overflow-y-auto',
                )}
            >
                {filteredServiceOptions.length === 0 ? (
                    <li className="text-muted-foreground p-4 text-center text-sm">
                        Ningún servicio coincide con la búsqueda.
                    </li>
                ) : (
                    filteredServiceOptions.map((service) => {
                        const row = rows[service.id];
                        const switchId = `${baseId}-service-${service.id}`;
                        const durationOverrideId = `${baseId}-duration-${service.id}`;
                        const priceOverrideId = `${baseId}-price-${service.id}`;
                        const isSelected = row?.selected ?? false;

                        return (
                            <li
                                key={service.id}
                                className="flex items-center justify-between gap-3 p-3"
                            >
                                <div className="grid min-w-0 flex-1 gap-0.5">
                                    <Label
                                        htmlFor={switchId}
                                        className="cursor-pointer font-medium"
                                    >
                                        {service.name}
                                    </Label>
                                    <span className="text-muted-foreground text-xs">
                                        {service.specialty?.name ?? 'Sin especialidad'}
                                        {' · '}
                                        {formatDuration(service.duration_minutes)}
                                        {' · '}
                                        {formatPrice(service.price)}
                                    </span>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    {isSelected ? (
                                        <>
                                            <Label
                                                htmlFor={durationOverrideId}
                                                className="sr-only"
                                            >
                                                Duración override para {service.name}
                                            </Label>
                                            <Input
                                                id={durationOverrideId}
                                                type="number"
                                                min={1}
                                                max={1440}
                                                placeholder="Min"
                                                value={row.durationOverride}
                                                className="w-20"
                                                onChange={(e) =>
                                                    setDurationOverride(
                                                        service.id,
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={priceOverrideId}
                                                className="sr-only"
                                            >
                                                Precio override para {service.name}
                                            </Label>
                                            <Input
                                                id={priceOverrideId}
                                                type="number"
                                                min={0}
                                                step={1}
                                                placeholder="CLP"
                                                value={row.priceOverride}
                                                className="w-24"
                                                onChange={(e) =>
                                                    setPriceOverride(
                                                        service.id,
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </>
                                    ) : null}
                                    <Switch
                                        id={switchId}
                                        checked={isSelected}
                                        onCheckedChange={(checked) =>
                                            toggle(service.id, checked === true)
                                        }
                                        aria-label={`Asignar ${service.name}`}
                                    />
                                </div>
                            </li>
                        );
                    })
                )}
            </ul>
            {selectedEntries.map(([serviceId, row], index) => (
                <span key={serviceId} className="hidden">
                    <input
                        type="hidden"
                        name={`services[${index}][service_id]`}
                        value={serviceId}
                    />
                    <input
                        type="hidden"
                        name={`services[${index}][duration_override_minutes]`}
                        value={row.durationOverride}
                    />
                    <input
                        type="hidden"
                        name={`services[${index}][price_override]`}
                        value={row.priceOverride}
                    />
                </span>
            ))}
        </div>
    );
}
