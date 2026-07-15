import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DateDisplay } from '@/components/custom/date-display';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { ClinicalAttention } from '@/pages/medic/clinical-attentions/types';
import {
    PATIENT_DRAFT_ATTENTION_ACTION,
    PATIENT_EDIT_MAIN_TABS,
    getDraftAttentionActionLabel,
} from '@/pages/medic/patients/patient-clinical-tabs-config';
import { PatientDraftAttentionForm } from '@/pages/medic/patients/patient-draft-attention-form';
import type {
    AttentionSummary,
    Patient,
    PatientDoctorOption,
    PatientEditTabId,
    PatientTemplateOption,
    PatientsEditCan,
} from '@/pages/medic/patients/types';
import { destroy as clinicalAttentionsDestroy } from '@/routes/medic/clinical-attentions';

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

    const deleteAttention = useCallback(
        (attention: AttentionSummary) => {
            const dateLabel = new Date(attention.created_at).toLocaleDateString('es-CL', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });

            if (
                !window.confirm(
                    `¿Eliminar la atención del ${dateLabel}? Esta acción no se puede deshacer.`,
                )
            ) {
                return;
            }

            router.delete(
                clinicalAttentionsDestroy.url(
                    { clinical_attention: attention.id },
                    { query: { back_to_patient: patient.id } },
                ),
                { preserveScroll: true },
            );
        },
        [patient.id],
    );

    const draftActionLabel = getDraftAttentionActionLabel(hasDraftAttention);
    const DraftActionIcon = PATIENT_DRAFT_ATTENTION_ACTION.icon;
    const isDraftPanelActive = activeTab === PATIENT_DRAFT_ATTENTION_ACTION.id;

    return (
        <Tabs
            value={activeTab}
            onValueChange={(value) => onTabChange(value as PatientEditTabId)}
            className="flex min-w-0 flex-col gap-4"
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <TabsList className="w-full justify-start sm:w-fit">
                    {PATIENT_EDIT_MAIN_TABS.map((tab) => {
                        const Icon = tab.icon;

                        return (
                            <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
                                <Icon aria-hidden className="size-4 shrink-0" />
                                {tab.label}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {can.attentions.create ? (
                    <Button
                        type="button"
                        size="sm"
                        variant={isDraftPanelActive ? 'default' : hasDraftAttention ? 'secondary' : 'outline'}
                        className={cn(
                            'w-full shrink-0 sm:w-auto',
                            hasDraftAttention && !isDraftPanelActive && 'border-amber-300',
                        )}
                        aria-pressed={isDraftPanelActive}
                        onClick={() => onTabChange(PATIENT_DRAFT_ATTENTION_ACTION.id)}
                    >
                        <DraftActionIcon className="size-4" />
                        {draftActionLabel}
                    </Button>
                ) : null}
            </div>

            <TabsContent value="historial" className="mt-0 outline-none">
                <div className="flex flex-col gap-4">
                    <p className="text-muted-foreground text-sm">
                        {attentions.length === 0
                            ? 'Sin atenciones registradas.'
                            : `${attentions.length} ${attentions.length === 1 ? 'atención registrada' : 'atenciones registradas'}.`}
                    </p>

                    {attentions.length > 0 && (
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-2 text-left font-medium">Fecha</th>
                                        <th className="px-4 py-2 text-left font-medium">Plantilla</th>
                                        <th className="px-4 py-2 text-left font-medium">Médico</th>
                                        <th className="px-4 py-2" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {attentions.map((attention) => (
                                        <tr
                                            key={attention.id}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-2 text-muted-foreground">
                                                <DateDisplay value={attention.created_at} mode="date" />
                                            </td>
                                            <td className="px-4 py-2">{attention.template_name ?? '—'}</td>
                                            <td className="px-4 py-2 text-muted-foreground">
                                                {attention.doctor_name ?? '—'}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {can.attentions.delete ? (
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="p-0.5"
                                                            title="Eliminar atención"
                                                            onClick={() => deleteAttention(attention)}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="nueva-atencion" className="mt-0 outline-none">
                <div className="rounded-lg border bg-card p-4 sm:p-6">
                    {can.attentions.create ? (
                        <PatientDraftAttentionForm
                            key={`${patient.id}-${draftAttention?.id ?? 'new'}`}
                            patientId={patient.id}
                            draftAttention={draftAttention}
                            templates={templates}
                            doctors={doctors}
                            onDraftSaved={handleDraftSaved}
                        />
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No tienes permisos para registrar atenciones clínicas.
                        </p>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="examenes" className="mt-0 outline-none">
                <p className="text-muted-foreground text-sm">Contenido en desarrollo.</p>
            </TabsContent>
        </Tabs>
    );
}
