import { router } from '@inertiajs/react';
import { CalendarPlus, ChevronDown, FileDown, Mail, MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { downloadClinicalHistory, whatsappClinicalHistory } from '@/actions/App/Http/Controllers/Medic/PatientsController';
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
    PatientsEditCan,
} from '@/pages/medic/patients/types';

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

    useEffect(() => {
        setHasDraftAttention(draftAttention !== null);
    }, [draftAttention]);

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

    const appointmentDefaults = useMemo(
        () => ({
            ...buildDefaultAppointmentFormDefaults(),
            patientId: patient.id,
            customerId: patient.customer_id,
        }),
        [patient.customer_id, patient.id],
    );

    const openScheduleAppointment = useCallback(() => {
        setAppointmentDetailOpen(false);
        setSelectedAppointmentId(null);
        setAppointmentFormSessionId((current) => current + 1);
        setAppointmentFormOpen(true);
    }, []);

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
                only: ['appointments'],
                preserveScroll: true,
            });
        }
    }, []);

    const timelineCount = attentions.length + appointments.length;

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-base font-medium">Historial clínico</h2>
                    <p className="text-muted-foreground text-sm">
                        {timelineCount === 0
                            ? 'Atenciones y citas del paciente.'
                            : `${timelineCount} ${timelineCount === 1 ? 'registro' : 'registros'} en el timeline.`}
                    </p>
                </div>

                <div className="flex w-full flex-row items-center gap-2 sm:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="min-w-0 flex-1 shrink-0 sm:w-auto sm:flex-none"
                            >
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
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {can.attentions.create ? (
                        <Button
                            type="button"
                            size="sm"
                            variant={
                                isDraftModalOpen || hasDraftAttention ? 'default' : 'outline'
                            }
                            className={cn(
                                'relative min-w-0 flex-1 shrink-0 sm:w-auto sm:flex-none',
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
                <PatientClinicalTimeline
                    attentions={attentions}
                    appointments={appointments}
                    onAttentionSelect={setViewAttention}
                    onDraftSelect={openDraftModal}
                    onAppointmentSelect={openAppointmentDetail}
                />
            </div>

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
                    >                        <DialogHeader className="sr-only">
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
