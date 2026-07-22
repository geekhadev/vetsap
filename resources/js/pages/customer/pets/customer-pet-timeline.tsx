import {
    CalendarClock,
    FilePenLine,
    Stethoscope,
    Syringe,
} from 'lucide-react';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { DateDisplay } from '@/components/custom/date-display';
import { Badge } from '@/components/ui/badge';
import {
    APPOINTMENT_STATUS_COLOR_BADGE_CLASS,
} from '@/lib/appointment-status-colors';
import type { AppointmentStatusColorValue } from '@/lib/appointment-status-colors';
import { cn } from '@/lib/utils';
import { formatAttentionDuration } from '@/pages/medic/patients/attention-view-helpers';
import type {
    AttentionSummary,
    PatientAppointmentSummary,
    PatientVaccinationDoseSummary,
    VaccinationDoseSource,
    VaccinationDoseStatus,
} from '@/pages/medic/patients/types';

type CustomerPetTimelineProps = {
    attentions: AttentionSummary[];
    appointments: PatientAppointmentSummary[];
    vaccinationDoses: PatientVaccinationDoseSummary[];
};

type TimelineEntry =
    | { kind: 'attention'; sortAt: string; attention: AttentionSummary }
    | { kind: 'appointment'; sortAt: string; appointment: PatientAppointmentSummary }
    | { kind: 'vaccination'; sortAt: string; dose: PatientVaccinationDoseSummary };

const VACCINATION_STATUS_LABEL: Record<VaccinationDoseStatus, string> = {
    scheduled: 'Programada',
    due: 'Por aplicar',
    overdue: 'Vencida',
    administered: 'Aplicada',
    omitted: 'Omitida',
};

const VACCINATION_STATUS_COLOR: Record<
    VaccinationDoseStatus,
    AppointmentStatusColorValue
> = {
    scheduled: 'slate',
    due: 'teal',
    overdue: 'red',
    administered: 'emerald',
    omitted: 'slate',
};

const VACCINATION_SOURCE_LABEL: Record<VaccinationDoseSource, string> = {
    protocol: 'Protocolo',
    manual: 'Manual',
};

function toSortableMs(value: string): number {
    const ms = Date.parse(value);

    return Number.isNaN(ms) ? 0 : ms;
}

function dayKey(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value.slice(0, 10);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function attentionMoment(attention: AttentionSummary): string {
    return attention.closed_at ?? attention.started_at ?? attention.created_at;
}

function vaccinationMoment(dose: PatientVaccinationDoseSummary): string {
    if (dose.status === 'administered' && dose.administered_on) {
        return dose.administered_on;
    }

    if (dose.appointment_starts_at) {
        return dose.appointment_starts_at;
    }

    return dose.scheduled_on;
}

function isUpcomingAppointment(startsAt: string): boolean {
    const ms = Date.parse(startsAt);

    return !Number.isNaN(ms) && ms > Date.now();
}

export function CustomerPetTimeline({
    attentions,
    appointments,
    vaccinationDoses,
}: CustomerPetTimelineProps) {
    const entries = useMemo(() => {
        const linkedAppointmentIds = new Set(
            vaccinationDoses
                .map((dose) => dose.appointment_id)
                .filter((id): id is string => id != null && id !== ''),
        );

        const items: TimelineEntry[] = [
            ...attentions.map((attention) => ({
                kind: 'attention' as const,
                sortAt: attentionMoment(attention),
                attention,
            })),
            ...appointments
                .filter((appointment) => !linkedAppointmentIds.has(appointment.id))
                .map((appointment) => ({
                    kind: 'appointment' as const,
                    sortAt: appointment.starts_at,
                    appointment,
                })),
            ...vaccinationDoses
                .filter((dose) => dose.status !== 'omitted')
                .map((dose) => ({
                    kind: 'vaccination' as const,
                    sortAt: vaccinationMoment(dose),
                    dose,
                })),
        ].sort(
            (left, right) => toSortableMs(right.sortAt) - toSortableMs(left.sortAt),
        );

        return items.map((entry, index) => {
            const currentDay = dayKey(entry.sortAt);
            const previousDay =
                index > 0 ? dayKey(items[index - 1]!.sortAt) : null;

            return {
                ...entry,
                showDayLabel: currentDay !== previousDay,
            };
        });
    }, [appointments, attentions, vaccinationDoses]);

    if (entries.length === 0) {
        return (
            <p className="text-muted-foreground py-6 text-center text-sm">
                Sin atenciones, citas ni vacunas registradas.
            </p>
        );
    }

    return (
        <ol className="flex flex-col gap-3">
            {entries.map((entry) => {
                const key =
                    entry.kind === 'attention'
                        ? `attention-${entry.attention.id}`
                        : entry.kind === 'appointment'
                          ? `appointment-${entry.appointment.id}`
                          : `vaccination-${entry.dose.id}`;

                return (
                    <li key={key} className="flex flex-col gap-2">
                        {entry.showDayLabel ? (
                            <div className="flex items-center gap-3 pt-1">
                                <DateDisplay
                                    value={entry.sortAt}
                                    mode="date"
                                    className="text-foreground text-sm font-semibold tabular-nums"
                                />
                                <span
                                    className="bg-border h-px flex-1"
                                    aria-hidden
                                />
                            </div>
                        ) : null}

                        {entry.kind === 'attention' ? (
                            <AttentionCard
                                attention={entry.attention}
                                sortAt={entry.sortAt}
                            />
                        ) : null}
                        {entry.kind === 'appointment' ? (
                            <AppointmentCard appointment={entry.appointment} />
                        ) : null}
                        {entry.kind === 'vaccination' ? (
                            <VaccinationCard
                                dose={entry.dose}
                                sortAt={entry.sortAt}
                            />
                        ) : null}
                    </li>
                );
            })}
        </ol>
    );
}

function TimelineCardShell({
    icon,
    iconClassName,
    borderClassName,
    title,
    subtitle,
    meta,
    badges,
}: {
    icon: React.ReactNode;
    iconClassName: string;
    borderClassName?: string;
    title: string;
    subtitle: string;
    meta: ReactNode;
    badges?: ReactNode;
}) {
    return (
        <div
            className={cn(
                'bg-card flex gap-3 rounded-xl border p-3.5 shadow-xs',
                borderClassName,
            )}
        >
            <div
                className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-lg border',
                    iconClassName,
                )}
            >
                {icon}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
                <div className="space-y-0.5">
                    <h4 className="text-sm leading-snug font-medium text-balance">
                        {title}
                    </h4>
                    <p className="text-muted-foreground text-xs leading-snug text-pretty">
                        {subtitle}
                    </p>
                </div>
                <div className="text-muted-foreground text-xs tabular-nums">
                    {meta}
                </div>
                {badges ? (
                    <div className="flex flex-wrap gap-1.5">{badges}</div>
                ) : null}
            </div>
        </div>
    );
}

function StatusBadge({
    label,
    color,
}: {
    label: string;
    color: AppointmentStatusColorValue;
}) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-normal',
                APPOINTMENT_STATUS_COLOR_BADGE_CLASS[color],
            )}
        >
            {label}
        </Badge>
    );
}

function AttentionCard({
    attention,
    sortAt,
}: {
    attention: AttentionSummary;
    sortAt: string;
}) {
    const isDraft = attention.status === 'draft';
    const title =
        attention.template_name?.trim() ||
        (isDraft ? 'Atención en borrador' : 'Atención clínica');
    const subtitle = attention.doctor_name?.trim()
        ? `Médico: ${attention.doctor_name}`
        : 'Sin médico asignado';

    return (
        <TimelineCardShell
            icon={
                isDraft ? (
                    <FilePenLine className="size-4" aria-hidden />
                ) : (
                    <Stethoscope className="size-4" aria-hidden />
                )
            }
            iconClassName={
                isDraft
                    ? APPOINTMENT_STATUS_COLOR_BADGE_CLASS.amber
                    : APPOINTMENT_STATUS_COLOR_BADGE_CLASS.blue
            }
            borderClassName={
                isDraft ? 'border-amber-200/90 dark:border-amber-900/40' : undefined
            }
            title={title}
            subtitle={subtitle}
            meta={
                isDraft ? (
                    <span className="text-amber-700 dark:text-amber-300">
                        Borrador
                    </span>
                ) : (
                    <span>
                        <DateDisplay value={sortAt} mode="time" />
                        {' · '}
                        {formatAttentionDuration(
                            attention.started_at,
                            attention.closed_at,
                        )}
                    </span>
                )
            }
            badges={
                <>
                    <StatusBadge
                        label={isDraft ? 'Borrador' : 'Atención'}
                        color={isDraft ? 'amber' : 'blue'}
                    />
                    {attention.requested_exams.map((exam) => (
                        <StatusBadge
                            key={exam.id}
                            label={exam.name}
                            color={exam.is_uploaded ? 'emerald' : 'amber'}
                        />
                    ))}
                </>
            }
        />
    );
}

function AppointmentCard({
    appointment,
}: {
    appointment: PatientAppointmentSummary;
}) {
    const upcoming = isUpcomingAppointment(appointment.starts_at);
    const title = appointment.service_name?.trim() || 'Cita programada';
    const subtitle = [
        appointment.doctor_name?.trim()
            ? `Médico: ${appointment.doctor_name}`
            : 'Sin médico asignado',
        appointment.status_name?.trim() || null,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <TimelineCardShell
            icon={<CalendarClock className="size-4" aria-hidden />}
            iconClassName={
                upcoming
                    ? APPOINTMENT_STATUS_COLOR_BADGE_CLASS.teal
                    : APPOINTMENT_STATUS_COLOR_BADGE_CLASS.orange
            }
            borderClassName={
                upcoming
                    ? 'border-teal-200/80 dark:border-teal-900/40'
                    : 'border-orange-200/90 dark:border-orange-900/40'
            }
            title={title}
            subtitle={subtitle}
            meta={<DateDisplay value={appointment.starts_at} mode="time" />}
            badges={
                <StatusBadge
                    label={upcoming ? 'Cita futura' : 'Cita pendiente'}
                    color={upcoming ? 'teal' : 'orange'}
                />
            }
        />
    );
}

function VaccinationCard({
    dose,
    sortAt,
}: {
    dose: PatientVaccinationDoseSummary;
    sortAt: string;
}) {
    const statusLabel = VACCINATION_STATUS_LABEL[dose.status];
    const statusColor = VACCINATION_STATUS_COLOR[dose.status];
    const isAdministered = dose.status === 'administered';
    const isExternal = isAdministered && dose.administered_origin === 'external';
    const subtitle = [
        dose.plan_name,
        dose.series_label,
        VACCINATION_SOURCE_LABEL[dose.source],
    ]
        .filter((part): part is string => part != null && part.trim() !== '')
        .join(' · ');

    return (
        <TimelineCardShell
            icon={<Syringe className="size-4" aria-hidden />}
            iconClassName={APPOINTMENT_STATUS_COLOR_BADGE_CLASS[statusColor]}
            borderClassName={cn(
                dose.status === 'overdue' &&
                    'border-red-200/90 dark:border-red-900/40',
                dose.status === 'due' &&
                    'border-teal-200/80 dark:border-teal-900/40',
                isAdministered &&
                    'border-emerald-200/80 dark:border-emerald-900/40',
            )}
            title={dose.product_name}
            subtitle={subtitle}
            meta={
                <DateDisplay
                    value={sortAt}
                    mode={dose.appointment_starts_at ? 'time' : 'date'}
                />
            }
            badges={
                <>
                    <StatusBadge
                        label={isExternal ? 'Aplicada · Externo' : statusLabel}
                        color={statusColor}
                    />
                    {dose.appointment_id && !dose.appointment_misaligned ? (
                        <StatusBadge label="Con cita" color="slate" />
                    ) : null}
                    {dose.appointment_misaligned ? (
                        <StatusBadge label="Cita desfasada" color="amber" />
                    ) : null}
                </>
            }
        />
    );
}
