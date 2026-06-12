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
import {
    buildDurationBlockOptions,
    durationBlockCountToMinutes,
    resolveDurationBlockCount,
} from './types';
import type { DoctorServiceAssignment, ServiceOption } from './types';

type DoctorServicesEditorProps = {
    serviceOptions: ServiceOption[];
    assigned?: DoctorServiceAssignment[];
    timeBlockMinutes: number;
};

type RowState = {
    selected: boolean;
    durationBlockCount: string;
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
    timeBlockMinutes: number,
): Record<string, RowState> {
    const assignedMap = new Map(
        (assigned ?? []).map((s) => [
            s.id,
            {
                durationBlockCount: resolveDurationBlockCount(
                    s.pivot.duration_override_minutes,
                    timeBlockMinutes,
                ),
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
            durationBlockCount: assignedRow?.durationBlockCount ?? '',
            priceOverride: assignedRow?.priceOverride ?? '',
        };
    }

    return state;
}

export function DoctorServicesEditor({
    serviceOptions,
    assigned,
    timeBlockMinutes,
}: DoctorServicesEditorProps) {
    const baseId = useId();
    const searchInputId = `${baseId}-search`;
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState(() =>
        buildInitialState(serviceOptions, assigned, timeBlockMinutes),
    );

    const durationBlockOptions = useMemo(
        () => buildDurationBlockOptions(timeBlockMinutes),
        [timeBlockMinutes],
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

    const setDurationBlockCount = (serviceId: string, durationBlockCount: string) => {
        setRows((prev) => ({
            ...prev,
            [serviceId]: {
                ...prev[serviceId],
                durationBlockCount,
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
                    define bloques de tiempo o precio distintos al catálogo.
                    Cada bloque equivale a {timeBlockMinutes} minutos según la
                    configuración del calendario.
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
                        const durationBlockCountId = `${baseId}-duration-${service.id}`;
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
                                                htmlFor={durationBlockCountId}
                                                className="sr-only"
                                            >
                                                Bloques de tiempo para {service.name}
                                            </Label>
                                            <select
                                                id={durationBlockCountId}
                                                value={row.durationBlockCount}
                                                onChange={(e) =>
                                                    setDurationBlockCount(
                                                        service.id,
                                                        e.target.value,
                                                    )
                                                }
                                                className={cn(
                                                    'border-input bg-transparent h-9 rounded-md border px-2 text-sm shadow-xs',
                                                    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none',
                                                    'max-w-[11rem] truncate',
                                                )}
                                            >
                                                <option value="">
                                                    Bloques de tiempo
                                                </option>
                                                {durationBlockOptions.map((option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
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
                        value={durationBlockCountToMinutes(
                            row.durationBlockCount,
                            timeBlockMinutes,
                        )}
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
