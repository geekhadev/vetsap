import { useHttp } from '@inertiajs/react';
import { ChevronDown, History } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PatientProfileCard } from '@/components/custom/patient-profile-card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { CustomerPetTimeline } from '@/pages/customer/pets/customer-pet-timeline';
import type { CustomerPet } from '@/pages/customer/pets/types';
import type {
    AttentionSummary,
    PatientAppointmentSummary,
    PatientVaccinationDoseSummary,
} from '@/pages/medic/patients/types';
import { attentions as petTimeline } from '@/routes/customer/pets';

type CustomerPetCardProps = {
    pet: CustomerPet;
};

type TimelineResponse = {
    attentions: AttentionSummary[];
    appointments: PatientAppointmentSummary[];
    vaccinationDoses: PatientVaccinationDoseSummary[];
};

type TimelineState = {
    attentions: AttentionSummary[];
    appointments: PatientAppointmentSummary[];
    vaccinationDoses: PatientVaccinationDoseSummary[];
};

export function CustomerPetCard({ pet }: CustomerPetCardProps) {
    const [historyOpen, setHistoryOpen] = useState(false);
    const [timeline, setTimeline] = useState<TimelineState | null>(null);
    const [loadError, setLoadError] = useState(false);
    const timelineHttp = useHttp({});
    const timelineHttpRef = useRef(timelineHttp);
    const requestIdRef = useRef(0);

    useEffect(() => {
        timelineHttpRef.current = timelineHttp;
    }, [timelineHttp]);

    const loadTimeline = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setLoadError(false);
        setTimeline(null);

        try {
            const response = (await timelineHttpRef.current.get(
                petTimeline.url(pet.id),
            )) as TimelineResponse;

            if (requestId !== requestIdRef.current) {
                return;
            }

            setTimeline({
                attentions: response.attentions ?? [],
                appointments: response.appointments ?? [],
                vaccinationDoses: response.vaccinationDoses ?? [],
            });
        } catch {
            if (requestId !== requestIdRef.current) {
                return;
            }

            setLoadError(true);
        }
    }, [pet.id]);

    const toggleHistory = useCallback(() => {
        setHistoryOpen((prev) => {
            const next = !prev;

            if (next && (timeline === null || loadError)) {
                void loadTimeline();
            }

            return next;
        });
    }, [loadError, loadTimeline, timeline]);

    return (
        <PatientProfileCard
            patient={pet}
            actions={
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full sm:h-9 sm:w-auto"
                    onClick={toggleHistory}
                    aria-expanded={historyOpen}
                >
                    <History className="size-4" aria-hidden />
                    {historyOpen ? 'Ocultar historial' : 'Ver historial'}
                    <ChevronDown
                        className={cn(
                            'size-4 transition-transform',
                            historyOpen && 'rotate-180',
                        )}
                        aria-hidden
                    />
                </Button>
            }
            expandedContent={
                historyOpen ? (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-base font-medium">
                                Historial clínico
                            </h3>
                            <p className="text-muted-foreground mt-0.5 text-sm">
                                Atenciones, citas y vacunas de {pet.name}.
                            </p>
                        </div>

                        {timeline === null && !loadError ? (
                            <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
                                <Spinner className="size-4" />
                                Cargando historial…
                            </div>
                        ) : null}

                        {loadError ? (
                            <div className="space-y-3 py-4 text-center">
                                <p className="text-destructive text-sm">
                                    No se pudo cargar el historial.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 w-full sm:h-9 sm:w-auto"
                                    onClick={() => void loadTimeline()}
                                >
                                    Reintentar
                                </Button>
                            </div>
                        ) : null}

                        {timeline !== null && !loadError ? (
                            <CustomerPetTimeline
                                attentions={timeline.attentions}
                                appointments={timeline.appointments}
                                vaccinationDoses={timeline.vaccinationDoses}
                            />
                        ) : null}
                    </div>
                ) : null
            }
        />
    );
}
