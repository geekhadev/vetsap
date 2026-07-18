import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { FormMultiSelect } from '@/components/custom/form-multi-select';
import { FormSelect } from '@/components/custom/form-select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ClinicalFieldInput } from '@/pages/medic/clinical-attentions/clinical-field-input';
import type { ClinicalAttention } from '@/pages/medic/clinical-attentions/types';
import type { ClinicalFieldKey } from '@/pages/medic/clinical-templates/types';
import { CLINICAL_FIELD_CATALOG } from '@/pages/medic/clinical-templates/types';
import { usePatientDraftAttention } from '@/pages/medic/patients/hooks/use-patient-draft-attention';
import type {
    DocumentTemplateOption,
    ExamServiceOption,
    PatientDoctorOption,
    PatientTemplateOption,
} from '@/pages/medic/patients/types';

type PatientDraftAttentionFormProps = {
    patientId: string;
    draftAttention: ClinicalAttention | null;
    templates: PatientTemplateOption[];
    doctors: PatientDoctorOption[];
    examServices: ExamServiceOption[];
    documentTemplates: DocumentTemplateOption[];
    title: string;
    description: string;
    onDraftSaved?: () => void;
    onDraftCompleted?: () => void;
    onDismiss?: () => void;
};

export function PatientDraftAttentionForm({
    patientId,
    draftAttention,
    templates,
    doctors,
    examServices,
    documentTemplates,
    title,
    description,
    onDraftSaved,
    onDraftCompleted,
    onDismiss,
}: PatientDraftAttentionFormProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);

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
        closeErrors,
        closing,
        setTemplateId,
        setDoctorId,
        setFieldValue,
        setRequestedServiceIds,
        setDocumentTemplateIds,
        closeAttention,
    } = usePatientDraftAttention({
        patientId,
        draftAttention,
        defaultTemplateId,
        defaultDoctorId,
        onDraftSaved,
        onDraftCompleted,
    });

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

    if (templates.length === 0 || doctors.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                Configura plantillas clínicas y médicos activos para registrar atenciones.
            </p>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between gap-3 border-b p-4">
                <div className="min-w-0 space-y-1.5">
                    <h2 className="text-foreground text-base leading-none font-semibold">{title}</h2>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setConfirmOpen(true)}
                        disabled={closing}
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
                        >
                            <X className="size-4" aria-hidden />
                            <span className="sr-only">Cerrar</span>
                        </Button>
                    ) : null}
                </div>
            </div>

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

                {!selectedTemplate && showTemplateSelect ? (
                    <p className="text-muted-foreground text-sm">
                        Selecciona una plantilla para registrar los datos clínicos.
                    </p>
                ) : null}

                {vitalFields.length > 0 && (
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
                )}

                {vitalFields.length > 0 && otherFields.length > 0 ? (
                    <div className="border-border border-t" role="separator" />
                ) : null}

                {otherFields.length > 0 && (
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
                )}

                {(otherFields.length > 0 || vitalFields.length > 0) &&
                (examServiceOptions.length > 0 || documentTemplateOptions.length > 0) ? (
                    <div className="border-border border-t" role="separator" />
                ) : null}

                {examServiceOptions.length > 0 || documentTemplateOptions.length > 0 ? (
                    <div
                        className={cn(
                            'grid grid-cols-1 gap-4',
                            examServiceOptions.length > 0 &&
                                documentTemplateOptions.length > 0 &&
                                'sm:grid-cols-2',
                        )}
                    >
                        {examServiceOptions.length > 0 ? (
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
                                    closeErrors.requested_service_ids ??
                                    closeErrors['requested_service_ids.0']
                                }
                            />
                        ) : null}

                        {documentTemplateOptions.length > 0 ? (
                            <FormMultiSelect
                                id="draft-attention-document_template_ids"
                                label="Formatos"
                                placeholder="Selecciona uno o más formatos…"
                                searchPlaceholder="Buscar formato…"
                                emptyMessage="No hay formatos disponibles."
                                options={documentTemplateOptions}
                                values={formState.document_template_ids}
                                onValuesChange={setDocumentTemplateIds}
                                error={
                                    closeErrors.document_template_ids ??
                                    closeErrors['document_template_ids.0']
                                }
                            />
                        ) : null}
                    </div>
                ) : null}
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
        </div>
    );
}
