import { ChevronDown, FileDown, Mail, MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { ClinicalAttention } from '@/pages/medic/clinical-attentions/types';
import {
    PATIENT_DRAFT_ATTENTION_ACTION,
    getDraftAttentionActionLabel,
} from '@/pages/medic/patients/patient-clinical-tabs-config';
import { PatientClinicalTimeline } from '@/pages/medic/patients/patient-clinical-timeline';
import { PatientDraftAttentionForm } from '@/pages/medic/patients/patient-draft-attention-form';
import type {
    AttentionSummary,
    Patient,
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
    attentions: AttentionSummary[];
    can: PatientsEditCan;
};

export function PatientEditTabPanel({
    patient,
    activeTab,
    onTabChange,
    draftAttention,
    templates,
    doctors,
    attentions,
    can,
}: PatientEditTabPanelProps) {
    const [hasDraftAttention, setHasDraftAttention] = useState(draftAttention !== null);

    useEffect(() => {
        setHasDraftAttention(draftAttention !== null);
    }, [draftAttention]);

    const handleDraftSaved = useCallback(() => {
        setHasDraftAttention(true);
    }, []);

    const draftActionLabel = getDraftAttentionActionLabel(hasDraftAttention);
    const DraftActionIcon = PATIENT_DRAFT_ATTENTION_ACTION.icon;
    const isDraftSheetOpen = activeTab === PATIENT_DRAFT_ATTENTION_ACTION.id;

    const handleDraftSheetOpenChange = useCallback(
        (open: boolean) => {
            onTabChange(open ? PATIENT_DRAFT_ATTENTION_ACTION.id : 'historial');
        },
        [onTabChange],
    );

    return (
        <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-base font-medium">Historial clínico</h2>
                    <p className="text-muted-foreground text-sm">
                        {attentions.length === 0
                            ? 'Atenciones y exámenes del paciente.'
                            : `${attentions.length} ${attentions.length === 1 ? 'registro' : 'registros'} en el timeline.`}
                    </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="w-full shrink-0 sm:w-auto"
                            >
                                Acciones
                                <ChevronDown className="size-4 opacity-60" aria-hidden />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-56">
                            <DropdownMenuItem>
                                <FileDown className="size-4" aria-hidden />
                                Descargar historial PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <MessageCircle className="size-4" aria-hidden />
                                Enviar historial por WhatsApp
                            </DropdownMenuItem>
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
                                isDraftSheetOpen || hasDraftAttention ? 'default' : 'outline'
                            }
                            className={cn(
                                'relative w-full shrink-0 sm:w-auto',
                                hasDraftAttention &&
                                    !isDraftSheetOpen &&
                                    'shadow-md ring-2 ring-primary/35 ring-offset-2 ring-offset-background',
                            )}
                            aria-pressed={isDraftSheetOpen}
                            title={
                                hasDraftAttention && !isDraftSheetOpen
                                    ? 'Hay una atención en borrador. Haz clic para continuar.'
                                    : undefined
                            }
                            onClick={() => handleDraftSheetOpenChange(!isDraftSheetOpen)}
                        >
                            {hasDraftAttention && !isDraftSheetOpen ? (
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

            <PatientClinicalTimeline attentions={attentions} />

            {can.attentions.create ? (
                <Sheet
                    open={isDraftSheetOpen}
                    onOpenChange={handleDraftSheetOpenChange}
                    modal={false}
                >
                    <SheetContent
                        side="right"
                        showOverlay={false}
                        showCloseButton={false}
                        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl md:max-w-2xl"
                    >
                        <SheetHeader className="sr-only">
                            <SheetTitle>{draftActionLabel}</SheetTitle>
                            <SheetDescription>Completa los datos de la atención</SheetDescription>
                        </SheetHeader>
                        <PatientDraftAttentionForm
                            key={`${patient.id}-${draftAttention?.id ?? 'new'}`}
                            patientId={patient.id}
                            draftAttention={draftAttention}
                            templates={templates}
                            doctors={doctors}
                            title={draftActionLabel}
                            description="Completa los datos de la atención"
                            onDraftSaved={handleDraftSaved}
                            onDismiss={() => handleDraftSheetOpenChange(false)}
                        />
                    </SheetContent>
                </Sheet>
            ) : null}
        </div>
    );
}
