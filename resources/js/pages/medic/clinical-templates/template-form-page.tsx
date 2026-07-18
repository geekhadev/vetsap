import { useForm } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';
import { FormMultiSelect } from '@/components/custom/form-multi-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { CLINICAL_FIELD_CATALOG } from '@/pages/medic/clinical-templates/types';
import type {
    ClinicalFieldKey,
    ClinicalTemplate,
    ClinicalTemplateField,
    SpeciesOption,
} from '@/pages/medic/clinical-templates/types';

type SelectedField = {
    field_key: ClinicalFieldKey;
    label: string;
    is_required: boolean;
    is_shared_with_client: boolean;
};

type FormData = {
    name: string;
    description: string;
    species_ids: string[];
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
    }, new Map<string, (typeof CLINICAL_FIELD_CATALOG)[number][]>()),
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
            is_shared_with_client: f.is_shared_with_client,
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
        species_ids: template?.species?.map((item) => item.id) ?? [],
        is_default: template?.is_default ?? false,
        is_active: template?.is_active ?? true,
        fields: buildInitialFields(template?.fields),
    });

    const speciesOptions = useMemo(
        () => species.map((s) => ({ value: s.id, label: s.name })),
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
                    {
                        field_key: key,
                        label: entry.label,
                        is_required: true,
                        is_shared_with_client: false,
                    },
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

    const updateFieldFlag = useCallback(
        (
            key: ClinicalFieldKey,
            flag: 'is_required' | 'is_shared_with_client',
            value: boolean,
        ) => {
            form.setData(
                'fields',
                form.data.fields.map((f) =>
                    f.field_key === key ? { ...f, [flag]: value } : f,
                ),
            );
        },
        [form],
    );

    const getField = useCallback(
        (key: ClinicalFieldKey) => form.data.fields.find((f) => f.field_key === key),
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

                            <FormMultiSelect
                                id="template-species_ids"
                                label="Especies (opcional)"
                                placeholder="Cualquier especie"
                                searchPlaceholder="Buscar especie…"
                                options={speciesOptions}
                                values={form.data.species_ids}
                                onValuesChange={(values) =>
                                    form.setData('species_ids', values)
                                }
                                error={form.errors.species_ids}
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
                                Marca los campos que quieres incluir. En los marcados, define si son
                                obligatorios y si se comparten con el cliente.
                            </p>
                        </div>

                        {CATALOG_GROUPS.map(([group, fields]) => (
                            <div key={group} className="flex flex-col gap-2">
                                <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                                    {group}
                                </Label>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {fields.map((field) => {
                                        const checked = selectedKeys.has(field.key);
                                        const selected = getField(field.key);

                                        return (
                                            <div
                                                key={field.key}
                                                className={`flex flex-col gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                                                    checked
                                                        ? 'border-primary/40 bg-primary/5'
                                                        : 'hover:bg-accent'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
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
                                                </div>

                                                {checked && selected && (
                                                    <div className="flex flex-col gap-2 border-t pt-2">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <Label
                                                                htmlFor={`field-${field.key}-required`}
                                                                className="text-muted-foreground text-xs font-normal"
                                                            >
                                                                Obligatorio
                                                            </Label>
                                                            <Switch
                                                                id={`field-${field.key}-required`}
                                                                checked={selected.is_required}
                                                                onCheckedChange={(v) =>
                                                                    updateFieldFlag(
                                                                        field.key,
                                                                        'is_required',
                                                                        v,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <Label
                                                                htmlFor={`field-${field.key}-shared`}
                                                                className="text-muted-foreground text-xs font-normal"
                                                            >
                                                                Compartir con cliente
                                                            </Label>
                                                            <Switch
                                                                id={`field-${field.key}-shared`}
                                                                checked={selected.is_shared_with_client}
                                                                onCheckedChange={(v) =>
                                                                    updateFieldFlag(
                                                                        field.key,
                                                                        'is_shared_with_client',
                                                                        v,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
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
