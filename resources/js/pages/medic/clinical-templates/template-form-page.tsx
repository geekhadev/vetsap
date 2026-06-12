import { useForm } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    CLINICAL_FIELD_CATALOG
    
    
    
    
} from '@/pages/medic/clinical-templates/types';
import type {ClinicalFieldKey, ClinicalTemplate, ClinicalTemplateField, SpeciesOption} from '@/pages/medic/clinical-templates/types';

type SelectedField = {
    field_key: ClinicalFieldKey;
    label: string;
    is_required: boolean;
};

type FormData = {
    name: string;
    description: string;
    species_id: string;
    is_default: boolean;
    is_active: boolean;
    fields: SelectedField[];
};

type TemplateFormPageProps = {
    template?: ClinicalTemplate | null;
    species: SpeciesOption[];
    submitUrl: string;
    method: 'post' | 'put';
    onCancel: () => void;
};

// Grupos del catálogo para renderizar
const CATALOG_GROUPS = Array.from(
    CLINICAL_FIELD_CATALOG.reduce((acc, f) => {
        if (!acc.has(f.group)) {
acc.set(f.group, []);
}

        acc.get(f.group)!.push(f);

        return acc;
    }, new Map<string, typeof CLINICAL_FIELD_CATALOG[number][]>()),
);

function buildInitialFields(fields?: ClinicalTemplateField[]): SelectedField[] {
    if (!fields?.length) {
return [];
}

    return [...fields]
        .sort((a, b) => a.field_order - b.field_order)
        .map((f) => ({
            field_key: f.field_key as ClinicalFieldKey,
            label: f.label,
            is_required: f.is_required,
        }));
}

export function TemplateFormPage({
    template,
    species,
    submitUrl,
    method,
    onCancel,
}: TemplateFormPageProps) {
    const form = useForm<FormData>({
        name: template?.name ?? '',
        description: template?.description ?? '',
        species_id: template?.species_id ?? '',
        is_default: template?.is_default ?? false,
        is_active: template?.is_active ?? true,
        fields: buildInitialFields(template?.fields),
    });

    const speciesOptions = useMemo(
        () => species.map((s) => ({ id: s.id, label: s.name })),
        [species],
    );

    const selectedKeys = useMemo(
        () => new Set(form.data.fields.map((f) => f.field_key)),
        [form.data.fields],
    );

    const toggleField = useCallback(
        (key: ClinicalFieldKey, checked: boolean) => {
            if (checked) {
                const entry = CLINICAL_FIELD_CATALOG.find((f) => f.key === key)!;
                form.setData('fields', [
                    ...form.data.fields,
                    { field_key: key, label: entry.label, is_required: false },
                ]);
            } else {
                form.setData(
                    'fields',
                    form.data.fields.filter((f) => f.field_key !== key),
                );
            }
        },
        [form],
    );

    const toggleRequired = useCallback(
        (key: ClinicalFieldKey) => {
            form.setData(
                'fields',
                form.data.fields.map((f) =>
                    f.field_key === key ? { ...f, is_required: !f.is_required } : f,
                ),
            );
        },
        [form],
    );

    const isRequired = useCallback(
        (key: ClinicalFieldKey) =>
            form.data.fields.find((f) => f.field_key === key)?.is_required ?? false,
        [form.data.fields],
    );

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (method === 'put') {
            form.put(submitUrl);
        } else {
            form.post(submitUrl);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 lg:flex-row lg:items-start lg:gap-8">

                {/* ── Columna izquierda: info base ── */}
                <div className="flex w-full flex-col gap-4 lg:max-w-xs">
                    <Card className="shadow-xs">
                        <CardContent className="flex flex-col gap-4">
                            <FormTextInput
                                label="Nombre"
                                required
                                placeholder='Ej. "Consulta general felinos"'
                                error={form.errors.name}
                                inputProps={{
                                    id: 'template-name',
                                    name: 'name',
                                    maxLength: 255,
                                    value: form.data.name,
                                    onChange: (e) => form.setData('name', e.target.value),
                                }}
                            />

                            <FormTextarea
                                label="Descripción"
                                placeholder="Cuándo usar esta plantilla…"
                                error={form.errors.description}
                                textareaProps={{
                                    id: 'template-description',
                                    name: 'description',
                                    rows: 3,
                                    value: form.data.description,
                                    onChange: (e) => form.setData('description', e.target.value),
                                }}
                            />

                            <FormSelect
                                label="Especie (opcional)"
                                placeholder="Cualquier especie"
                                options={speciesOptions}
                                error={form.errors.species_id}
                                selectProps={{
                                    id: 'template-species_id',
                                    name: 'species_id',
                                    value: form.data.species_id,
                                    onChange: (e) => form.setData('species_id', e.target.value),
                                }}
                            />

                            <Separator />

                            <div className="flex items-center justify-between gap-3">
                                <div className="grid gap-1">
                                    <Label htmlFor="template-is_default">Plantilla por defecto</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Solo puede haber una plantilla por defecto. Al activar esta opción, se desmarca la plantilla predeterminada actual.
                                    </p>
                                </div>
                                <Switch
                                    id="template-is_default"
                                    checked={form.data.is_default}
                                    onCheckedChange={(v) => form.setData('is_default', v)}
                                />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <div className="grid gap-1">
                                    <Label htmlFor="template-is_active">Activa</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Las plantillas inactivas no aparecen al crear atenciones.
                                    </p>
                                </div>
                                <Switch
                                    id="template-is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(v) => form.setData('is_active', v)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onCancel}
                            disabled={form.processing}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1" disabled={form.processing}>
                            {form.processing ? 'Guardando…' : 'Guardar plantilla'}
                        </Button>
                    </div>
                </div>

                {/* ── Columna derecha: catálogo de campos ── */}
                <Card className="min-w-0 flex-1 shadow-xs">
                    <CardContent className="flex flex-col gap-5 pt-6">
                        <div>
                            <h2 className="text-sm font-semibold">Campos de la plantilla</h2>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                Marca los campos que quieres incluir. En los marcados, define si son obligatorios u opcionales.
                            </p>
                        </div>

                        {CATALOG_GROUPS.map(([group, fields]) => (
                            <div key={group} className="flex flex-col gap-2">
                                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                                    {group}
                                </Label>

                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {fields.map((field) => {
                                        const checked = selectedKeys.has(field.key);

                                        return (
                                            <div
                                                key={field.key}
                                                className={`flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                                                    checked
                                                        ? 'border-primary/40 bg-primary/5'
                                                        : 'hover:bg-accent'
                                                }`}
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(v) =>
                                                        toggleField(field.key, v === true)
                                                    }
                                                    id={`field-${field.key}`}
                                                />
                                                <label
                                                    htmlFor={`field-${field.key}`}
                                                    className="min-w-0 flex-1 cursor-pointer text-sm"
                                                >
                                                    {field.label}
                                                </label>

                                                {checked && (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRequired(field.key)}
                                                        className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                                                            isRequired(field.key)
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                        }`}
                                                    >
                                                        {isRequired(field.key) ? 'Obligatorio' : 'Opcional'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </form>
    );
}
