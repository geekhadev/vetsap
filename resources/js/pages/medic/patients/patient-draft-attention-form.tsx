import { router } from '@inertiajs/react';
import { Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { FormMultiSelect } from '@/components/custom/form-multi-select';
import { FormSelect } from '@/components/custom/form-select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ClinicalFieldInput } from '@/pages/medic/clinical-attentions/clinical-field-input';
import type { ClinicalAttention } from '@/pages/medic/clinical-attentions/types';
import type { ClinicalFieldKey } from '@/pages/medic/clinical-templates/types';
import { CLINICAL_FIELD_CATALOG } from '@/pages/medic/clinical-templates/types';
import {
    ATTENTION_CONTENT_TAB,
    ATTENTION_CONTENT_TAB_ICONS,
    ATTENTION_CONTENT_TAB_LABELS,
    attentionContentTabsListClassName,
    attentionContentTabsPanelClassName,
    attentionContentTabsTriggerClassName,
} from '@/pages/medic/patients/attention-content-tabs';
import { AttentionDocumentTemplateCard } from '@/pages/medic/patients/attention-document-template-card';
import { AttentionExamResultCard } from '@/pages/medic/patients/attention-exam-result-card';
import { useAttentionExamUpload } from '@/pages/medic/patients/hooks/use-attention-exam-upload';
import { usePatientDraftAttention } from '@/pages/medic/patients/hooks/use-patient-draft-attention';
import type {
    AttentionRequestedExam,
    DocumentTemplateOption,
    ExamServiceOption,
    PatientDoctorOption,
    PatientTemplateOption,
} from '@/pages/medic/patients/types';
import { destroy } from '@/routes/medic/clinical-attentions';

type PatientDraftAttentionFormProps = {
    patientId: string;
    draftAttention: ClinicalAttention | null;
    templates: PatientTemplateOption[];
    doctors: PatientDoctorOption[];
    examServices: ExamServiceOption[];
    documentTemplates: DocumentTemplateOption[];
    canUpdateExams?: boolean;
    canDelete?: boolean;
    title: string;
    description: string;
    onDraftSaved?: () => void;
    onDraftCompleted?: () => void;
    onDraftDeleted?: () => void;
    onDismiss?: () => void;
};

export function PatientDraftAttentionForm({
    patientId,
    draftAttention,
    templates,
    doctors,
    examServices,
    documentTemplates,
    canUpdateExams = true,
    canDelete = false,
    title,
    description,
    onDraftSaved,
    onDraftCompleted,
    onDraftDeleted,
    onDismiss,
}: PatientDraftAttentionFormProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const showDoctorSelect = doctors.length > 1;
    const showTemplateSelect = templates.length > 1;

    const defaultTemplateId = useMemo(
        () => templates.find((t) => t.is_default)?.id ?? templates[0]?.id ?? '',
        [templates],
    );

    const defaultDoctorId = useMemo(
        () => (doctors.length === 1 ? doctors[0].id : ''),
        [doctors],
    );

    const {
        formState,
        draftId,
        examResults,
        closeErrors,
        closing,
        syncingExtras,
        setTemplateId,
        setDoctorId,
        setFieldValue,
        setRequestedServiceIds,
        setDocumentTemplateIds,
        upsertExamResult,
        closeAttention,
    } = usePatientDraftAttention({
        patientId,
        draftAttention,
        defaultTemplateId,
        defaultDoctorId,
        onDraftSaved,
        onDraftCompleted,
    });

    const { busyServiceId, uploadExam, removeExam } = useAttentionExamUpload({
        attentionId: draftId ?? '',
        onExamUpdated: upsertExamResult,
    });

    const canDeleteDraft = canDelete && draftId != null;

    const handleDeleteDraft = () => {
        if (draftId == null) {
            return;
        }

        setDeleting(true);
        router.delete(
            destroy.url(draftId, {
                query: { back_to_patient: patientId },
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmDeleteOpen(false);
                    onDraftDeleted?.();
                },
                onFinish: () => {
                    setDeleting(false);
                },
            },
        );
    };

    const selectedTemplate = useMemo(
        () => templates.find((t) => t.id === formState.template_id) ?? null,
        [templates, formState.template_id],
    );

    const doctorOptions = useMemo(
        () => doctors.map((d) => ({ id: d.id, label: `${d.first_name} ${d.last_name}` })),
        [doctors],
    );
    const templateOptions = useMemo(
        () => templates.map((t) => ({ id: t.id, label: t.name })),
        [templates],
    );
    const examServiceOptions = useMemo(
        () => examServices.map((service) => ({ value: service.id, label: service.name })),
        [examServices],
    );
    const documentTemplateOptions = useMemo(
        () =>
            documentTemplates.map((template) => ({
                value: template.id,
                label: template.title,
            })),
        [documentTemplates],
    );

    const selectedExams = useMemo((): AttentionRequestedExam[] => {
        return formState.requested_service_ids.map((id) => {
            const existing = examResults[id];

            if (existing) {
                return existing;
            }

            const service = examServices.find((item) => item.id === id);

            return {
                id,
                name: service?.name ?? 'Examen',
                is_uploaded: false,
                file_url: null,
                file_name: null,
                mime_type: null,
            };
        });
    }, [examResults, examServices, formState.requested_service_ids]);

    const selectedDocumentTemplates = useMemo(
        () =>
            formState.document_template_ids
                .map((id) => documentTemplates.find((template) => template.id === id))
                .filter((template): template is DocumentTemplateOption => template != null),
        [documentTemplates, formState.document_template_ids],
    );

    const sortedFields = useMemo(
        () =>
            selectedTemplate?.fields
                ? [...selectedTemplate.fields].sort((a, b) => a.field_order - b.field_order)
                : [],
        [selectedTemplate],
    );

    const vitalFields = useMemo(
        () =>
            sortedFields.filter(
                (f) =>
                    CLINICAL_FIELD_CATALOG.find((c) => c.key === f.field_key)?.group ===
                    'Signos vitales',
            ),
        [sortedFields],
    );

    const otherFields = useMemo(
        () =>
            sortedFields.filter(
                (f) =>
                    CLINICAL_FIELD_CATALOG.find((c) => c.key === f.field_key)?.group !==
                    'Signos vitales',
            ),
        [sortedFields],
    );

    const showExamsTab = examServiceOptions.length > 0;
    const showFormatosTab = documentTemplateOptions.length > 0;
    const showContentTabs = showExamsTab || showFormatosTab;
    const extrasReady = draftId != null && !syncingExtras;

    if (templates.length === 0 || doctors.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                Configura plantillas clínicas y médicos activos para registrar atenciones.
            </p>
        );
    }

    const consultaFields = (
        <>
            {!selectedTemplate && showTemplateSelect ? (
                <p className="text-muted-foreground text-sm">
                    Selecciona una plantilla para registrar los datos clínicos.
                </p>
            ) : null}

            {vitalFields.length > 0 ? (
                <section className="flex flex-col gap-4">
                    <h3 className="text-base font-semibold">Signos vitales</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {vitalFields.map((field) => (
                            <ClinicalFieldInput
                                key={field.field_key}
                                fieldKey={field.field_key}
                                value={formState.values[field.field_key] ?? ''}
                                onValueChange={(value) =>
                                    setFieldValue(field.field_key as ClinicalFieldKey, value)
                                }
                                error={closeErrors[`values.${field.field_key}`]}
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            {vitalFields.length > 0 && otherFields.length > 0 ? (
                <div className="border-border border-t" role="separator" />
            ) : null}

            {otherFields.length > 0 ? (
                <section className="flex flex-col gap-4">
                    <h3 className="text-base font-semibold">Datos clínicos</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {otherFields.map((field) => (
                            <ClinicalFieldInput
                                key={field.field_key}
                                fieldKey={field.field_key}
                                value={formState.values[field.field_key] ?? ''}
                                onValueChange={(value) =>
                                    setFieldValue(field.field_key as ClinicalFieldKey, value)
                                }
                                error={closeErrors[`values.${field.field_key}`]}
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            {selectedTemplate && vitalFields.length === 0 && otherFields.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    Esta plantilla no tiene campos clínicos configurados.
                </p>
            ) : null}
        </>
    );

    const examsPanel = (
        <div className="flex flex-col gap-4">
            <FormMultiSelect
                id="draft-attention-requested_service_ids"
                label="Exámenes"
                placeholder="Selecciona uno o más exámenes…"
                searchPlaceholder="Buscar examen…"
                emptyMessage="No hay exámenes disponibles."
                options={examServiceOptions}
                values={formState.requested_service_ids}
                onValuesChange={setRequestedServiceIds}
                error={
                    closeErrors.requested_service_ids ?? closeErrors['requested_service_ids.0']
                }
            />

            {selectedExams.length > 0 ? (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selectedExams.map((exam) => (
                        <AttentionExamResultCard
                            key={exam.id}
                            exam={exam}
                            canUpdate={canUpdateExams && extrasReady}
                            busy={busyServiceId === exam.id || syncingExtras}
                            onUpload={(file) => {
                                void uploadExam(exam.id, file);
                            }}
                            onRemove={() => {
                                void removeExam(exam.id);
                            }}
                        />
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground text-sm">
                    Selecciona exámenes para cargar resultados (PDF o imagen) desde aquí.
                </p>
            )}

            {selectedExams.length > 0 && syncingExtras ? (
                <p className="text-muted-foreground text-xs">
                    Guardando selección para habilitar la carga de archivos…
                </p>
            ) : null}
        </div>
    );

    const formatosPanel = (
        <div className="flex flex-col gap-4">
            <FormMultiSelect
                id="draft-attention-document_template_ids"
                label="Plantillas y formatos"
                placeholder="Selecciona uno o más formatos…"
                searchPlaceholder="Buscar formato…"
                emptyMessage="No hay formatos disponibles."
                options={documentTemplateOptions}
                values={formState.document_template_ids}
                onValuesChange={setDocumentTemplateIds}
                error={
                    closeErrors.document_template_ids ?? closeErrors['document_template_ids.0']
                }
            />

            {selectedDocumentTemplates.length > 0 ? (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selectedDocumentTemplates.map((template) => (
                        <AttentionDocumentTemplateCard
                            key={template.id}
                            attentionId={draftId}
                            template={template}
                            disabled={!extrasReady}
                        />
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground text-sm">
                    Selecciona formatos para previsualizar o abrir el PDF generado.
                </p>
            )}
        </div>
    );

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b p-4 sm:px-6">
                <div className="min-w-0 space-y-1.5">
                    <h2 className="text-foreground text-base leading-none font-semibold">{title}</h2>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {canDeleteDraft ? (
                        <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => setConfirmDeleteOpen(true)}
                            disabled={closing || deleting}
                        >
                            <Trash2 className="size-4" aria-hidden />
                            Eliminar
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setConfirmOpen(true)}
                        disabled={closing || deleting}
                    >
                        {closing ? 'Completando…' : 'Completar atención'}
                    </Button>
                    {onDismiss ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            title="Cerrar"
                            onClick={onDismiss}
                            disabled={deleting}
                        >
                            <X className="size-4" aria-hidden />
                            <span className="sr-only">Cerrar</span>
                        </Button>
                    ) : null}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-4 p-4 sm:p-6">
                {showDoctorSelect || showTemplateSelect ? (
                    <div
                        className={cn(
                            'grid grid-cols-1 gap-4',
                            showDoctorSelect && showTemplateSelect && 'sm:grid-cols-2',
                        )}
                    >
                        {showDoctorSelect ? (
                            <FormSelect
                                label="Médico"
                                required
                                placeholder="Selecciona un médico…"
                                options={doctorOptions}
                                error={closeErrors.doctor_id}
                                selectProps={{
                                    id: 'draft-attention-doctor_id',
                                    value: formState.doctor_id,
                                    onChange: (e) => setDoctorId(e.target.value),
                                }}
                            />
                        ) : null}
                        {showTemplateSelect ? (
                            <FormSelect
                                label="Plantilla de ficha"
                                required
                                placeholder="Selecciona una plantilla…"
                                options={templateOptions}
                                error={closeErrors.template_id}
                                selectProps={{
                                    id: 'draft-attention-template_id',
                                    value: formState.template_id,
                                    onChange: (e) => setTemplateId(e.target.value),
                                }}
                            />
                        ) : null}
                    </div>
                ) : null}

                {showContentTabs ? (
                    <Tabs
                        defaultValue={ATTENTION_CONTENT_TAB.consulta}
                        className="flex min-h-[28rem] flex-col gap-0"
                    >
                        <TabsList className={attentionContentTabsListClassName}>
                            <TabsTrigger
                                value={ATTENTION_CONTENT_TAB.consulta}
                                className={attentionContentTabsTriggerClassName}
                            >
                                <ATTENTION_CONTENT_TAB_ICONS.consulta aria-hidden />
                                {ATTENTION_CONTENT_TAB_LABELS.consulta}
                            </TabsTrigger>
                            {showExamsTab ? (
                                <TabsTrigger
                                    value={ATTENTION_CONTENT_TAB.examenes}
                                    className={attentionContentTabsTriggerClassName}
                                >
                                    <ATTENTION_CONTENT_TAB_ICONS.examenes aria-hidden />
                                    {ATTENTION_CONTENT_TAB_LABELS.examenes}
                                    {formState.requested_service_ids.length > 0 ? (
                                        <span className="text-muted-foreground tabular-nums">
                                            ({formState.requested_service_ids.length})
                                        </span>
                                    ) : null}
                                </TabsTrigger>
                            ) : null}
                            {showFormatosTab ? (
                                <TabsTrigger
                                    value={ATTENTION_CONTENT_TAB.formatos}
                                    className={attentionContentTabsTriggerClassName}
                                >
                                    <ATTENTION_CONTENT_TAB_ICONS.formatos aria-hidden />
                                    {ATTENTION_CONTENT_TAB_LABELS.formatos}
                                    {formState.document_template_ids.length > 0 ? (
                                        <span className="text-muted-foreground tabular-nums">
                                            ({formState.document_template_ids.length})
                                        </span>
                                    ) : null}
                                </TabsTrigger>
                            ) : null}
                        </TabsList>

                        <TabsContent
                            value={ATTENTION_CONTENT_TAB.consulta}
                            className={cn(
                                attentionContentTabsPanelClassName,
                                'flex flex-col gap-4',
                            )}
                        >
                            {consultaFields}
                        </TabsContent>

                        {showExamsTab ? (
                            <TabsContent
                                value={ATTENTION_CONTENT_TAB.examenes}
                                className={attentionContentTabsPanelClassName}
                            >
                                {examsPanel}
                            </TabsContent>
                        ) : null}

                        {showFormatosTab ? (
                            <TabsContent
                                value={ATTENTION_CONTENT_TAB.formatos}
                                className={attentionContentTabsPanelClassName}
                            >
                                {formatosPanel}
                            </TabsContent>
                        ) : null}
                    </Tabs>
                ) : (
                    <div className="flex min-h-[28rem] flex-col gap-4">{consultaFields}</div>
                )}
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="¿Completar la atención?"
                description="Se guardarán los datos de la atención y se cerrará el borrador. Esta acción no se puede deshacer."
                confirmLabel="Completar atención"
                confirming={closing}
                onConfirm={() => {
                    setConfirmOpen(false);
                    void closeAttention();
                }}
            />

            <ConfirmDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
                title="¿Eliminar el borrador?"
                description="Se eliminará esta atención en borrador y los archivos asociados. Esta acción no se puede deshacer."
                confirmLabel={deleting ? 'Eliminando…' : 'Eliminar borrador'}
                confirmVariant="destructive"
                confirming={deleting}
                onConfirm={handleDeleteDraft}
            />
        </div>
    );
}
