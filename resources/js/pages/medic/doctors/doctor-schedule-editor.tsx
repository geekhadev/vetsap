import { Plus, X } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { FormTimePickerField } from '@/components/custom/form-time-picker-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
    SCHEDULE_DAYS
    
    
} from './types';
import type {DoctorScheduleBlock, DoctorScheduleDayOfWeek} from './types';

type DoctorScheduleEditorProps = {
    blocks?: DoctorScheduleBlock[];
};

type ScheduleEntry = {
    id: string;
    day_of_week: DoctorScheduleDayOfWeek;
    starts_at: string;
    ends_at: string;
};

type DraftForm = {
    startsAt: string;
    endsAt: string;
    days: Record<DoctorScheduleDayOfWeek, boolean>;
};

const DEFAULT_DRAFT: DraftForm = {
    startsAt: '09:00',
    endsAt: '13:00',
    days: Object.fromEntries(
        SCHEDULE_DAYS.map((day) => [day.value, false]),
    ) as Record<DoctorScheduleDayOfWeek, boolean>,
};

function emptyDays(): Record<DoctorScheduleDayOfWeek, boolean> {
    return Object.fromEntries(
        SCHEDULE_DAYS.map((day) => [day.value, false]),
    ) as Record<DoctorScheduleDayOfWeek, boolean>;
}

function normalizeTime(value: string): string {
    if (/^\d{2}:\d{2}$/.test(value)) {
        return value;
    }

    const match = /^(\d{2}:\d{2})/.exec(value);

    return match?.[1] ?? value;
}

function blocksToEntries(blocks: DoctorScheduleBlock[] | undefined): ScheduleEntry[] {
    return (blocks ?? []).map((block) => ({
        id: crypto.randomUUID(),
        day_of_week: block.day_of_week,
        starts_at: normalizeTime(block.starts_at),
        ends_at: normalizeTime(block.ends_at),
    }));
}

function groupEntriesByDay(
    entries: ScheduleEntry[],
): Map<DoctorScheduleDayOfWeek, ScheduleEntry[]> {
    const grouped = new Map<DoctorScheduleDayOfWeek, ScheduleEntry[]>();

    for (const day of SCHEDULE_DAYS) {
        grouped.set(day.value, []);
    }

    for (const entry of entries) {
        const existing = grouped.get(entry.day_of_week) ?? [];
        existing.push(entry);
        grouped.set(entry.day_of_week, existing);
    }

    for (const day of SCHEDULE_DAYS) {
        const dayEntries = grouped.get(day.value) ?? [];
        dayEntries.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
        grouped.set(day.value, dayEntries);
    }

    return grouped;
}

function formatEntryLabel(entry: ScheduleEntry): string {
    return `${entry.starts_at} – ${entry.ends_at}`;
}

export function DoctorScheduleEditor({ blocks }: DoctorScheduleEditorProps) {
    const baseId = useId();
    const [entries, setEntries] = useState<ScheduleEntry[]>(() =>
        blocksToEntries(blocks),
    );
    const [draft, setDraft] = useState<DraftForm>({ ...DEFAULT_DRAFT, days: emptyDays() });
    const [draftError, setDraftError] = useState<string | null>(null);

    const previewByDay = useMemo(() => groupEntriesByDay(entries), [entries]);

    const updateDraftField = (field: 'startsAt' | 'endsAt', value: string) => {
        setDraft((prev) => ({ ...prev, [field]: value }));
        setDraftError(null);
    };

    const toggleDraftDay = (day: DoctorScheduleDayOfWeek) => {
        setDraft((prev) => ({
            ...prev,
            days: {
                ...prev.days,
                [day]: !prev.days[day],
            },
        }));
        setDraftError(null);
    };

    const addFromDraft = () => {
        if (draft.startsAt === '' || draft.endsAt === '') {
            setDraftError('Indica hora de inicio y de término.');

            return;
        }

        if (draft.endsAt <= draft.startsAt) {
            setDraftError('La hora de término debe ser posterior a la de inicio.');

            return;
        }

        const selectedDays = SCHEDULE_DAYS.filter((day) => draft.days[day.value]);

        if (selectedDays.length === 0) {
            setDraftError('Selecciona al menos un día.');

            return;
        }

        const newEntries: ScheduleEntry[] = [];

        for (const day of selectedDays) {
            const duplicate = entries.some(
                (entry) =>
                    entry.day_of_week === day.value &&
                    entry.starts_at === draft.startsAt &&
                    entry.ends_at === draft.endsAt,
            );

            if (duplicate) {
                continue;
            }

            newEntries.push({
                id: crypto.randomUUID(),
                day_of_week: day.value,
                starts_at: draft.startsAt,
                ends_at: draft.endsAt,
            });
        }

        if (newEntries.length === 0) {
            setDraftError('Ese horario ya está configurado para los días seleccionados.');

            return;
        }

        setEntries((prev) => [...prev, ...newEntries]);
        setDraft({ ...DEFAULT_DRAFT, days: emptyDays() });
        setDraftError(null);
    };

    const removeEntry = (id: string) => {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
    };

    return (
        <div className="grid gap-4">
            <input type="hidden" name="blocks_present" value="1" />

            <div>
                <Label>Horario semanal</Label>
                <p className="text-muted-foreground text-sm">
                    Configura un rango, elige los días y agrégalo. El horario
                    quedará en la tabla; puedes repetir para otro turno.
                </p>
            </div>

            <div className="rounded-md border p-3">
                <Label className="mb-3 block">Agregar horario</Label>
                <div className="grid gap-3">
                    <div className="relative z-10 flex flex-wrap items-end gap-2">
                        <FormTimePickerField
                            label="Desde"
                            value={draft.startsAt}
                            onChange={(value) =>
                                updateDraftField('startsAt', value)
                            }
                            id={`${baseId}-draft-start`}
                            containerClassName="w-[8.5rem]"
                            triggerClassName="w-full"
                            popoverSide="top"
                        />
                        <FormTimePickerField
                            label="Hasta"
                            value={draft.endsAt}
                            onChange={(value) =>
                                updateDraftField('endsAt', value)
                            }
                            id={`${baseId}-draft-end`}
                            containerClassName="w-[8.5rem]"
                            triggerClassName="w-full"
                            popoverSide="top"
                        />
                    </div>

                    <div className="relative z-0 flex flex-wrap gap-1.5">
                        {SCHEDULE_DAYS.map((day) => {
                            const active = draft.days[day.value];

                            return (
                                <Button
                                    key={day.value}
                                    type="button"
                                    size="sm"
                                    variant={active ? 'default' : 'outline'}
                                    className="min-w-11 px-2"
                                    onClick={() => toggleDraftDay(day.value)}
                                    aria-pressed={active}
                                    title={day.label}
                                >
                                    {day.shortLabel}
                                </Button>
                            );
                        })}
                    </div>

                    {draftError ? (
                        <p className="text-destructive text-sm">{draftError}</p>
                    ) : null}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        onClick={addFromDraft}
                    >
                        <Plus className="size-3.5" />
                        Agregar horario
                    </Button>
                </div>
            </div>

            <div
                className={cn(
                    'overflow-hidden rounded-md border',
                    'max-h-[min(50vh,24rem)] overflow-y-auto',
                )}
            >
                <table className="w-full table-fixed text-sm">
                    <colgroup>
                        <col className="w-[4.25rem]" />
                        <col />
                    </colgroup>
                    <thead className="bg-muted/50 sticky top-0 z-10 border-b">
                        <tr>
                            <th className="px-2 py-2 text-left font-medium">
                                Día
                            </th>
                            <th className="px-3 py-2 text-left font-medium">
                                Horarios
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {SCHEDULE_DAYS.map((day) => {
                            const dayEntries = previewByDay.get(day.value) ?? [];

                            return (
                                <tr
                                    key={day.value}
                                    className="border-b align-top last:border-0"
                                >
                                    <td className="text-muted-foreground px-2 py-2 font-medium">
                                        {day.shortLabel}
                                    </td>
                                    <td className="px-3 py-2">
                                        {dayEntries.length === 0 ? (
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5">
                                                {dayEntries.map((entry) => (
                                                    <Badge
                                                        key={entry.id}
                                                        variant="secondary"
                                                        className="gap-1 pr-1"
                                                    >
                                                        {formatEntryLabel(entry)}
                                                        <button
                                                            type="button"
                                                            className="hover:bg-muted rounded-sm p-0.5"
                                                            title="Quitar horario"
                                                            onClick={() =>
                                                                removeEntry(
                                                                    entry.id,
                                                                )
                                                            }
                                                        >
                                                            <X className="size-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {entries.map((entry, index) => (
                <span key={entry.id} className="hidden">
                    <input
                        type="hidden"
                        name={`blocks[${index}][day_of_week]`}
                        value={entry.day_of_week}
                    />
                    <input
                        type="hidden"
                        name={`blocks[${index}][starts_at]`}
                        value={entry.starts_at}
                    />
                    <input
                        type="hidden"
                        name={`blocks[${index}][ends_at]`}
                        value={entry.ends_at}
                    />
                </span>
            ))}
        </div>
    );
}
