import {
    CalendarClock,
    Check,
    ChevronRight,
    FilePenLine,
    Syringe,
    Stethoscope,
} from 'lucide-react';
import { useMemo } from 'react';
import { DateDisplay } from '@/components/custom/date-display';
import { Badge } from '@/components/ui/badge';
import {
    APPOINTMENT_STATUS_COLOR_BADGE_CLASS,
} from '@/lib/appointment-status-colors';
import type { AppointmentStatusColorValue } from '@/lib/appointment-status-colors';
import { cn } from '@/lib/utils';
import { formatAttentionDuration } from '@/pages/medic/patients/attention-view-helpers';
import type {
    AttentionDocumentTemplate,
    AttentionRequestedExam,
    AttentionSummary,
    PatientAppointmentSummary,
    PatientTimelineFilter,
    PatientVaccinationDoseSummary,
    VaccinationDoseSource,
    VaccinationDoseStatus,
} from '@/pages/medic/patients/types';

type TimelineAttentionEntry = {
    kind: 'attention';
    sortAt: string;
    attention: AttentionSummary;
};

type TimelineAppointmentEntry = {
    kind: 'appointment';
    sortAt: string;
    appointment: PatientAppointmentSummary;
};

type TimelineVaccinationEntry = {
    kind: 'vaccination';
    sortAt: string;
    dose: PatientVaccinationDoseSummary;
};

type TimelineEntryBase =
    | TimelineAttentionEntry
    | TimelineAppointmentEntry
    | TimelineVaccinationEntry;

type TimelineEntry = TimelineEntryBase & {
    showDayLabel: boolean;
    sameDayAsPrevious: boolean;
    sameDayAsNext: boolean;
    isToday: boolean;
};

type PatientClinicalTimelineProps = {
    attentions: AttentionSummary[];
    appointments: PatientAppointmentSummary[];
    vaccinationDoses?: PatientVaccinationDoseSummary[];
    filter?: PatientTimelineFilter;
    onAttentionSelect?: (attention: AttentionSummary) => void;
    onDraftSelect?: (attention: AttentionSummary) => void;
    onAppointmentSelect?: (appointment: PatientAppointmentSummary) => void;
    onVaccinationSelect?: (dose: PatientVaccinationDoseSummary) => void;
};

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

function attentionTimelineMoment(attention: AttentionSummary): string {
    return attention.closed_at ?? attention.started_at ?? attention.created_at;
}

function vaccinationTimelineMoment(dose: PatientVaccinationDoseSummary): string {
    if (dose.status === 'administered' && dose.administered_on) {
        return dose.administered_on;
    }

    if (dose.appointment_starts_at) {
        return dose.appointment_starts_at;
    }

    return dose.scheduled_on;
}

function doseHasLinkedAppointment(dose: PatientVaccinationDoseSummary): boolean {
    return dose.appointment_id != null && dose.appointment_id !== '';
}

/** Citas ya representadas por una dosis vinculada (no se muestran como tarjeta aparte). */
function linkedAppointmentIdSet(
    doses: PatientVaccinationDoseSummary[],
): Set<string> {
    const ids = new Set<string>();

    for (const dose of doses) {
        if (doseHasLinkedAppointment(dose) && dose.appointment_id) {
            ids.add(dose.appointment_id);
        }
    }

    return ids;
}

function toSortableMs(value: string): number {
    const ms = Date.parse(value);

    return Number.isNaN(ms) ? 0 : ms;
}

/** Clave de día local (`yyyy-mm-dd`) para agrupar la fecha en el timeline. */
function toLocalDayKey(value: string): string {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

    if (dateOnly) {
        return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;
    }

    const ms = Date.parse(value);

    if (Number.isNaN(ms)) {
        return value;
    }

    const d = new Date(ms);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
}

function todayLocalDayKey(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
}

function withDayLabels(entries: TimelineEntryBase[]): TimelineEntry[] {
    const todayKey = todayLocalDayKey();

    return entries.map((entry, index) => {
        const dayKey = toLocalDayKey(entry.sortAt);
        const previousDayKey =
            index > 0 ? toLocalDayKey(entries[index - 1].sortAt) : null;
        const nextDayKey =
            index < entries.length - 1
                ? toLocalDayKey(entries[index + 1].sortAt)
                : null;

        return {
            ...entry,
            showDayLabel: dayKey !== previousDayKey,
            sameDayAsPrevious:
                previousDayKey !== null && dayKey === previousDayKey,
            sameDayAsNext: nextDayKey !== null && dayKey === nextDayKey,
            isToday: dayKey === todayKey,
        };
    });
}

function isUpcomingAppointment(startsAt: string): boolean {
    const ms = Date.parse(startsAt);

    return !Number.isNaN(ms) && ms > Date.now();
}

function emptyMessageForFilter(filter: PatientTimelineFilter): string {
    switch (filter) {
        case 'attentions':
            return 'Sin atenciones registradas.';
        case 'appointments':
            return 'Sin citas registradas.';
        case 'vaccination':
            return 'Sin dosis de vacunación en el plan.';
        default:
            return 'Sin atenciones, citas ni vacunas registradas.';
    }
}

export function PatientClinicalTimeline({
    attentions,
    appointments,
    vaccinationDoses = [],
    filter = 'all',
    onAttentionSelect,
    onDraftSelect,
    onAppointmentSelect,
    onVaccinationSelect,
}: PatientClinicalTimelineProps) {
    const entries = useMemo<TimelineEntry[]>(() => {
        const includeAttentions = filter === 'all' || filter === 'attentions';
        const includeAppointments = filter === 'all' || filter === 'appointments';
        // Dosis con cita también aparecen en el filtro «Citas» (reemplazan la tarjeta de cita).
        const includeVaccinations =
            filter === 'all' || filter === 'vaccination' || filter === 'appointments';

        const linkedAppointmentIds = linkedAppointmentIdSet(vaccinationDoses);

        const attentionEntries: TimelineEntryBase[] = includeAttentions
            ? attentions.map((attention) => ({
                  kind: 'attention',
                  sortAt: attentionTimelineMoment(attention),
                  attention,
              }))
            : [];

        const appointmentEntries: TimelineEntryBase[] = includeAppointments
            ? appointments
                  .filter((appointment) => !linkedAppointmentIds.has(appointment.id))
                  .map((appointment) => ({
                      kind: 'appointment' as const,
                      sortAt: appointment.starts_at,
                      appointment,
                  }))
            : [];

        const vaccinationEntries: TimelineEntryBase[] = includeVaccinations
            ? vaccinationDoses
                  .filter((dose) => {
                      if (filter === 'appointments') {
                          return (
                              doseHasLinkedAppointment(dose) && dose.status !== 'omitted'
                          );
                      }

                      if (filter === 'vaccination') {
                          return true;
                      }

                      // En «Todo», ocultar omitidas (preferencia Fase 1 del spec).
                      return dose.status !== 'omitted';
                  })
                  .map((dose) => ({
                      kind: 'vaccination' as const,
                      sortAt: vaccinationTimelineMoment(dose),
                      dose,
                  }))
            : [];

        return withDayLabels(
            [...attentionEntries, ...appointmentEntries, ...vaccinationEntries].sort(
                (left, right) => toSortableMs(right.sortAt) - toSortableMs(left.sortAt),
            ),
        );
    }, [appointments, attentions, filter, vaccinationDoses]);

    if (entries.length === 0) {
        return (
            <p className="text-muted-foreground mx-auto w-full max-w-2xl text-center text-sm">
                {emptyMessageForFilter(filter)}
            </p>
        );
    }

    return (
        <ol className="mx-auto flex w-full max-w-2xl flex-col">
            {entries.map((entry, index) => {
                const isFirst = index === 0;
                const isLast = index === entries.length - 1;

                if (entry.kind === 'appointment') {
                    return (
                        <AppointmentTimelineItem
                            key={`appointment-${entry.appointment.id}`}
                            appointment={entry.appointment}
                            showDayLabel={entry.showDayLabel}
                            isFirst={isFirst}
                            isLast={isLast}
                            sameDayAsPrevious={entry.sameDayAsPrevious}
                            sameDayAsNext={entry.sameDayAsNext}
                            isToday={entry.isToday}
                            onSelect={onAppointmentSelect}
                        />
                    );
                }

                if (entry.kind === 'vaccination') {
                    return (
                        <VaccinationTimelineItem
                            key={`vaccination-${entry.dose.id}`}
                            dose={entry.dose}
                            sortAt={entry.sortAt}
                            showDayLabel={entry.showDayLabel}
                            isFirst={isFirst}
                            isLast={isLast}
                            sameDayAsPrevious={entry.sameDayAsPrevious}
                            sameDayAsNext={entry.sameDayAsNext}
                            isToday={entry.isToday}
                            onSelect={onVaccinationSelect}
                        />
                    );
                }

                return (
                    <AttentionTimelineItem
                        key={`attention-${entry.attention.id}`}
                        attention={entry.attention}
                        sortAt={entry.sortAt}
                        showDayLabel={entry.showDayLabel}
                        isFirst={isFirst}
                        isLast={isLast}
                        sameDayAsPrevious={entry.sameDayAsPrevious}
                        sameDayAsNext={entry.sameDayAsNext}
                        isToday={entry.isToday}
                        onAttentionSelect={onAttentionSelect}
                        onDraftSelect={onDraftSelect}
                    />
                );
            })}
        </ol>
    );
}

function AppointmentTimelineItem({
    appointment,
    showDayLabel,
    isFirst,
    isLast,
    sameDayAsPrevious,
    sameDayAsNext,
    isToday,
    onSelect,
}: {
    appointment: PatientAppointmentSummary;
    showDayLabel: boolean;
    isFirst: boolean;
    isLast: boolean;
    sameDayAsPrevious: boolean;
    sameDayAsNext: boolean;
    isToday: boolean;
    onSelect?: (appointment: PatientAppointmentSummary) => void;
}) {
    const serviceLabel = appointment.service_name?.trim() || 'Cita programada';
    const doctorLabel = appointment.doctor_name?.trim()
        ? `Médico: ${appointment.doctor_name}`
        : 'Sin médico asignado';
    const statusLabel = appointment.status_name?.trim() || 'Cita';
    const upcoming = isUpcomingAppointment(appointment.starts_at);

    return (
        <li
            className={cn(
                'grid grid-cols-[minmax(0,9.5rem)_1rem_minmax(0,1fr)] items-center gap-x-4 sm:gap-x-6',
                !isLast && (sameDayAsNext ? 'mb-3' : 'mb-6'),
            )}
        >
            <div className="flex min-w-0 flex-col items-end justify-center gap-1 text-right">
                <DateDisplay
                    value={appointment.starts_at}
                    mode={showDayLabel ? 'datetime' : 'time'}
                    className="text-muted-foreground text-sm leading-none font-medium whitespace-nowrap tabular-nums"
                />
                <span
                    className={cn(
                        'text-xs leading-none whitespace-nowrap',
                        upcoming
                            ? 'text-teal-700 dark:text-teal-300'
                            : 'text-orange-700 dark:text-orange-300',
                    )}
                >
                    {upcoming ? 'Cita futura' : 'Cita pendiente'}
                </span>
            </div>

            <TimelineRail
                isFirst={isFirst}
                isLast={isLast}
                sameDayAsPrevious={sameDayAsPrevious}
                sameDayAsNext={sameDayAsNext}
                isToday={isToday}
                showDayLabel={showDayLabel}
            />

            <div className="flex min-w-0 items-center">
                <button
                    type="button"
                    className={cn(
                        'bg-card hover:bg-accent cursor-pointer focus-visible:ring-ring inline-flex w-full items-center gap-3 rounded-xl border p-3 text-left shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-hidden',
                        upcoming
                            ? 'border-teal-200/80 hover:border-teal-300 dark:border-teal-900/40 dark:hover:border-teal-800'
                            : 'border-orange-200/90 hover:border-orange-300 dark:border-orange-900/40 dark:hover:border-orange-800',
                    )}
                    onClick={() => onSelect?.(appointment)}
                    aria-label={`Ver cita: ${serviceLabel}`}
                >
                    <div
                        className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-lg border',
                            upcoming
                                ? APPOINTMENT_STATUS_COLOR_BADGE_CLASS.teal
                                : APPOINTMENT_STATUS_COLOR_BADGE_CLASS.orange,
                        )}
                    >
                        <CalendarClock className="size-4" aria-hidden />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium">{serviceLabel}</h3>
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

function AttentionTimelineItem({
    attention,
    sortAt,
    showDayLabel,
    isFirst,
    isLast,
    sameDayAsPrevious,
    sameDayAsNext,
    isToday,
    onAttentionSelect,
    onDraftSelect,
}: {
    attention: AttentionSummary;
    sortAt: string;
    showDayLabel: boolean;
    isFirst: boolean;
    isLast: boolean;
    sameDayAsPrevious: boolean;
    sameDayAsNext: boolean;
    isToday: boolean;
    onAttentionSelect?: (attention: AttentionSummary) => void;
    onDraftSelect?: (attention: AttentionSummary) => void;
}) {
    const isDraft = attention.status === 'draft';
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
            className={cn(
                'grid grid-cols-[minmax(0,9.5rem)_1rem_minmax(0,1fr)] items-center gap-x-4 sm:gap-x-6',
                !isLast && (sameDayAsNext ? 'mb-3' : 'mb-6'),
            )}
        >
            <div className="flex min-w-0 flex-col items-end justify-center gap-1 text-right">
                <DateDisplay
                    value={sortAt}
                    mode={showDayLabel ? 'datetime' : 'time'}
                    className="text-muted-foreground text-sm leading-none font-medium whitespace-nowrap tabular-nums"
                />
                {isDraft ? (
                    <span className="text-xs leading-none whitespace-nowrap text-amber-700 dark:text-amber-300">
                        Borrador
                    </span>
                ) : (
                    <span className="text-muted-foreground text-xs leading-none whitespace-nowrap tabular-nums">
                        {formatAttentionDuration(attention.started_at, attention.closed_at)}
                    </span>
                )}
            </div>

            <TimelineRail
                isFirst={isFirst}
                isLast={isLast}
                sameDayAsPrevious={sameDayAsPrevious}
                sameDayAsNext={sameDayAsNext}
                isToday={isToday}
                showDayLabel={showDayLabel}
            />

            <div className="flex min-w-0 items-center">
                <button
                    type="button"
                    className={cn(
                        'bg-card hover:bg-accent cursor-pointer focus-visible:ring-ring inline-flex w-full items-center gap-3 rounded-xl border p-3 text-left shadow-xs transition-colors hover:border-border focus-visible:ring-2 focus-visible:outline-hidden',
                        isDraft && 'border-amber-200/90 dark:border-amber-900/40',
                    )}
                    onClick={() =>
                        isDraft ? onDraftSelect?.(attention) : onAttentionSelect?.(attention)
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
                            <h3 className="truncate text-sm font-medium">{templateLabel}</h3>
                            <p className="text-muted-foreground truncate text-xs">
                                {doctorLabel}
                            </p>
                        </div>
                        {attention.requested_exams.length > 0 ||
                        attention.document_templates.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {attention.requested_exams.map((exam) => (
                                    <TimelineExamBadge key={exam.id} exam={exam} />
                                ))}
                                {attention.document_templates.map((template) => (
                                    <TimelineDocumentTemplateBadge
                                        key={template.id}
                                        template={template}
                                    />
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
}

function VaccinationTimelineItem({
    dose,
    sortAt,
    showDayLabel,
    isFirst,
    isLast,
    sameDayAsPrevious,
    sameDayAsNext,
    isToday,
    onSelect,
}: {
    dose: PatientVaccinationDoseSummary;
    sortAt: string;
    showDayLabel: boolean;
    isFirst: boolean;
    isLast: boolean;
    sameDayAsPrevious: boolean;
    sameDayAsNext: boolean;
    isToday: boolean;
    onSelect?: (dose: PatientVaccinationDoseSummary) => void;
}) {
    const statusLabel = VACCINATION_STATUS_LABEL[dose.status];
    const statusColor = VACCINATION_STATUS_COLOR[dose.status];
    const sourceLabel = VACCINATION_SOURCE_LABEL[dose.source];
    const subtitleParts = [dose.plan_name, dose.series_label, sourceLabel].filter(
        (part): part is string => part != null && part.trim() !== '',
    );
    const isOmitted = dose.status === 'omitted';
    const isAdministered = dose.status === 'administered';
    const isExternal = isAdministered && dose.administered_origin === 'external';

    return (
        <li
            className={cn(
                'grid grid-cols-[minmax(0,9.5rem)_1rem_minmax(0,1fr)] items-center gap-x-4 sm:gap-x-6',
                !isLast && (sameDayAsNext ? 'mb-3' : 'mb-6'),
                isOmitted && 'opacity-60',
            )}
        >
            <div className="flex min-w-0 flex-col items-end justify-center gap-1 text-right">
                {showDayLabel ? (
                    <DateDisplay
                        value={sortAt}
                        mode="date"
                        className="text-muted-foreground text-sm leading-none font-medium whitespace-nowrap tabular-nums"
                    />
                ) : null}
                <span
                    className={cn(
                        'text-xs leading-none whitespace-nowrap',
                        dose.status === 'overdue' && 'text-red-700 dark:text-red-300',
                        dose.status === 'due' && 'text-teal-700 dark:text-teal-300',
                        dose.status === 'scheduled' && 'text-muted-foreground',
                        isAdministered && 'text-emerald-700 dark:text-emerald-300',
                        dose.status === 'omitted' && 'text-muted-foreground',
                    )}
                >
                    {isExternal ? 'Aplicada · Externo' : statusLabel}
                </span>
            </div>

            <TimelineRail
                isFirst={isFirst}
                isLast={isLast}
                sameDayAsPrevious={sameDayAsPrevious}
                sameDayAsNext={sameDayAsNext}
                isToday={isToday}
                showDayLabel={showDayLabel}
            />

            <div className="flex min-w-0 items-center">
                <button
                    type="button"
                    className={cn(
                        'bg-card hover:bg-accent cursor-pointer focus-visible:ring-ring inline-flex w-full items-center gap-3 rounded-xl border p-3 text-left shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-hidden',
                        dose.status === 'overdue' &&
                            'border-red-200/90 hover:border-red-300 dark:border-red-900/40 dark:hover:border-red-800',
                        dose.status === 'due' &&
                            'border-teal-200/80 hover:border-teal-300 dark:border-teal-900/40 dark:hover:border-teal-800',
                        isAdministered &&
                            'border-emerald-200/80 hover:border-emerald-300 dark:border-emerald-900/40 dark:hover:border-emerald-800',
                    )}
                    onClick={() => onSelect?.(dose)}
                    aria-label={`Ver vacuna: ${dose.product_name}`}
                >
                    <div
                        className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-lg border',
                            APPOINTMENT_STATUS_COLOR_BADGE_CLASS[statusColor],
                        )}
                    >
                        <Syringe className="size-4" aria-hidden />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-medium">{dose.product_name}</h3>
                            <p className="text-muted-foreground truncate text-xs">
                                {subtitleParts.join(' · ')}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            <Badge
                                variant="outline"
                                className={cn(
                                    'rounded-full px-2 py-0.5 text-[11px] font-normal',
                                    APPOINTMENT_STATUS_COLOR_BADGE_CLASS[statusColor],
                                )}
                            >
                                {statusLabel}
                            </Badge>
                            {isExternal ? (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'rounded-full px-2 py-0.5 text-[11px] font-normal',
                                        APPOINTMENT_STATUS_COLOR_BADGE_CLASS.violet,
                                    )}
                                >
                                    Externo
                                </Badge>
                            ) : null}
                            {dose.billing_status === 'pending' ? (
                                <Badge
                                    variant="outline"
                                    className="rounded-full px-2 py-0.5 text-[11px] font-normal"
                                >
                                    En cobro
                                </Badge>
                            ) : null}
                            {dose.billing_status === 'charged' ? (
                                <Badge
                                    variant="outline"
                                    className="rounded-full border-emerald-200 px-2 py-0.5 text-[11px] font-normal text-emerald-800 dark:border-emerald-900 dark:text-emerald-200"
                                >
                                    Cobrada
                                </Badge>
                            ) : null}
                            {dose.appointment_misaligned ? (
                                <Badge
                                    variant="outline"
                                    className="rounded-full border-amber-200 px-2 py-0.5 text-[11px] font-normal text-amber-800 dark:border-amber-900 dark:text-amber-200"
                                >
                                    Cita desfasada
                                </Badge>
                            ) : null}
                            {dose.appointment_id && !dose.appointment_misaligned ? (
                                <Badge
                                    variant="outline"
                                    className="rounded-full px-2 py-0.5 text-[11px] font-normal"
                                >
                                    Con cita
                                </Badge>
                            ) : null}
                        </div>
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

function TimelineDocumentTemplateBadge({
    template,
}: {
    template: AttentionDocumentTemplate;
}) {
    return (
        <Badge
            variant="outline"
            className="max-w-full gap-1 rounded-full border-sky-200/90 bg-sky-50 px-2 py-0.5 text-[11px] font-normal text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-200"
            title="Formato vinculado"
        >
            <span className="truncate">{template.title}</span>
        </Badge>
    );
}

function TimelineRailSegment({
    solid,
    emphasize,
    className,
}: {
    solid: boolean;
    emphasize?: boolean;
    className: string;
}) {
    return (
        <span
            className={cn(
                'absolute left-1/2 -translate-x-1/2',
                solid
                    ? emphasize
                        ? 'bg-primary w-0.5'
                        : 'bg-muted-foreground/45 w-0.5'
                    : 'border-muted-foreground/35 w-0 border-l border-dotted',
                className,
            )}
            aria-hidden
        />
    );
}

/** Extiende la línea del rail hasta el siguiente ítem (mb-3 mismo día / mb-6 otro día). */
function TimelineRail({
    isFirst,
    isLast,
    sameDayAsPrevious,
    sameDayAsNext,
    isToday,
    showDayLabel,
}: {
    isFirst: boolean;
    isLast: boolean;
    sameDayAsPrevious: boolean;
    sameDayAsNext: boolean;
    isToday: boolean;
    showDayLabel: boolean;
}) {
    const gapExtension = sameDayAsNext ? 'bottom-[-0.75rem]' : 'bottom-[-1.5rem]';
    const pulseToday = isToday && showDayLabel;

    return (
        <div className="relative flex items-center justify-center self-stretch">
            {!isFirst ? (
                <TimelineRailSegment
                    solid={sameDayAsPrevious}
                    emphasize={isToday && sameDayAsPrevious}
                    className="top-0 h-1/2"
                />
            ) : null}
            {!isLast ? (
                <TimelineRailSegment
                    solid={sameDayAsNext}
                    emphasize={isToday && sameDayAsNext}
                    className={cn('top-1/2', gapExtension)}
                />
            ) : null}
            <span className="relative z-10 flex size-3 shrink-0 items-center justify-center">
                {pulseToday ? (
                    <span
                        className="bg-primary/70 absolute inline-flex size-full animate-ping rounded-full opacity-75"
                        aria-hidden
                    />
                ) : null}
                <span
                    className={cn(
                        'relative size-3 shrink-0 rounded-full border-2',
                        pulseToday
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/40 bg-background',
                    )}
                    aria-hidden
                />
            </span>
        </div>
    );
}
