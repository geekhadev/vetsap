import { ChevronRight, Stethoscope } from 'lucide-react';
import { APPOINTMENT_STATUS_COLOR_BADGE_CLASS } from '@/lib/appointment-status-colors';
import { cn } from '@/lib/utils';
import { formatAttentionDateTime, formatAttentionDuration } from '@/pages/medic/patients/attention-view-helpers';
import type { AttentionSummary } from '@/pages/medic/patients/types';

type PatientClinicalTimelineProps = {
    attentions: AttentionSummary[];
    onAttentionSelect?: (attention: AttentionSummary) => void;
};

function attentionTimelineMoment(attention: AttentionSummary): string {
    return attention.closed_at ?? attention.started_at ?? attention.created_at;
}

export function PatientClinicalTimeline({
    attentions,
    onAttentionSelect,
}: PatientClinicalTimelineProps) {
    if (attentions.length === 0) {
        return (
            <p className="text-muted-foreground mx-auto w-full max-w-2xl text-center text-sm">
                Sin atenciones ni exámenes registrados.
            </p>
        );
    }

    return (
        <ol className="mx-auto flex w-full max-w-2xl flex-col">
            {attentions.map((attention, index) => {
                const isFirst = index === 0;
                const isLast = index === attentions.length - 1;
                const timelineMoment = attentionTimelineMoment(attention);
                const templateLabel =
                    attention.template_name?.trim() || 'Atención clínica';
                const doctorLabel = attention.doctor_name?.trim()
                    ? `Médico: ${attention.doctor_name}`
                    : 'Sin médico asignado';

                return (
                    <li
                        key={attention.id}
                        className={cn(
                            'grid grid-cols-[minmax(0,9.5rem)_1rem_minmax(0,1fr)] items-center gap-x-4 sm:gap-x-6',
                            !isLast && 'mb-6',
                        )}
                    >
                        <div className="flex min-w-0 flex-col items-end justify-center gap-1 text-right">
                            <time
                                dateTime={timelineMoment}
                                className="text-muted-foreground text-sm leading-none font-medium whitespace-nowrap tabular-nums"
                            >
                                {formatAttentionDateTime(timelineMoment)}
                            </time>
                            <span className="text-muted-foreground text-xs leading-none whitespace-nowrap tabular-nums">
                                {formatAttentionDuration(
                                    attention.started_at,
                                    attention.closed_at,
                                )}
                            </span>
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

                        <div className="flex min-w-0 items-center">
                            <button
                                type="button"
                                className="bg-card hover:bg-accent cursor-pointer focus-visible:ring-ring inline-flex w-full items-center gap-3 rounded-xl border p-3 text-left shadow-xs transition-colors hover:border-border focus-visible:ring-2 focus-visible:outline-hidden"
                                onClick={() => onAttentionSelect?.(attention)}
                                aria-label={`Ver atención: ${templateLabel}`}
                            >
                                <div
                                    className={cn(
                                        'flex size-10 shrink-0 items-center justify-center rounded-lg border',
                                        APPOINTMENT_STATUS_COLOR_BADGE_CLASS.blue,
                                    )}
                                >
                                    <Stethoscope className="size-4" aria-hidden />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-medium">
                                        {templateLabel}
                                    </h3>
                                    <p className="text-muted-foreground truncate text-xs">
                                        {doctorLabel}
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
            })}
        </ol>
    );
}
