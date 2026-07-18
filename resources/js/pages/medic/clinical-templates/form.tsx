import { GripVertical, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormMultiSelect } from '@/components/custom/form-multi-select';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useClinicalTemplateForm } from '@/pages/medic/clinical-templates/hooks/use-form';
import { CLINICAL_FIELD_CATALOG } from '@/pages/medic/clinical-templates/types';
import type {
    ClinicalFieldKey,
    ClinicalTemplate,
    ClinicalTemplateField,
    SpeciesOption,
} from '@/pages/medic/clinical-templates/types';

type ClinicalTemplateFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: ClinicalTemplate | null;
    speciesOptions: SpeciesOption[];
};

type SelectedField = {
    field_key: ClinicalFieldKey;
    label: string;
    is_required: boolean;
    is_shared_with_client: boolean;
};

function buildSelectedFields(fields: ClinicalTemplateField[] | undefined): SelectedField[] {
    if (!fields?.length) {
        return [];
    }

    return [...fields]
        .sort((a, b) => a.field_order - b.field_order)
        .map((f) => ({
            field_key: f.field_key,
            label: f.label,
            is_required: f.is_required,
            is_shared_with_client: f.is_shared_with_client,
        }));
}

export function ClinicalTemplateForm({
    open,
    onOpenChange,
    entity,
    speciesOptions,
}: ClinicalTemplateFormProps) {
    const { isEdit, formProps, headTitle, description } = useClinicalTemplateForm({ entity });

    const [selectedFields, setSelectedFields] = useState<SelectedField[]>(() =>
        buildSelectedFields(entity?.fields),
    );

    const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<string[]>(
        () => entity?.species?.map((item) => item.id) ?? [],
    );

    const speciesSelectOptions = useMemo(
        () => speciesOptions.map((item) => ({ value: item.id, label: item.name })),
        [speciesOptions],
    );

    const usedKeys = useMemo(
        () => new Set(selectedFields.map((f) => f.field_key)),
        [selectedFields],
    );

    const availableCatalogOptions = useMemo(
        () =>
            CLINICAL_FIELD_CATALOG.filter((f) => !usedKeys.has(f.key)).map((f) => ({
                id: f.key,
                label: `${f.label} (${f.group})`,
            })),
        [usedKeys],
    );

    const addField = useCallback((key: ClinicalFieldKey) => {
        const catalogEntry = CLINICAL_FIELD_CATALOG.find((f) => f.key === key);

        if (!catalogEntry) {
return;
}

        setSelectedFields((prev) => [
            ...prev,
            {
                field_key: key,
                label: catalogEntry.label,
                is_required: true,
                is_shared_with_client: false,
            },
        ]);
    }, []);

    const removeField = useCallback((key: ClinicalFieldKey) => {
        setSelectedFields((prev) => prev.filter((f) => f.field_key !== key));
    }, []);

    const updateFieldFlag = useCallback(
        (key: ClinicalFieldKey, flag: 'is_required' | 'is_shared_with_client', value: boolean) => {
            setSelectedFields((prev) =>
                prev.map((f) => (f.field_key === key ? { ...f, [flag]: value } : f)),
            );
        },
        [],
    );

    // Reset al abrir/cerrar
    const handleOpenChange = useCallback(
        (value: boolean) => {
            if (!value) {
                setSelectedFields(buildSelectedFields(entity?.fields));
                setSelectedSpeciesIds(entity?.species?.map((item) => item.id) ?? []);
            }

            onOpenChange(value);
        },
        [entity, onOpenChange],
    );

    return (
        <InertiaFormDialog<Record<string, unknown>>
            open={open}
            onOpenChange={handleOpenChange}
            title={headTitle}
            description={description}
            formKey={entity?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
            contentClassName="sm:max-w-2xl"
        >
            {({ processing, errors }) => (
                <>
                    <FormTextInput
                        label="Nombre"
                        required
                        placeholder='Ej. "Consulta general felinos"'
                        error={errors.name as string | undefined}
                        inputProps={{
                            id: 'clinical-template-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                        }}
                    />

                    <FormTextarea
                        label="Descripción"
                        placeholder="Opcional. Describe cuándo usar esta plantilla."
                        error={errors.description as string | undefined}
                        textareaProps={{
                            id: 'clinical-template-description',
                            name: 'description',
                            rows: 2,
                            defaultValue: entity?.description ?? '',
                        }}
                    />

                    <FormMultiSelect
                        id="clinical-template-species_ids"
                        label="Especies (opcional)"
                        placeholder="Cualquier especie"
                        searchPlaceholder="Buscar especie…"
                        options={speciesSelectOptions}
                        values={selectedSpeciesIds}
                        onValuesChange={setSelectedSpeciesIds}
                        error={errors.species_ids as string | undefined}
                    />
                    {selectedSpeciesIds.map((speciesId, index) => (
                        <input
                            key={speciesId}
                            type="hidden"
                            name={`species_ids[${index}]`}
                            value={speciesId}
                        />
                    ))}

                    <Separator />

                    {/* Campos seleccionados */}
                    <div className="flex flex-col gap-2">
                        <Label>Campos de la plantilla</Label>

                        {selectedFields.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                Agrega campos desde el catálogo.
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-1">
                                {selectedFields.map((field, index) => (
                                    <li
                                        key={field.field_key}
                                        className="flex items-center gap-2 rounded-md border px-3 py-2"
                                    >
                                        {/* Campos ocultos para enviar al servidor */}
                                        <input
                                            type="hidden"
                                            name={`fields[${index}][field_key]`}
                                            value={field.field_key}
                                        />
                                        <input
                                            type="hidden"
                                            name={`fields[${index}][field_order]`}
                                            value={index}
                                        />
                                        <input
                                            type="hidden"
                                            name={`fields[${index}][is_required]`}
                                            value={field.is_required ? '1' : '0'}
                                        />
                                        <input
                                            type="hidden"
                                            name={`fields[${index}][is_shared_with_client]`}
                                            value={field.is_shared_with_client ? '1' : '0'}
                                        />

                                        <GripVertical className="text-muted-foreground size-4 shrink-0" />

                                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                                            <span className="text-sm font-medium">
                                                {field.label}
                                            </span>
                                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                                                <div className="flex items-center justify-between gap-2 sm:justify-start">
                                                    <Label
                                                        htmlFor={`fields-${index}-required`}
                                                        className="text-muted-foreground text-xs font-normal"
                                                    >
                                                        Obligatorio
                                                    </Label>
                                                    <Switch
                                                        id={`fields-${index}-required`}
                                                        checked={field.is_required}
                                                        onCheckedChange={(v) =>
                                                            updateFieldFlag(
                                                                field.field_key,
                                                                'is_required',
                                                                v,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between gap-2 sm:justify-start">
                                                    <Label
                                                        htmlFor={`fields-${index}-shared`}
                                                        className="text-muted-foreground text-xs font-normal"
                                                    >
                                                        Compartir con cliente
                                                    </Label>
                                                    <Switch
                                                        id={`fields-${index}-shared`}
                                                        checked={field.is_shared_with_client}
                                                        onCheckedChange={(v) =>
                                                            updateFieldFlag(
                                                                field.field_key,
                                                                'is_shared_with_client',
                                                                v,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive shrink-0"
                                            onClick={() => removeField(field.field_key)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Agregar campo desde catálogo */}
                        {availableCatalogOptions.length > 0 && (
                            <FormSelect
                                label="Agregar campo"
                                placeholder="Selecciona un campo del catálogo…"
                                options={availableCatalogOptions}
                                selectProps={{
                                    id: 'clinical-template-add-field',
                                    name: '_add_field',
                                    value: '',
                                    onChange: (e) => {
                                        if (e.target.value) {
                                            addField(e.target.value as ClinicalFieldKey);
                                            e.target.value = '';
                                        }
                                    },
                                }}
                            />
                        )}
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormBooleanSwitch
                            label="Plantilla por defecto"
                            name="is_default"
                            defaultChecked={entity?.is_default ?? false}
                            error={errors.is_default as string | undefined}
                            description="Solo puede haber una plantilla por defecto. Al activar esta opción, se desmarca la plantilla predeterminada actual."
                        />

                        <FormBooleanSwitch
                            label="Activa"
                            name="is_active"
                            defaultChecked={entity?.is_active ?? true}
                            error={errors.is_active as string | undefined}
                            description="Las plantillas inactivas no aparecen al crear atenciones."
                        />
                    </div>

                    <FormDialogFooter
                        onCancel={() => handleOpenChange(false)}
                        processing={processing}
                        isEdit={isEdit}
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
