import { CalendarPlus } from 'lucide-react';
import type { FormEvent } from 'react';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useRequestAppointment } from './use-request-appointment';

type RequestAppointmentDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function formatDayLabel(dateKey: string): { weekday: string; day: string; month: string } {
    const date = new Date(`${dateKey}T12:00:00`);

    return {
        weekday: WEEKDAY_LABELS[date.getDay()] ?? '',
        day: String(date.getDate()),
        month: date.toLocaleDateString('es-CL', { month: 'short' }),
    };
}

export function RequestAppointmentDialog({
    open,
    onOpenChange,
}: RequestAppointmentDialogProps) {
    const booking = useRequestAppointment({ open });
    const availableDateSet = new Set(booking.availableDates);

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        const ok = await booking.submit();

        if (ok) {
            onOpenChange(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="shrink-0 border-b px-6 py-4">
                    <DialogTitle>Pedir cita</DialogTitle>
                    <DialogDescription>
                        Elige la mascota, el servicio y un horario disponible.
                    </DialogDescription>
                </DialogHeader>

                {booking.loading ? (
                    <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
                        <Spinner />
                        Cargando disponibilidad…
                    </div>
                ) : booking.loadError ? (
                    <div className="space-y-4 px-6 py-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            No pudimos cargar las opciones para pedir cita.
                        </p>
                        <Button type="button" variant="outline" onClick={() => void booking.loadOptions()}>
                            Reintentar
                        </Button>
                    </div>
                ) : booking.pets.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                        Aún no tienes mascotas asociadas para pedir una cita.
                    </div>
                ) : booking.services.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                        Esta clínica no tiene servicios disponibles para agendar en línea.
                    </div>
                ) : (
                    <form
                        onSubmit={(event) => void handleSubmit(event)}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-4">
                            <FormSelect
                                label="Mascota"
                                required
                                error={booking.fieldErrors.patient_id}
                                options={booking.pets.map((pet) => ({
                                    value: pet.id,
                                    label: pet.species
                                        ? `${pet.name} · ${pet.species}`
                                        : pet.name,
                                }))}
                                placeholder="Selecciona una mascota"
                                selectProps={{
                                    value: booking.patientId,
                                    onChange: (event) => {
                                        booking.setPatientId(event.target.value);
                                    },
                                }}
                            />

                            <FormSelect
                                label="Servicio"
                                required
                                error={booking.fieldErrors.service_id}
                                options={booking.services.map((service) => ({
                                    value: service.id,
                                    label: service.name,
                                }))}
                                placeholder="Selecciona un servicio"
                                selectProps={{
                                    value: booking.serviceId ?? '',
                                    onChange: (event) => {
                                        booking.selectService(event.target.value);
                                    },
                                }}
                            />

                            <div className="grid gap-2">
                                <Label>
                                    Día
                                    <span aria-hidden="true"> (*)</span>
                                </Label>
                                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                                    {booking.calendarDates.map((dateKey) => {
                                        const { weekday, day, month } =
                                            formatDayLabel(dateKey);
                                        const isAvailable = availableDateSet.has(dateKey);
                                        const isSelected = booking.date === dateKey;

                                        return (
                                            <button
                                                key={dateKey}
                                                type="button"
                                                disabled={!isAvailable}
                                                onClick={() => booking.selectDate(dateKey)}
                                                className={cn(
                                                    'flex min-w-[4.5rem] shrink-0 flex-col items-center gap-0.5 rounded-lg border px-2 py-2 text-center transition-colors',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : isAvailable
                                                          ? 'border-border bg-background hover:bg-muted'
                                                          : 'cursor-not-allowed border-border/60 bg-muted/40 text-muted-foreground opacity-50',
                                                )}
                                            >
                                                <span className="text-[10px] font-medium uppercase opacity-80">
                                                    {weekday}
                                                </span>
                                                <span className="text-sm font-semibold leading-none">
                                                    {day} {month}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {booking.fieldErrors.appointment_date ? (
                                    <p className="text-sm text-destructive">
                                        {booking.fieldErrors.appointment_date}
                                    </p>
                                ) : null}
                            </div>

                            {booking.date ? (
                                booking.blockRows.length === 0 ? (
                                    <p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
                                        No hay horarios disponibles para este día.
                                    </p>
                                ) : (
                                    <FormSelect
                                        label="Horario"
                                        required
                                        error={
                                            booking.fieldErrors.starts_at_time ??
                                            booking.fieldErrors.doctor_id
                                        }
                                        options={booking.blockRows.flatMap((row) => {
                                            const primarySlot = row.slots[0];

                                            if (!primarySlot) {
                                                return [];
                                            }

                                            const label =
                                                booking.selectedService &&
                                                booking.selectedService.blockCount > 1
                                                    ? `${row.startTime} – ${row.endTime}`
                                                    : row.startTime;

                                            return [
                                                {
                                                    value: primarySlot.id,
                                                    label,
                                                },
                                            ];
                                        })}
                                        placeholder="Selecciona un horario"
                                        selectProps={{
                                            value: booking.slotId ?? '',
                                            onChange: (event) => {
                                                const nextSlotId = event.target.value;
                                                const slot = booking.blockRows
                                                    .flatMap((row) => row.slots)
                                                    .find(
                                                        (item) => item.id === nextSlotId,
                                                    );

                                                if (slot) {
                                                    booking.selectSlot(slot);
                                                }
                                            },
                                        }}
                                    />
                                )
                            ) : null}

                        </div>

                        <div className="shrink-0 border-t px-6 py-4">
                            <FormDialogFooter
                                onCancel={() => onOpenChange(false)}
                                processing={booking.submitting}
                                submitDisabled={!booking.canSubmit}
                                submitIcon={<CalendarPlus />}
                                submitLabel="Pedir cita"
                                submitLabelLoading="Solicitando…"
                            />
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
