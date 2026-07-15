import {
    CalendarClock,
    Check,
    ChevronRight,
    FilePenLine,
    Stethoscope,
} from 'lucide-react';
import { useMemo } from 'react';
import { DateDisplay } from '@/components/custom/date-display';
import { Badge } from '@/components/ui/badge';
import { APPOINTMENT_STATUS_COLOR_BADGE_CLASS } from '@/lib/appointment-status-colors';
import { cn } from '@/lib/utils';
import { formatAttentionDuration } from '@/pages/medic/patients/attention-view-helpers';
import type {
    AttentionRequestedExam,
    AttentionSummary,
    FutureAppointmentSummary,
} from '@/pages/medic/patients/types';

type TimelineAttentionEntry = {
    kind: 'attention';
    sortAt: string;
    attention: AttentionSummary;
};

type TimelineAppointmentEntry = {
    kind: 'appointment';
    sortAt: string;
    appointment: FutureAppointmentSummary;
};

type TimelineEntry = TimelineAttentionEntry | TimelineAppointmentEntry;

type PatientClinicalTimelineProps = {
    attentions: AttentionSummary[];
    futureAppointments: FutureAppointmentSummary[];
    onAttentionSelect?: (attention: AttentionSummary) => void;
    onDraftSelect?: (attention: AttentionSummary) => void;
    onAppointmentSelect?: (appointment: FutureAppointmentSummary) => void;
};

function attentionTimelineMoment(attention: AttentionSummary): string {
    return attention.closed_at ?? attention.started_at ?? attention.created_at;
}

function toSortableMs(value: string): number {
    const ms = Date.parse(value);

    return Number.isNaN(ms) ? 0 : ms;
}

export function PatientClinicalTimeline({
    attentions,
    futureAppointments,
    onAttentionSelect,
    onDraftSelect,
    onAppointmentSelect,
}: PatientClinicalTimelineProps) {
    const entries = useMemo<TimelineEntry[]>(() => {
        const attentionEntries: TimelineEntry[] = attentions.map((attention) => ({
            kind: 'attention',
            sortAt: attentionTimelineMoment(attention),
            attention,
        }));

        const appointmentEntries: TimelineEntry[] = futureAppointments.map(
            (appointment) => ({
                kind: 'appointment',
                sortAt: appointment.starts_at,
                appointment,
            }),
        );

        return [...attentionEntries, ...appointmentEntries].sort(
            (left, right) => toSortableMs(right.sortAt) - toSortableMs(left.sortAt),
        );
    }, [attentions, futureAppointments]);

    if (entries.length === 0) {
        return (
            <p className="text-muted-foreground mx-auto w-full max-w-2xl text-center text-sm">
                Sin atenciones ni citas registradas.
            </p>
        );
    }

    return (
        <ol className="mx-auto flex w-full max-w-2xl flex-col">
            {entries.map((entry, index) => {
                const isFirst = index === 0;
                const isLast = index === entries.length - 1;

                if (entry.kind === 'appointment') {
                    const appointment = entry.appointment;
                    const serviceLabel =
                        appointment.service_name?.trim() || 'Cita programada';
                    const doctorLabel = appointment.doctor_name?.trim()
                        ? `Médico: ${appointment.doctor_name}`
                        : 'Sin médico asignado';
                    const statusLabel = appointment.status_name?.trim() || 'Cita';

                    return (
                        <li
                            key={`appointment-${appointment.id}`}
                            className={cn(
                                'grid grid-cols-[minmax(0,9.5rem)_1rem_minmax(0,1fr)] items-center gap-x-4 sm:gap-x-6',
                                !isLast && 'mb-6',
                            )}
                        >
                            <div className="flex min-w-0 flex-col items-end justify-center gap-1 text-right">
                                <DateDisplay
                                    value={appointment.starts_at}
                                    mode="datetime"
                                    className="text-muted-foreground text-sm leading-none font-medium whitespace-nowrap tabular-nums"
                                />
                                <span className="text-teal-700 dark:text-teal-300 text-xs leading-none whitespace-nowrap">
                                    Cita futura
                                </span>
                            </div>

                            <TimelineRail isFirst={isFirst} isLast={isLast} />

                            <div className="flex min-w-0 items-center">
                                <button
                                    type="button"
                                    className="bg-card hover:bg-accent cursor-pointer focus-visible:ring-ring inline-flex w-full items-center gap-3 rounded-xl border border-teal-200/80 p-3 text-left shadow-xs transition-colors hover:border-teal-300 focus-visible:ring-2 focus-visible:outline-hidden dark:border-teal-900/40 dark:hover:border-teal-800"
                                    onClick={() => onAppointmentSelect?.(appointment)}
                                    aria-label={`Ver cita: ${serviceLabel}`}
                                >
                                    <div
                                        className={cn(
                                            'flex size-10 shrink-0 items-center justify-center rounded-lg border',
                                            APPOINTMENT_STATUS_COLOR_BADGE_CLASS.teal,
                                        )}
                                    >
                                        <CalendarClock className="size-4" aria-hidden />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-medium">
                                            {serviceLabel}
                                        </h3>
                                        <p className="text-muted-foreground truncate text-xs">
                                            {doctorLabel}
                                            {' · '}
                                            {statusLabel}
                                        </p>
                                    </div>

                                    <ChevronRight
                                        className="text-muted-foreground size-4 shrink-0"
                                        aria-hidden
                                    />
                                </button>
                            </div>
                        </li>
                    );
                }

                const attention = entry.attention;
                const isDraft = attention.status === 'draft';
                const timelineMoment = entry.sortAt;
                const templateLabel =
                    attention.template_name?.trim() ||
                    (isDraft ? 'Atención en borrador' : 'Atención clínica');
                const doctorLabel = attention.doctor_name?.trim()
                    ? `Médico: ${attention.doctor_name}`
                    : 'Sin médico asignado';
                const Icon = isDraft ? FilePenLine : Stethoscope;
                const badgeClass = isDraft
                    ? APPOINTMENT_STATUS_COLOR_BADGE_CLASS.amber
                    : APPOINTMENT_STATUS_COLOR_BADGE_CLASS.blue;

                return (
                    <li
                        key={`attention-${attention.id}`}
                        className={cn(
                            'grid grid-cols-[minmax(0,9.5rem)_1rem_minmax(0,1fr)] items-center gap-x-4 sm:gap-x-6',
                            !isLast && 'mb-6',
                        )}
                    >
                        <div className="flex min-w-0 flex-col items-end justify-center gap-1 text-right">
                            <DateDisplay
                                value={timelineMoment}
                                mode="datetime"
                                className="text-muted-foreground text-sm leading-none font-medium whitespace-nowrap tabular-nums"
                            />
                            {isDraft ? (
                                <span className="text-amber-700 dark:text-amber-300 text-xs leading-none whitespace-nowrap">
                                    Borrador
                                </span>
                            ) : (
                                <span className="text-muted-foreground text-xs leading-none whitespace-nowrap tabular-nums">
                                    {formatAttentionDuration(
                                        attention.started_at,
                                        attention.closed_at,
                                    )}
                                </span>
                            )}
                        </div>

                        <TimelineRail isFirst={isFirst} isLast={isLast} />

                        <div className="flex min-w-0 items-center">
                            <button
                                type="button"
                                className={cn(
                                    'bg-card hover:bg-accent cursor-pointer focus-visible:ring-ring inline-flex w-full items-center gap-3 rounded-xl border p-3 text-left shadow-xs transition-colors hover:border-border focus-visible:ring-2 focus-visible:outline-hidden',
                                    isDraft &&
                                        'border-amber-200/90 dark:border-amber-900/40',
                                )}
                                onClick={() =>
                                    isDraft
                                        ? onDraftSelect?.(attention)
                                        : onAttentionSelect?.(attention)
                                }
                                aria-label={
                                    isDraft
                                        ? `Continuar borrador: ${templateLabel}`
                                        : `Ver atención: ${templateLabel}`
                                }
                            >
                                <div
                                    className={cn(
                                        'flex size-10 shrink-0 items-center justify-center rounded-lg border',
                                        badgeClass,
                                    )}
                                >
                                    <Icon className="size-4" aria-hidden />
                                </div>

                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="min-w-0">
                                        <h3 className="truncate text-sm font-medium">
                                            {templateLabel}
                                        </h3>
                                        <p className="text-muted-foreground truncate text-xs">
                                            {doctorLabel}
                                        </p>
                                    </div>
                                    {attention.requested_exams.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {attention.requested_exams.map((exam) => (
                                                <TimelineExamBadge key={exam.id} exam={exam} />
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                <ChevronRight
                                    className="text-muted-foreground size-4 shrink-0"
                                    aria-hidden
                                />
                            </button>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

function TimelineExamBadge({ exam }: { exam: AttentionRequestedExam }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'max-w-full gap-1 rounded-full px-2 py-0.5 text-[11px] font-normal',
                exam.is_uploaded
                    ? 'border-emerald-200/90 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-amber-200/90 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200',
            )}
            title={exam.is_uploaded ? 'Examen cargado' : 'Examen pendiente de carga'}
        >
            <span
                className={cn(
                    'flex size-3.5 shrink-0 items-center justify-center rounded-full',
                    exam.is_uploaded
                        ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                        : 'border border-current/40',
                )}
                aria-hidden
            >
                {exam.is_uploaded ? <Check className="size-2.5" strokeWidth={3} /> : null}
            </span>
            <span className="truncate">{exam.name}</span>
        </Badge>
    );
}

function TimelineRail({ isFirst, isLast }: { isFirst: boolean; isLast: boolean }) {
    return (
        <div className="relative flex items-center justify-center self-stretch">
            {!isFirst || !isLast ? (
                <span
                    className={cn(
                        'bg-border absolute left-1/2 w-px -translate-x-1/2',
                        isLast && 'top-0 h-1/2',
                        isFirst && !isLast && 'top-1/2 bottom-[-1.5rem]',
                        !isFirst && !isLast && 'top-0 bottom-[-1.5rem]',
                    )}
                    aria-hidden
                />
            ) : null}
            <span
                className="bg-background border-border relative z-10 size-3 shrink-0 rounded-full border-2"
                aria-hidden
            />
        </div>
    );
}
