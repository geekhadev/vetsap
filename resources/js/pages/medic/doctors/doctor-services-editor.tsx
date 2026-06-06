import { useId, useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DoctorServiceAssignment, ServiceOption } from './types';

type DoctorServicesEditorProps = {
    serviceOptions: ServiceOption[];
    assigned?: DoctorServiceAssignment[];
};

type RowState = {
    selected: boolean;
    override: string;
};

function buildInitialState(
    serviceOptions: ServiceOption[],
    assigned: DoctorServiceAssignment[] | undefined,
): Record<string, RowState> {
    const assignedMap = new Map(
        (assigned ?? []).map((s) => [
            s.id,
            s.pivot.duration_override_minutes != null
                ? String(s.pivot.duration_override_minutes)
                : '',
        ]),
    );

    const state: Record<string, RowState> = {};

    for (const option of serviceOptions) {
        const override = assignedMap.get(option.id);
        state[option.id] = {
            selected: override !== undefined,
            override: override ?? '',
        };
    }

    return state;
}

export function DoctorServicesEditor({
    serviceOptions,
    assigned,
}: DoctorServicesEditorProps) {
    const baseId = useId();
    const [rows, setRows] = useState(() =>
        buildInitialState(serviceOptions, assigned),
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

    const setOverride = (serviceId: string, override: string) => {
        setRows((prev) => ({
            ...prev,
            [serviceId]: {
                ...prev[serviceId],
                override,
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
                    Marca los servicios y opcionalmente define una duración
                    distinta a la del catálogo (minutos).
                </p>
            </div>
            <ul className="divide-y rounded-md border">
                {serviceOptions.map((service) => {
                    const row = rows[service.id];
                    const checkboxId = `${baseId}-service-${service.id}`;

                    return (
                        <li
                            key={service.id}
                            className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex min-w-0 items-start gap-3">
                                <Checkbox
                                    id={checkboxId}
                                    checked={row?.selected ?? false}
                                    onCheckedChange={(checked) =>
                                        toggle(service.id, checked === true)
                                    }
                                />
                                <div className="grid min-w-0 gap-0.5">
                                    <Label
                                        htmlFor={checkboxId}
                                        className="cursor-pointer font-medium"
                                    >
                                        {service.name}
                                    </Label>
                                    <span className="text-muted-foreground text-xs">
                                        Catálogo:{' '}
                                        {service.duration_minutes != null
                                            ? `${service.duration_minutes} min`
                                            : 'sin duración'}
                                    </span>
                                </div>
                            </div>
                            {row?.selected ? (
                                <div className="flex shrink-0 items-center gap-2 sm:w-40">
                                    <Label
                                        htmlFor={`${baseId}-override-${service.id}`}
                                        className="sr-only"
                                    >
                                        Duración override para {service.name}
                                    </Label>
                                    <Input
                                        id={`${baseId}-override-${service.id}`}
                                        type="number"
                                        min={1}
                                        max={1440}
                                        placeholder="Override min"
                                        value={row.override}
                                        onChange={(e) =>
                                            setOverride(
                                                service.id,
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            ) : null}
                        </li>
                    );
                })}
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
                        value={row.override}
                    />
                </span>
            ))}
        </div>
    );
}
