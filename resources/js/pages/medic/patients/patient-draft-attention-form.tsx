import { CheckCircle2, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { FormSelect } from '@/components/custom/form-select';
import { Button } from '@/components/ui/button';
import { ClinicalFieldInput } from '@/pages/medic/clinical-attentions/clinical-field-input';
import type { ClinicalAttention } from '@/pages/medic/clinical-attentions/types';
import type { ClinicalFieldKey } from '@/pages/medic/clinical-templates/types';
import { CLINICAL_FIELD_CATALOG } from '@/pages/medic/clinical-templates/types';
import { usePatientDraftAttention } from '@/pages/medic/patients/hooks/use-patient-draft-attention';
import type { PatientDoctorOption, PatientTemplateOption } from '@/pages/medic/patients/types';

type PatientDraftAttentionFormProps = {
    patientId: string;
    draftAttention: ClinicalAttention | null;
    templates: PatientTemplateOption[];
    doctors: PatientDoctorOption[];
    onDraftSaved?: () => void;
};

function SaveStatusLabel({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
    if (status === 'saving') {
        return (
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Loader2 className="size-3.5 animate-spin" />
                Guardando borrador…
            </span>
        );
    }

    if (status === 'saved') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle2 className="size-3.5" />
                Borrador guardado
            </span>
        );
    }

    if (status === 'error') {
        return <span className="text-destructive text-xs">No se pudo guardar el borrador.</span>;
    }

    return <span className="text-muted-foreground text-xs">Los cambios se guardan automáticamente.</span>;
}

export function PatientDraftAttentionForm({
    patientId,
    draftAttention,
    templates,
    doctors,
    onDraftSaved,
}: PatientDraftAttentionFormProps) {
    const defaultTemplateId = useMemo(
        () => templates.find((t) => t.is_default)?.id ?? templates[0]?.id ?? '',
        [templates],
    );

    const {
        formState,
        saveStatus,
        closeErrors,
        closing,
        setTemplateId,
        setDoctorId,
        setFieldValue,
        closeAttention,
    } = usePatientDraftAttention({
        patientId,
        draftAttention,
        defaultTemplateId,
        onDraftSaved,
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
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-sm">
                    Borrador en curso. Cierra la atención cuando hayas terminado el registro clínico.
                </p>
                <SaveStatusLabel status={saveStatus} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>

            {!selectedTemplate && (
                <p className="text-muted-foreground text-sm">
                    Selecciona una plantilla para registrar los datos clínicos.
                </p>
            )}

            {vitalFields.length > 0 && (
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-base font-semibold">Signos vitales</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
                </div>
            )}

            {otherFields.length > 0 && (
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-base font-semibold">Datos clínicos</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t pt-4">
                <Button type="button" onClick={closeAttention} disabled={closing}>
                    {closing ? 'Cerrando…' : 'Cerrar atención'}
                </Button>
            </div>
        </div>
    );
}
