import { Form } from '@inertiajs/react';
import { ChevronDown, Mail, Phone, Save, User } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { FormSelect } from '@/components/custom/form-select';
import { Button } from '@/components/ui/button';
import { ClinicalFieldInput } from '@/pages/medic/clinical-attentions/clinical-field-input';
import type {
    ClinicalAttention,
    DoctorOption,
    PatientOption,
    TemplateOption,
} from '@/pages/medic/clinical-attentions/types';
import { CLINICAL_FIELD_CATALOG } from '@/pages/medic/clinical-templates/types';

const SEX_LABELS: Record<string, string> = {
    male: 'Macho',
    female: 'Hembra',
    unknown: 'Desconocido',
};

type AttentionFormPanelProps = {
    formAction: string;
    formMethod: string;
    entity?: ClinicalAttention | null;
    doctors: DoctorOption[];
    templates: TemplateOption[];
    variant?: 'full' | 'embedded';
    patients?: PatientOption[];
    fixedPatientId?: string;
    backToPatientId?: string | null;
    onCancel?: () => void;
    showCancel?: boolean;
};

export function AttentionFormPanel({
    formAction,
    formMethod,
    entity,
    doctors,
    templates,
    variant = 'full',
    patients = [],
    fixedPatientId,
    backToPatientId,
    onCancel,
    showCancel = true,
}: AttentionFormPanelProps) {
    const isEmbedded = variant === 'embedded';

    const defaultTemplateId = useMemo(
        () => templates.find((t) => t.is_default)?.id ?? '',
        [templates],
    );

    const [selectedPatientId, setSelectedPatientId] = useState<string>(
        fixedPatientId ?? entity?.patient_id ?? '',
    );
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
        entity?.template_id ?? defaultTemplateId,
    );

    const selectedPatient = useMemo(
        () => patients.find((p) => p.id === selectedPatientId) ?? null,
        [patients, selectedPatientId],
    );

    const selectedTemplate = useMemo(
        () => templates.find((t) => t.id === selectedTemplateId) ?? null,
        [templates, selectedTemplateId],
    );

    const doctorOptions = useMemo(
        () => doctors.map((d) => ({ id: d.id, label: `${d.first_name} ${d.last_name}` })),
        [doctors],
    );
    const templateOptions = useMemo(
        () => templates.map((t) => ({ id: t.id, label: t.name })),
        [templates],
    );

    const getExistingValue = useCallback(
        (fieldKey: string): unknown =>
            entity?.values?.find((v) => v.field_key === fieldKey)?.value ?? '',
        [entity],
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

    const patientId = fixedPatientId ?? selectedPatientId;

    return (
        <Form
            action={formAction}
            method={formMethod as 'post' | 'get'}
            options={{ preserveScroll: true }}
        >
            {({ processing, errors }) => {
                const patientError = (errors as Record<string, string>).patient_id;

                const metaParts = selectedPatient
                    ? [
                          selectedPatient.sex ? SEX_LABELS[selectedPatient.sex] : null,
                          selectedPatient.weight_kg ? `${selectedPatient.weight_kg} kg` : null,
                          selectedPatient.colors ?? null,
                          selectedPatient.breed ?? null,
                      ].filter(Boolean)
                    : [];

                return (
                    <div className="flex flex-col">
                        {!isEmbedded && (
                            <div className="bg-[#0d1b2a] px-6 py-5 text-white">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1">
                                            <select
                                                id="attention-patient_id"
                                                name="patient_id"
                                                value={selectedPatientId}
                                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                                className="cursor-pointer appearance-none bg-transparent text-xl font-bold text-white outline-none"
                                            >
                                                <option value="">Selecciona un paciente…</option>
                                                {patients.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                        {p.species_name ? ` (${p.species_name})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="size-4 shrink-0 text-slate-400" />
                                        </div>

                                        {metaParts.length > 0 && (
                                            <p className="text-sm text-slate-300">
                                                {metaParts.join(' | ')}
                                            </p>
                                        )}
                                        {selectedPatient && (
                                            <p className="text-sm text-slate-400">
                                                Ficha: {selectedPatient.record_number}
                                            </p>
                                        )}
                                        {patientError && (
                                            <p className="mt-0.5 text-xs text-red-400">{patientError}</p>
                                        )}
                                    </div>

                                    {selectedPatient?.customer_name && (
                                        <div className="flex flex-col gap-1 text-right text-sm">
                                            <span className="flex items-center justify-end gap-1.5 text-slate-300">
                                                <User className="size-3.5 shrink-0" />
                                                {selectedPatient.customer_name}
                                            </span>
                                            {selectedPatient.customer_phone && (
                                                <span className="flex items-center justify-end gap-1.5 text-cyan-400">
                                                    <Phone className="size-3.5 shrink-0" />
                                                    {selectedPatient.customer_phone}
                                                </span>
                                            )}
                                            {selectedPatient.customer_email && (
                                                <span className="flex items-center justify-end gap-1.5 text-cyan-400">
                                                    <Mail className="size-3.5 shrink-0" />
                                                    {selectedPatient.customer_email}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {isEmbedded && (
                            <input type="hidden" name="patient_id" value={patientId} />
                        )}

                        <div
                            className={
                                isEmbedded
                                    ? 'flex flex-col gap-4'
                                    : 'border-b bg-muted/30 px-6 py-4'
                            }
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormSelect
                                    label="Médico"
                                    required
                                    placeholder="Selecciona un médico…"
                                    options={doctorOptions}
                                    error={errors.doctor_id as string | undefined}
                                    selectProps={{
                                        id: 'attention-doctor_id',
                                        name: 'doctor_id',
                                        defaultValue: entity?.doctor_id ?? '',
                                    }}
                                />
                                <FormSelect
                                    label="Plantilla de ficha"
                                    required
                                    placeholder="Selecciona una plantilla…"
                                    options={templateOptions}
                                    error={errors.template_id as string | undefined}
                                    selectProps={{
                                        id: 'attention-template_id',
                                        name: 'template_id',
                                        value: selectedTemplateId,
                                        onChange: (e) => setSelectedTemplateId(e.target.value),
                                    }}
                                />
                            </div>
                        </div>

                        {!selectedTemplate && (
                            <div className="flex items-center justify-center py-16">
                                <p className="text-muted-foreground text-sm">
                                    Selecciona una plantilla para registrar los datos clínicos.
                                </p>
                            </div>
                        )}

                        {vitalFields.length > 0 && (
                            <div className={isEmbedded ? 'flex flex-col gap-4' : 'border-b px-6 py-6'}>
                                <div>
                                    <h2 className="text-base font-semibold">Signos vitales</h2>
                                    <p className="text-muted-foreground mt-0.5 text-sm">
                                        En la sección de historial clínico puedes revisar el gráfico de
                                        evolución de los signos vitales.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                                    {vitalFields.map((field) => (
                                        <ClinicalFieldInput
                                            key={field.field_key}
                                            fieldKey={field.field_key}
                                            defaultValue={getExistingValue(field.field_key)}
                                            error={
                                                (errors as Record<string, string>)[
                                                    `values.${field.field_key}`
                                                ]
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {otherFields.length > 0 && (
                            <div className={isEmbedded ? 'flex flex-col gap-4' : 'border-b px-6 py-6'}>
                                <div>
                                    <h2 className="text-base font-semibold">Datos clínicos</h2>
                                    <p className="text-muted-foreground mt-0.5 text-sm">
                                        Estos detalles son los fundamentales para el diagnóstico y
                                        tratamiento del paciente.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {otherFields.map((field) => (
                                        <ClinicalFieldInput
                                            key={field.field_key}
                                            fieldKey={field.field_key}
                                            defaultValue={getExistingValue(field.field_key)}
                                            error={
                                                (errors as Record<string, string>)[
                                                    `values.${field.field_key}`
                                                ]
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedTemplate && sortedFields.length === 0 && (
                            <div className="flex items-center justify-center py-16">
                                <p className="text-muted-foreground text-sm">
                                    Esta plantilla no tiene campos configurados.
                                </p>
                            </div>
                        )}

                        {backToPatientId && (
                            <input type="hidden" name="back_to_patient_id" value={backToPatientId} />
                        )}

                        <div
                            className={
                                isEmbedded
                                    ? 'flex items-center justify-end gap-3 border-t pt-4'
                                    : 'sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t bg-background px-6 py-4'
                            }
                        >
                            {showCancel && onCancel && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    disabled={processing}
                                >
                                    Cancelar
                                </Button>
                            )}
                            <Button type="submit" disabled={processing}>
                                <Save />
                                {processing ? 'Guardando…' : 'Guardar atención'}
                            </Button>
                        </div>
                    </div>
                );
            }}
        </Form>
    );
}
