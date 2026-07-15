import { ChevronRight, Stethoscope } from 'lucide-react';
import { formatDateDisplay } from '@/components/custom/date-display';
import { APPOINTMENT_STATUS_COLOR_BADGE_CLASS } from '@/lib/appointment-status-colors';
import { cn } from '@/lib/utils';
import type { AttentionSummary } from '@/pages/medic/patients/types';

type PatientClinicalTimelineProps = {
    attentions: AttentionSummary[];
};

function formatTimelineDateTime(value: string | null | undefined): string {
    if (value == null || value === '') {
        return '—';
    }

    const formatted = formatDateDisplay(value, 'datetime', '');

    if (formatted === '') {
        return '—';
    }

    // `datetime` incluye segundos; el timeline usa `dd/mm/aaaa HH:mm`.
    return formatted.replace(/^(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}):\d{2}$/, '$1');
}

function attentionTimelineMoment(attention: AttentionSummary): string {
    return attention.closed_at ?? attention.started_at ?? attention.created_at;
}

export function PatientClinicalTimeline({ attentions }: PatientClinicalTimelineProps) {
    if (attentions.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                Sin atenciones ni exámenes registrados.
            </p>
        );
    }

    return (
        <ol className="flex flex-col">
            {attentions.map((attention, index) => {
                const isFirst = index === 0;
                const isLast = index === attentions.length - 1;
                const timelineMoment = attentionTimelineMoment(attention);

                return (
                    <li
                        key={attention.id}
                        className={cn(
                            'grid grid-cols-[9.5rem_1rem_minmax(0,1fr)] items-center gap-x-6',
                            !isLast && 'mb-6',
                        )}
                    >
                        <div className="flex items-center justify-end">
                            <time
                                dateTime={timelineMoment}
                                className="text-muted-foreground text-sm leading-none font-medium whitespace-nowrap tabular-nums"
                            >
                                {formatTimelineDateTime(timelineMoment)}
                            </time>
                        </div>

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

                        <div className="flex items-center">
                            <article className="bg-card inline-flex max-w-full items-center gap-3 rounded-xl border p-3 shadow-xs">
                                <div
                                    className={cn(
                                        'flex size-10 shrink-0 items-center justify-center rounded-lg border',
                                        APPOINTMENT_STATUS_COLOR_BADGE_CLASS.blue,
                                    )}
                                >
                                    <Stethoscope className="size-4" aria-hidden />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-medium">
                                        {attention.template_name?.trim() || 'Atención clínica'}
                                    </h3>
                                    <p className="text-muted-foreground truncate text-xs">
                                        {attention.doctor_name?.trim()
                                            ? `Médico: ${attention.doctor_name}`
                                            : 'Sin médico asignado'}
                                    </p>
                                    <p className="text-muted-foreground truncate text-xs">
                                        Inicio: {formatTimelineDateTime(attention.started_at)}
                                        {attention.closed_at
                                            ? ` · Fin: ${formatTimelineDateTime(attention.closed_at)}`
                                            : ''}
                                    </p>
                                </div>

                                <ChevronRight
                                    className="text-muted-foreground size-4 shrink-0"
                                    aria-hidden
                                />
                            </article>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
