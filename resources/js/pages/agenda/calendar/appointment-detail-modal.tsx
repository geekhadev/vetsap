import { format } from 'date-fns';
import {
    ArrowRight,
    Mail,
    MapPin,
    Phone,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import type { CalendarHoliday } from '@/components/custom/full-calendar/types';
import { formatPatientSexLabel } from '@/components/custom/patient-sex-badge/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
    appointmentStatusColorToDotClass,
} from '@/lib/appointment-status-colors';
import { cn } from '@/lib/utils';
import { AppointmentScheduleAutosaveField } from '@/pages/agenda/calendar/appointment-schedule-field';
import { AppointmentStatusSelector } from '@/pages/agenda/calendar/appointment-status-selector';
import { useAppointmentDetail } from '@/pages/agenda/calendar/hooks/use-appointment-detail';
import { useChangeAppointmentStatus } from '@/pages/agenda/calendar/hooks/use-change-appointment-status';
import { useDeleteAppointment } from '@/pages/agenda/calendar/hooks/use-delete-appointment';
import { useRescheduleAppointment } from '@/pages/agenda/calendar/hooks/use-reschedule-appointment';
import type {
    AppointmentDetail,
    AppointmentScheduleValue,
    AppointmentStatusOption,
} from '@/pages/agenda/calendar/types';

type AppointmentDetailModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointmentId: string | null;
    appointmentStatuses: AppointmentStatusOption[];
    holidays: CalendarHoliday[];
    canUpdate: boolean;
    canDelete: boolean;
};

function formatBirthDate(value: string | null): string {
    if (value === null || value.trim() === '') {
        return '—';
    }

    const parsed = new Date(`${value}T12:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return '—';
    }

    return format(parsed, 'dd/MM/yyyy');
}

function joinDetailParts(parts: Array<string | null | undefined>): string {
    return parts
        .map((part) => part?.trim())
        .filter((part) => part !== undefined && part !== '')
        .join(' | ');
}

function DetailSection({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('overflow-hidden rounded-md border', className)}>
            {children}
        </div>
    );
}

function DetailRow({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('px-3 py-2 text-sm', className)}>{children}</div>
    );
}

function AppointmentDetailContent({
    appointment,
    appointmentStatuses,
    canUpdate,
    canDelete,
    statusChanging,
    statusChangeError,
    rescheduling,
    rescheduleError,
    deleting,
    deleteError,
    holidays,
    onStatusChange,
    onScheduleChange,
    onDelete,
    scheduleFieldKey,
}: {
    appointment: AppointmentDetail;
    appointmentStatuses: AppointmentStatusOption[];
    canUpdate: boolean;
    canDelete: boolean;
    statusChanging: boolean;
    statusChangeError: string | null;
    rescheduling: boolean;
    rescheduleError: string | null;
    deleting: boolean;
    deleteError: string | null;
    holidays: CalendarHoliday[];
    scheduleFieldKey: number;
    onStatusChange: (statusId: string) => void;
    onScheduleChange: (schedule: AppointmentScheduleValue) => void;
    onDelete: () => void;
}) {
    const patientMeta = joinDetailParts([
        formatPatientSexLabel(appointment.patient.sex),
        appointment.patient.age_years !== null
            ? `${appointment.patient.age_years} años`
            : null,
        appointment.patient.weight_kg
            ? `${appointment.patient.weight_kg} kg`
            : null,
        appointment.patient.colors || null,
        appointment.patient.blood_type || null,
    ]);

    const patientIdentifiers = joinDetailParts([
        `Ficha: ${appointment.patient.record_number}`,
        appointment.patient.microchip_number
            ? `Chip: ${appointment.patient.microchip_number}`
            : 'Chip:',
        `Cumpleaños: ${formatBirthDate(appointment.patient.birth_date)}`,
    ]);

    return (
        <div className="space-y-4">
            <AppointmentScheduleAutosaveField
                key={`${appointment.starts_at}-${scheduleFieldKey}`}
                startsAt={appointment.starts_at}
                durationMinutes={appointment.duration_minutes}
                doctorScheduleWindows={appointment.doctor.schedule_windows}
                holidays={holidays}
                canUpdate={canUpdate && !appointment.status.is_terminal}
                saving={rescheduling}
                error={rescheduleError}
                onCommit={onScheduleChange}
            />

            {canUpdate ? (
                <div className="space-y-1">
                    <AppointmentStatusSelector
                        currentStatus={appointment.status}
                        statuses={appointmentStatuses}
                        changing={statusChanging}
                        onStatusChange={onStatusChange}
                    />
                    {statusChangeError ? (
                        <p className="text-destructive text-xs" role="alert">
                            {statusChangeError}
                        </p>
                    ) : null}
                </div>
            ) : (
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                    <span
                        aria-hidden
                        className={cn(
                            'size-2.5 shrink-0 rounded-full',
                            appointmentStatusColorToDotClass(
                                appointment.status.color,
                            ),
                        )}
                    />
                    <span className="truncate">
                        Cita · {appointment.status.name}
                    </span>
                </div>
            )}

            <DetailSection>
                <DetailRow className="text-base font-medium text-primary">
                    {appointment.patient.name}
                </DetailRow>
                {patientMeta ? (
                    <DetailRow className="border-t text-muted-foreground">
                        {patientMeta}
                    </DetailRow>
                ) : null}
                <DetailRow className="border-t text-muted-foreground">
                    {patientIdentifiers}
                </DetailRow>
            </DetailSection>

            <DetailSection>
                <DetailRow className="text-base font-medium text-primary">
                    {appointment.customer.name}
                </DetailRow>
                {appointment.customer.phone ? (
                    <DetailRow className="flex items-center gap-2 border-t text-muted-foreground">
                        <Phone aria-hidden className="size-4 shrink-0" />
                        <span>{appointment.customer.phone}</span>
                    </DetailRow>
                ) : null}
                {appointment.customer.email ? (
                    <DetailRow className="flex items-center gap-2 border-t text-muted-foreground">
                        <Mail aria-hidden className="size-4 shrink-0" />
                        <span className="break-all">
                            {appointment.customer.email}
                        </span>
                    </DetailRow>
                ) : null}
                {appointment.customer.address ? (
                    <DetailRow className="flex items-start gap-2 border-t text-muted-foreground">
                        <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                        <span>{appointment.customer.address}</span>
                    </DetailRow>
                ) : null}
            </DetailSection>

            <DetailSection>
                <DetailRow>
                    <span className="text-muted-foreground">Doctor: </span>
                    <span className="font-medium text-primary">
                        {appointment.doctor.label}
                    </span>
                </DetailRow>
            </DetailSection>

            <DetailSection>
                <DetailRow className="border-b font-medium">Servicio</DetailRow>
                <DetailRow className="flex items-center justify-between gap-3">
                    <span>{appointment.service.name}</span>
                    <CurrencyDisplay
                        value={appointment.price}
                        className="shrink-0 font-medium"
                    />
                </DetailRow>
            </DetailSection>

            {appointment.notes ? (
                <DetailSection>
                    <DetailRow className="border-b font-medium">
                        Notas internas
                    </DetailRow>
                    <DetailRow className="whitespace-pre-wrap text-muted-foreground">
                        {appointment.notes}
                    </DetailRow>
                </DetailSection>
            ) : null}

            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                {canDelete ? (
                    <div className="space-y-1">
                        <Button
                            type="button"
                            variant="outline"
                            className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                            disabled={deleting}
                            onClick={onDelete}
                        >
                            <Trash2 aria-hidden className="size-4" />
                            Eliminar cita
                        </Button>
                        {deleteError ? (
                            <p className="text-destructive text-xs" role="alert">
                                {deleteError}
                            </p>
                        ) : null}
                    </div>
                ) : (
                    <span aria-hidden />
                )}
                <Button type="button" className="gap-2">
                    Iniciar atención
                    <ArrowRight aria-hidden className="size-4" />
                </Button>
            </div>
        </div>
    );
}

function AppointmentDetailSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
    );
}

export function AppointmentDetailModal({
    open,
    onOpenChange,
    appointmentId,
    appointmentStatuses,
    holidays,
    canUpdate,
    canDelete,
}: AppointmentDetailModalProps) {
    const { appointment, setAppointment, loading, error, fetchAppointment, reset } =
        useAppointmentDetail();
    const {
        changeStatus,
        changing: statusChanging,
        error: statusChangeError,
        clearError: clearStatusChangeError,
    } = useChangeAppointmentStatus();
    const {
        reschedule,
        rescheduling,
        error: rescheduleError,
        clearError: clearRescheduleError,
    } = useRescheduleAppointment();
    const {
        deleteAppointment,
        deleting,
        error: deleteError,
        clearError: clearDeleteError,
    } = useDeleteAppointment({
        onDeleted: () => {
            onOpenChange(false);
        },
    });
    const [scheduleFieldKey, setScheduleFieldKey] = useState(0);

    const handleStatusChange = useCallback(
        async (statusId: string) => {
            if (appointment === null || appointmentId === null) {
                return;
            }

            const updated = await changeStatus(appointmentId, statusId);

            if (updated !== null) {
                setAppointment(updated);
            }
        },
        [appointment, appointmentId, changeStatus, setAppointment],
    );

    const handleScheduleChange = useCallback(
        async (schedule: AppointmentScheduleValue) => {
            if (appointment === null || appointmentId === null) {
                return;
            }

            const updated = await reschedule(appointmentId, schedule);

            if (updated !== null) {
                setAppointment(updated);
            } else {
                setScheduleFieldKey((current) => current + 1);
            }
        },
        [appointment, appointmentId, reschedule, setAppointment],
    );

    const handleDelete = useCallback(() => {
        if (appointment === null || appointmentId === null) {
            return;
        }

        const startsAt = new Date(appointment.starts_at);
        const formattedDate = Number.isNaN(startsAt.getTime())
            ? appointment.starts_at
            : format(startsAt, "dd/MM/yyyy 'a las' HH:mm");

        deleteAppointment(
            appointmentId,
            `¿Eliminar la cita de ${appointment.patient.name} del ${formattedDate}? Esta acción no se puede deshacer.`,
        );
    }, [appointment, appointmentId, deleteAppointment]);

    useEffect(() => {
        if (!open || appointmentId === null) {
            return;
        }

        clearStatusChangeError();
        clearRescheduleError();
        clearDeleteError();
        void fetchAppointment(appointmentId);
    }, [
        open,
        appointmentId,
        fetchAppointment,
        clearStatusChangeError,
        clearRescheduleError,
        clearDeleteError,
    ]);

    useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-y-auto sm:max-w-lg">
                <DialogHeader className="sr-only">
                    <DialogTitle>Detalle de cita</DialogTitle>
                    <DialogDescription>
                        Información de la cita seleccionada en el calendario.
                    </DialogDescription>
                </DialogHeader>

                {loading ? <AppointmentDetailSkeleton /> : null}

                {!loading && error ? (
                    <p className="text-destructive text-sm" role="alert">
                        {error}
                    </p>
                ) : null}

                {!loading && appointment ? (
                    <AppointmentDetailContent
                        appointment={appointment}
                        appointmentStatuses={appointmentStatuses}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                        statusChanging={statusChanging}
                        statusChangeError={statusChangeError}
                        rescheduling={rescheduling}
                        rescheduleError={rescheduleError}
                        deleting={deleting}
                        deleteError={deleteError}
                        holidays={holidays}
                        scheduleFieldKey={scheduleFieldKey}
                        onStatusChange={handleStatusChange}
                        onScheduleChange={handleScheduleChange}
                        onDelete={handleDelete}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
