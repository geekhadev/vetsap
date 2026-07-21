import { router } from '@inertiajs/react';
import {
    CalendarPlus,
    ChevronDown,
    FileDown,
    Mail,
    MessageCircle,
    Syringe,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    downloadClinicalHistory,
    whatsappClinicalHistory,
} from '@/actions/App/Http/Controllers/Medic/PatientsController';
import type { CalendarHoliday } from '@/components/custom/full-calendar/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { AppointmentDetailModal } from '@/pages/agenda/calendar/appointment-detail-modal';
import { AppointmentForm } from '@/pages/agenda/calendar/appointment-form';
import { toWhatsappPhoneDigits } from '@/pages/agenda/calendar/appointment-share';
import type {
    AppointmentFormOptions,
    AppointmentStatusOption,
} from '@/pages/agenda/calendar/types';
import { buildDefaultAppointmentFormDefaults } from '@/pages/agenda/calendar/types';
import type { ClinicalAttention } from '@/pages/medic/clinical-attentions/types';
import { attentionModalContentClassName } from '@/pages/medic/patients/attention-content-tabs';
import { PatientAttentionViewDialog } from '@/pages/medic/patients/patient-attention-view-dialog';
import {
    PATIENT_DRAFT_ATTENTION_ACTION,
    getDraftAttentionActionLabel,
} from '@/pages/medic/patients/patient-clinical-tabs-config';
import { PatientClinicalTimeline } from '@/pages/medic/patients/patient-clinical-timeline';
import { PatientDraftAttentionForm } from '@/pages/medic/patients/patient-draft-attention-form';
import {
    AddManualVaccinationDoseDialog,
    AssignVaccinationPlanDialog,
    PatientVaccinationDoseDialog,
} from '@/pages/medic/patients/patient-vaccination-dialogs';
import type {
    AttentionRequestedExam,
    AttentionSummary,
    DocumentTemplateOption,
    ExamServiceOption,
    Patient,
    PatientAppointmentSummary,
    PatientDoctorOption,
    PatientEditTabId,
    PatientTemplateOption,
    PatientTimelineFilter,
    PatientVaccinationDoseSummary,
    PatientVaccinationPlanSummary,
    PatientsEditCan,
    VaccinationProtocolOption,
    VaccineProductOption,
} from '@/pages/medic/patients/types';
import { PATIENT_TIMELINE_FILTER_OPTIONS } from '@/pages/medic/patients/types';

type PatientEditTabPanelProps = {
    patient: Patient;
    activeTab: PatientEditTabId;
    onTabChange: (tab: PatientEditTabId) => void;
    draftAttention: ClinicalAttention | null;
    templates: PatientTemplateOption[];
    doctors: PatientDoctorOption[];
    examServices: ExamServiceOption[];
    documentTemplates: DocumentTemplateOption[];
    attentions: AttentionSummary[];
    appointments: PatientAppointmentSummary[];
    appointmentFormOptions: AppointmentFormOptions;
    appointmentHolidays: CalendarHoliday[];
    appointmentStatuses: AppointmentStatusOption[];
    vaccinationPlan: PatientVaccinationPlanSummary | null;
    vaccinationDoses: PatientVaccinationDoseSummary[];
    vaccinationProtocols: VaccinationProtocolOption[];
    vaccineProducts: VaccineProductOption[];
    can: PatientsEditCan;
};

export function PatientEditTabPanel({
    patient,
    activeTab,
    onTabChange,
    draftAttention,
    templates,
    doctors,
    examServices,
    documentTemplates,
    attentions,
    appointments,
    appointmentFormOptions,
    appointmentHolidays,
    appointmentStatuses,
    vaccinationPlan,
    vaccinationDoses,
    vaccinationProtocols,
    vaccineProducts,
    can,
}: PatientEditTabPanelProps) {
    const closedAttentionsCount = useMemo(
        () => attentions.filter((attention) => attention.status === 'closed').length,
        [attentions],
    );
    const canShareWhatsapp = useMemo(
        () => toWhatsappPhoneDigits(patient.customer?.phone ?? '') !== null,
        [patient.customer?.phone],
    );

    const [hasDraftAttention, setHasDraftAttention] = useState(draftAttention !== null);
    const [draftFormKey, setDraftFormKey] = useState(0);
    const [viewAttention, setViewAttention] = useState<AttentionSummary | null>(null);
    const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);
    const [appointmentFormSessionId, setAppointmentFormSessionId] = useState(0);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
    const [appointmentDetailOpen, setAppointmentDetailOpen] = useState(false);
    const [timelineFilter, setTimelineFilter] = useState<PatientTimelineFilter>('all');
    const [selectedVaccinationDose, setSelectedVaccinationDose] =
        useState<PatientVaccinationDoseSummary | null>(null);
    const [assignPlanOpen, setAssignPlanOpen] = useState(false);
    const [addDoseOpen, setAddDoseOpen] = useState(false);
    const [appointmentDefaults, setAppointmentDefaults] = useState(() => ({
        ...buildDefaultAppointmentFormDefaults(),
        patientId: patient.id,
        customerId: patient.customer_id,
    }));

    const hasBirthDate = patient.birth_date != null && patient.birth_date !== '';

    const linkedAppointmentIds = useMemo(() => {
        const ids = new Set<string>();

        for (const dose of vaccinationDoses) {
            if (dose.appointment_id) {
                ids.add(dose.appointment_id);
            }
        }

        return ids;
    }, [vaccinationDoses]);

    const visibleVaccinationCount = useMemo(() => {
        if (timelineFilter === 'vaccination') {
            return vaccinationDoses.length;
        }

        if (timelineFilter === 'appointments') {
            return vaccinationDoses.filter(
                (dose) => dose.appointment_id != null && dose.status !== 'omitted',
            ).length;
        }

        return vaccinationDoses.filter((dose) => dose.status !== 'omitted').length;
    }, [timelineFilter, vaccinationDoses]);

    useEffect(() => {
        setHasDraftAttention(draftAttention !== null);
    }, [draftAttention]);

    const handleTimelineFilterChange = useCallback((value: string) => {
        if (!value) {
            return;
        }

        setTimelineFilter(value as PatientTimelineFilter);
    }, []);

    const handleDraftSaved = useCallback(() => {
        setHasDraftAttention(true);
        router.reload({
            only: ['attentions', 'draftAttention'],
            preserveScroll: true,
        });
    }, []);

    const handleDraftCompleted = useCallback(() => {
        setHasDraftAttention(false);
        setDraftFormKey((key) => key + 1);
        onTabChange('historial');
    }, [onTabChange]);

    const handleDraftDeleted = useCallback(() => {
        setHasDraftAttention(false);
        setDraftFormKey((key) => key + 1);
        onTabChange('historial');
    }, [onTabChange]);

    const draftActionLabel = getDraftAttentionActionLabel(hasDraftAttention);
    const DraftActionIcon = PATIENT_DRAFT_ATTENTION_ACTION.icon;
    const isDraftModalOpen = activeTab === PATIENT_DRAFT_ATTENTION_ACTION.id;

    const openDraftModal = useCallback(() => {
        onTabChange(PATIENT_DRAFT_ATTENTION_ACTION.id);
    }, [onTabChange]);

    const dismissDraftModal = useCallback(() => {
        onTabChange('historial');
    }, [onTabChange]);

    const handleDraftModalOpenChange = useCallback(
        (open: boolean) => {
            if (open) {
                openDraftModal();
            } else {
                dismissDraftModal();
            }
        },
        [dismissDraftModal, openDraftModal],
    );

    const openScheduleAppointment = useCallback(() => {
        setAppointmentDetailOpen(false);
        setSelectedAppointmentId(null);
        setAppointmentDefaults({
            ...buildDefaultAppointmentFormDefaults(),
            patientId: patient.id,
            customerId: patient.customer_id,
        });
        setAppointmentFormSessionId((current) => current + 1);
        setAppointmentFormOpen(true);
    }, [patient.customer_id, patient.id]);

    const openScheduleVaccinationAppointment = useCallback(
        (dose: PatientVaccinationDoseSummary) => {
            setSelectedVaccinationDose(null);
            setAppointmentDetailOpen(false);
            setSelectedAppointmentId(null);
            setAppointmentDefaults({
                ...buildDefaultAppointmentFormDefaults(),
                appointmentDate: dose.scheduled_on,
                startsAtTime: '09:00',
                patientId: patient.id,
                customerId: patient.customer_id,
                vaccinationDoseId: dose.id,
            });
            setAppointmentFormSessionId((current) => current + 1);
            setAppointmentFormOpen(true);
        },
        [patient.customer_id, patient.id],
    );

    const openAppointmentDetail = useCallback((appointment: PatientAppointmentSummary) => {
        setAppointmentFormOpen(false);
        setSelectedAppointmentId(appointment.id);
        setAppointmentDetailOpen(true);
    }, []);

    const handleAppointmentDetailOpenChange = useCallback((open: boolean) => {
        setAppointmentDetailOpen(open);

        if (!open) {
            setSelectedAppointmentId(null);
            router.reload({
                only: ['appointments', 'vaccinationDoses'],
                preserveScroll: true,
            });
        }
    }, []);

    const handleVaccinationDoseOpenChange = useCallback((open: boolean) => {
        if (!open) {
            setSelectedVaccinationDose(null);
            router.reload({
                only: ['appointments', 'vaccinationDoses'],
                preserveScroll: true,
            });
        }
    }, []);

    const timelineCount = useMemo(() => {
        const attentionsCount =
            timelineFilter === 'all' || timelineFilter === 'attentions'
                ? attentions.length
                : 0;

        // Citas sin dosis vinculada (las vinculadas se cuentan como vacuna).
        const standaloneAppointmentsCount =
            timelineFilter === 'all' || timelineFilter === 'appointments'
                ? appointments.filter(
                      (appointment) => !linkedAppointmentIds.has(appointment.id),
                  ).length
                : 0;

        const vaccinationsCount =
            timelineFilter === 'all' ||
            timelineFilter === 'vaccination' ||
            timelineFilter === 'appointments'
                ? visibleVaccinationCount
                : 0;

        return attentionsCount + standaloneAppointmentsCount + vaccinationsCount;
    }, [
        appointments,
        attentions.length,
        linkedAppointmentIds,
        timelineFilter,
        visibleVaccinationCount,
    ]);

    const historyTitle =
        timelineFilter === 'vaccination' ? 'Plan de vacunación' : 'Historial clínico';

    const historyDescription = (() => {
        if (timelineFilter === 'vaccination') {
            if (!hasBirthDate) {
                return 'Se requiere fecha de nacimiento para usar el plan de vacunación.';
            }

            if (vaccinationPlan === null) {
                return 'Este paciente no tiene plan de vacunación.';
            }

            return `${vaccinationPlan.name} · ${timelineCount} dosis en el timeline.`;
        }

        if (timelineCount === 0) {
            return 'Atenciones, citas y vacunación del paciente.';
        }

        return `${timelineCount} ${timelineCount === 1 ? 'registro' : 'registros'} en el timeline.`;
    })();

    const showVaccinationBirthDateEmpty =
        timelineFilter === 'vaccination' && !hasBirthDate;

    const showVaccinationNoPlanEmpty =
        timelineFilter === 'vaccination' &&
        hasBirthDate &&
        vaccinationPlan === null;

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-base font-medium">{historyTitle}</h2>
                    <p className="text-muted-foreground text-sm">{historyDescription}</p>
                </div>

                <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                    <ToggleGroup
                        type="single"
                        variant="default"
                        size="sm"
                        value={timelineFilter}
                        onValueChange={handleTimelineFilterChange}
                        className="min-w-0 flex-1 rounded-md bg-muted p-0.5 sm:flex-none"
                        aria-label="Filtrar historial"
                    >
                        {PATIENT_TIMELINE_FILTER_OPTIONS.map((option) => (
                            <ToggleGroupItem
                                key={option.id}
                                value={option.id}
                                aria-label={option.label}
                                className="flex-1 border-0 px-2.5 shadow-none data-[state=on]:bg-background data-[state=on]:text-foreground sm:flex-none sm:px-3"
                            >
                                {option.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" className="shrink-0">
                                Acciones
                                <ChevronDown className="size-4 opacity-60" aria-hidden />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-56">
                            {can.appointments.create ? (
                                <DropdownMenuItem onSelect={openScheduleAppointment}>
                                    <CalendarPlus className="size-4" aria-hidden />
                                    Programar cita
                                </DropdownMenuItem>
                            ) : null}
                            {closedAttentionsCount > 0 ? (
                                <DropdownMenuItem asChild>
                                    <a
                                        href={downloadClinicalHistory.url(patient.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <FileDown className="size-4" aria-hidden />
                                        Ver historial en PDF
                                    </a>
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem disabled>
                                    <FileDown className="size-4" aria-hidden />
                                    Ver historial en PDF
                                </DropdownMenuItem>
                            )}
                            {closedAttentionsCount > 0 && canShareWhatsapp ? (
                                <DropdownMenuItem asChild>
                                    <a
                                        href={whatsappClinicalHistory.url(patient.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MessageCircle className="size-4" aria-hidden />
                                        Enviar historial por WhatsApp
                                    </a>
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem disabled>
                                    <MessageCircle className="size-4" aria-hidden />
                                    Enviar historial por WhatsApp
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                                <Mail className="size-4" aria-hidden />
                                Enviar historial por email
                            </DropdownMenuItem>
                            {hasBirthDate && vaccinationPlan === null ? (
                                <DropdownMenuItem onSelect={() => setAssignPlanOpen(true)}>
                                    <Syringe className="size-4" aria-hidden />
                                    Asignar plan de vacunación
                                </DropdownMenuItem>
                            ) : null}
                            {vaccinationPlan !== null ? (
                                <DropdownMenuItem onSelect={() => setAddDoseOpen(true)}>
                                    <Syringe className="size-4" aria-hidden />
                                    Agregar vacuna al plan
                                </DropdownMenuItem>
                            ) : null}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {can.attentions.create ? (
                        <Button
                            type="button"
                            variant={
                                isDraftModalOpen || hasDraftAttention ? 'default' : 'outline'
                            }
                            className={cn(
                                'relative shrink-0',
                                hasDraftAttention &&
                                    !isDraftModalOpen &&
                                    'shadow-md ring-2 ring-primary/35 ring-offset-2 ring-offset-background',
                            )}
                            aria-pressed={isDraftModalOpen}
                            title={
                                hasDraftAttention && !isDraftModalOpen
                                    ? 'Hay una atención en borrador. Haz clic para continuar.'
                                    : undefined
                            }
                            onClick={() =>
                                isDraftModalOpen ? dismissDraftModal() : openDraftModal()
                            }
                        >
                            {hasDraftAttention && !isDraftModalOpen ? (
                                <span className="relative flex size-2.5 shrink-0" aria-hidden>
                                    <span className="bg-background/80 absolute inline-flex size-full animate-ping rounded-full opacity-75" />
                                    <span className="bg-background relative inline-flex size-2.5 rounded-full" />
                                </span>
                            ) : (
                                <DraftActionIcon className="size-4" />
                            )}
                            {draftActionLabel}
                        </Button>
                    ) : null}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {showVaccinationBirthDateEmpty ? (
                    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 py-10 text-center">
                        <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
                            <Syringe className="size-5" aria-hidden />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Falta la fecha de nacimiento
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Completa la fecha de nacimiento en la ficha del paciente para
                                asignar y ver el plan de vacunación.
                            </p>
                        </div>
                    </div>
                ) : showVaccinationNoPlanEmpty ? (
                    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 py-10 text-center">
                        <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
                            <Syringe className="size-5" aria-hidden />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Este paciente no tiene plan de vacunación
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Asigna un protocolo de la especie para generar la cronología de
                                dosis.
                            </p>
                        </div>
                        <Button type="button" size="sm" onClick={() => setAssignPlanOpen(true)}>
                            Asignar plan
                        </Button>
                    </div>
                ) : (
                    <PatientClinicalTimeline
                        attentions={attentions}
                        appointments={appointments}
                        vaccinationDoses={vaccinationDoses}
                        filter={timelineFilter}
                        onAttentionSelect={setViewAttention}
                        onDraftSelect={openDraftModal}
                        onAppointmentSelect={openAppointmentDetail}
                        onVaccinationSelect={setSelectedVaccinationDose}
                    />
                )}
            </div>

            <PatientVaccinationDoseDialog
                dose={selectedVaccinationDose}
                plan={vaccinationPlan}
                patientId={patient.id}
                canScheduleAppointment={can.appointments.create}
                appointmentStatuses={appointmentStatuses}
                appointmentHolidays={appointmentHolidays}
                canUpdateAppointments={can.appointments.update}
                canDeleteAppointments={can.appointments.delete}
                onOpenChange={handleVaccinationDoseOpenChange}
                onScheduleAppointment={openScheduleVaccinationAppointment}
            />

            <AssignVaccinationPlanDialog
                open={assignPlanOpen}
                onOpenChange={setAssignPlanOpen}
                patientId={patient.id}
                protocols={vaccinationProtocols}
            />

            <AddManualVaccinationDoseDialog
                open={addDoseOpen}
                onOpenChange={setAddDoseOpen}
                patientId={patient.id}
                products={vaccineProducts}
            />

            <PatientAttentionViewDialog
                attention={viewAttention}
                open={viewAttention !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewAttention(null);
                    }
                }}
                patientId={patient.id}
                tutorPhone={patient.customer?.phone ?? null}
                templates={templates}
                canDelete={can.attentions.delete}
                canUpdateExams={can.attentions.update}
                onAttentionExamsChange={(attentionId, exams: AttentionRequestedExam[]) => {
                    setViewAttention((current) =>
                        current && current.id === attentionId
                            ? { ...current, requested_exams: exams }
                            : current,
                    );
                }}
            />

            <AppointmentDetailModal
                open={appointmentDetailOpen}
                onOpenChange={handleAppointmentDetailOpenChange}
                appointmentId={selectedAppointmentId}
                appointmentStatuses={appointmentStatuses}
                holidays={appointmentHolidays}
                canUpdate={can.appointments.update}
                canDelete={can.appointments.delete}
                canStartAttention={can.attentions.create}
            />

            {can.appointments.create ? (
                <AppointmentForm
                    key={appointmentFormSessionId}
                    open={appointmentFormOpen}
                    onOpenChange={setAppointmentFormOpen}
                    formOptions={appointmentFormOptions}
                    defaults={appointmentDefaults}
                    holidays={appointmentHolidays}
                    redirectPatientId={patient.id}
                />
            ) : null}

            {can.attentions.create ? (
                <Dialog open={isDraftModalOpen} onOpenChange={handleDraftModalOpenChange}>
                    <DialogContent
                        className={cn(attentionModalContentClassName, '[&>button]:hidden')}
                    >
                        <DialogHeader className="sr-only">
                            <DialogTitle>{draftActionLabel}</DialogTitle>
                            <DialogDescription>
                                Completa los datos de la atención
                            </DialogDescription>
                        </DialogHeader>
                        <PatientDraftAttentionForm
                            key={`${patient.id}-${draftFormKey}-${draftAttention?.id ?? 'new'}-${draftAttention?.appointment_id ?? ''}`}
                            patientId={patient.id}
                            draftAttention={draftAttention}
                            templates={templates}
                            doctors={doctors}
                            examServices={examServices}
                            documentTemplates={documentTemplates}
                            canUpdateExams={can.attentions.update}
                            canDelete={can.attentions.delete}
                            title={draftActionLabel}
                            description="Completa los datos de la atención"
                            onDraftSaved={handleDraftSaved}
                            onDraftCompleted={handleDraftCompleted}
                            onDraftDeleted={handleDraftDeleted}
                            onDismiss={dismissDraftModal}
                        />
                    </DialogContent>
                </Dialog>
            ) : null}
        </div>
    );
}
