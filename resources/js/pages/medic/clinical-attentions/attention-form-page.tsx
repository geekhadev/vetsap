import { Form } from '@inertiajs/react';
import { ChevronDown, Mail, Phone, Save, User } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { Button } from '@/components/ui/button';
import type {
    ClinicalAttention,
    DoctorOption,
    PatientOption,
    TemplateOption,
} from '@/pages/medic/clinical-attentions/types';
import { CLINICAL_FIELD_CATALOG } from '@/pages/medic/clinical-templates/types';

type AttentionFormPageProps = {
    formAction: string;
    formMethod: string;
    entity?: ClinicalAttention | null;
    patients: PatientOption[];
    doctors: DoctorOption[];
    templates: TemplateOption[];
    onCancel: () => void;
};

const SEX_LABELS: Record<string, string> = {
    male: 'Macho',
    female: 'Hembra',
    unknown: 'Desconocido',
};

function ClinicalFieldInput({
    fieldKey,
    defaultValue,
    error,
}: {
    fieldKey: string;
    defaultValue: unknown;
    error?: string;
}) {
    const catalogEntry = CLINICAL_FIELD_CATALOG.find((f) => f.key === fieldKey);

    if (!catalogEntry) {
return null;
}

    const inputName = `values[${fieldKey}]`;
    const inputId = `attention-value-${fieldKey}`;
    const strDefault = defaultValue != null ? String(defaultValue) : '';

    if (catalogEntry.type === 'textarea') {
        return (
            <FormTextarea
                label={catalogEntry.label}
                error={error}
                textareaProps={{ id: inputId, name: inputName, rows: 5, defaultValue: strDefault }}
            />
        );
    }

    if (catalogEntry.type === 'select' && 'options' in catalogEntry) {
        const options = (catalogEntry.options as { id: string; label: string }[]).map(
            (o) => ({ id: o.id, label: o.label }),
        );

        return (
            <FormSelect
                label={catalogEntry.label}
                placeholder="Selecciona…"
                options={options}
                error={error}
                selectProps={{ id: inputId, name: inputName, defaultValue: strDefault }}
            />
        );
    }

    if (catalogEntry.type === 'scale_1_9') {
        const options = Array.from({ length: 9 }, (_, i) => ({ id: String(i + 1), label: String(i + 1) }));

        return (
            <FormSelect
                label={catalogEntry.label}
                placeholder="Selecciona…"
                options={options}
                error={error}
                selectProps={{ id: inputId, name: inputName, defaultValue: strDefault }}
            />
        );
    }

    if (catalogEntry.type === 'scale_1_5') {
        const options = Array.from({ length: 5 }, (_, i) => ({ id: String(i + 1), label: String(i + 1) }));

        return (
            <FormSelect
                label={catalogEntry.label}
                placeholder="Selecciona…"
                options={options}
                error={error}
                selectProps={{ id: inputId, name: inputName, defaultValue: strDefault }}
            />
        );
    }

    if (catalogEntry.type === 'number') {
        return (
            <FormTextInput
                label={catalogEntry.label}
                error={error}
                inputProps={{ id: inputId, name: inputName, type: 'number', step: '0.1', min: '0', defaultValue: strDefault }}
            />
        );
    }

    return (
        <FormTextInput
            label={catalogEntry.label}
            error={error}
            inputProps={{ id: inputId, name: inputName, defaultValue: strDefault }}
        />
    );
}

export function AttentionFormPage({
    formAction,
    formMethod,
    entity,
    patients,
    doctors,
    templates,
    onCancel,
}: AttentionFormPageProps) {
    const defaultTemplateId = useMemo(
        () => templates.find((t) => t.is_default)?.id ?? '',
        [templates],
    );

    const [selectedPatientId, setSelectedPatientId] = useState<string>(entity?.patient_id ?? '');
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
                (f) => CLINICAL_FIELD_CATALOG.find((c) => c.key === f.field_key)?.group === 'Signos vitales',
            ),
        [sortedFields],
    );

    const otherFields = useMemo(
        () =>
            sortedFields.filter(
                (f) => CLINICAL_FIELD_CATALOG.find((c) => c.key === f.field_key)?.group !== 'Signos vitales',
            ),
        [sortedFields],
    );

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
                        {/* ── Header oscuro ── */}
                        <div className="bg-[#0d1b2a] px-6 py-5 text-white">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                {/* Izquierda: selector integrado en el nombre */}
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1">
                                        <select
                                            id="attention-patient_id"
                                            name="patient_id"
                                            value={selectedPatientId}
                                            onChange={(e) => setSelectedPatientId(e.target.value)}
                                            className="appearance-none bg-transparent text-xl font-bold text-white outline-none cursor-pointer"
                                        >
                                            <option value="">Selecciona un paciente…</option>
                                            {patients.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}{p.species_name ? ` (${p.species_name})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="size-4 shrink-0 text-slate-400" />
                                    </div>

                                    {metaParts.length > 0 && (
                                        <p className="text-sm text-slate-300">{metaParts.join(' | ')}</p>
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

                                {/* Derecha: datos del cliente */}
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

                        {/* ── Selectores: médico y plantilla ── */}
                        <div className="border-b bg-muted/30 px-6 py-4">
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

                        {/* ── Sin plantilla seleccionada ── */}
                        {!selectedTemplate && (
                            <div className="flex items-center justify-center py-20">
                                <p className="text-muted-foreground text-sm">
                                    Selecciona una plantilla para registrar los datos clínicos.
                                </p>
                            </div>
                        )}

                        {/* ── Signos vitales ── */}
                        {vitalFields.length > 0 && (
                            <div className="border-b px-6 py-6">
                                <h2 className="text-lg font-bold">Signos vitales</h2>
                                <p className="text-muted-foreground mt-0.5 text-sm">
                                    En la sección de historial clínico puedes revisar el gráfico de evolución de los signos vitales.
                                </p>
                                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                                    {vitalFields.map((field) => (
                                        <ClinicalFieldInput
                                            key={field.field_key}
                                            fieldKey={field.field_key}
                                            defaultValue={getExistingValue(field.field_key)}
                                            error={(errors as Record<string, string>)[`values.${field.field_key}`]}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Datos clínicos ── */}
                        {otherFields.length > 0 && (
                            <div className="border-b px-6 py-6">
                                <h2 className="text-lg font-bold">Datos clínicos</h2>
                                <p className="text-muted-foreground mt-0.5 text-sm">
                                    Estos detalles son los fundamentales para el diagnóstico y tratamiento del paciente.
                                </p>
                                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {otherFields.map((field) => (
                                        <ClinicalFieldInput
                                            key={field.field_key}
                                            fieldKey={field.field_key}
                                            defaultValue={getExistingValue(field.field_key)}
                                            error={(errors as Record<string, string>)[`values.${field.field_key}`]}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Plantilla sin campos ── */}
                        {selectedTemplate && sortedFields.length === 0 && (
                            <div className="flex items-center justify-center py-20">
                                <p className="text-muted-foreground text-sm">
                                    Esta plantilla no tiene campos configurados.
                                </p>
                            </div>
                        )}

                        {/* ── Footer sticky ── */}
                        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t bg-background px-6 py-4">
                            <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
                                Cancelar
                            </Button>
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
