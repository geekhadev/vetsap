import { CirclePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useVaccinationProtocolForm } from '@/pages/medic/vaccination-protocols/hooks/use-form';
import type {
    ProtocolItemFormRow,
    SpeciesOption,
    VaccinationProtocol,
    VaccinationScheduleType,
    VaccineProductOption,
} from '@/pages/medic/vaccination-protocols/types';
import {
    VACCINATION_SCHEDULE_TYPE_OPTIONS,
    emptyProtocolItemRow,
    itemsFromProtocol,
} from '@/pages/medic/vaccination-protocols/types';

type VaccinationProtocolFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: VaccinationProtocol | null;
    species: SpeciesOption[];
    vaccineProducts: VaccineProductOption[];
};

export function VaccinationProtocolForm({
    open,
    onOpenChange,
    entity,
    species,
    vaccineProducts,
}: VaccinationProtocolFormProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-7xl">
                {open ? (
                    <VaccinationProtocolFormInner
                        key={entity?.id ?? 'create'}
                        entity={entity}
                        species={species}
                        vaccineProducts={vaccineProducts}
                        onClose={() => onOpenChange(false)}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

function VaccinationProtocolFormInner({
    entity,
    species,
    vaccineProducts,
    onClose,
}: {
    entity: VaccinationProtocol | null;
    species: SpeciesOption[];
    vaccineProducts: VaccineProductOption[];
    onClose: () => void;
}) {
    const { isEdit, headTitle, description, form, submit } =
        useVaccinationProtocolForm(entity);
    const [itemRows, setItemRows] = useState<ProtocolItemFormRow[]>(() =>
        itemsFromProtocol(entity?.items),
    );

    const speciesOptions = species.map((item) => ({
        id: item.id,
        label: item.name,
    }));
    const productOptions = vaccineProducts.map((item) => ({
        id: item.id,
        label: item.name,
    }));
    const scheduleOptions = VACCINATION_SCHEDULE_TYPE_OPTIONS.map((item) => ({
        id: item.id,
        label: item.label,
    }));

    function updateItem(key: string, patch: Partial<ProtocolItemFormRow>) {
        setItemRows((rows) =>
            rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
        );
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        submit(itemRows, onClose);
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>{headTitle}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <form
                className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto py-2"
                onSubmit={handleSubmit}
            >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <FormTextInput
                        label="Nombre"
                        placeholder='Ej. "Plan Canino 1"'
                        required
                        containerClassName="sm:col-span-2"
                        error={form.errors.name}
                        inputProps={{
                            id: 'vaccination-protocol-name',
                            value: form.data.name,
                            onChange: (event) =>
                                form.setData('name', event.target.value),
                            maxLength: 255,
                        }}
                    />

                    <FormSelect
                        label="Especie"
                        placeholder="Selecciona una especie"
                        required
                        options={speciesOptions}
                        error={form.errors.species_id}
                        selectProps={{
                            id: 'vaccination-protocol-species_id',
                            value: form.data.species_id,
                            onChange: (event) =>
                                form.setData('species_id', event.target.value),
                        }}
                    />
                </div>

                <div className="flex flex-row flex-wrap items-center justify-between gap-3">
                    <div className="grid min-w-0 gap-1">
                        <Label htmlFor="vaccination-protocol-is_active">
                            Activo
                        </Label>
                        <p className="text-muted-foreground text-sm">
                            Si está inactivo no se podrá asignar a nuevos
                            pacientes.
                        </p>
                    </div>
                    <Switch
                        id="vaccination-protocol-is_active"
                        checked={form.data.is_active}
                        onCheckedChange={(value) =>
                            form.setData('is_active', value)
                        }
                    />
                </div>
                <InputError message={form.errors.is_active} />

                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <Label>Dosis del protocolo</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setItemRows((rows) => [
                                    ...rows,
                                    emptyProtocolItemRow(),
                                ])
                            }
                        >
                            <CirclePlus className="size-4" />
                            Agregar dosis
                        </Button>
                    </div>
                    <InputError message={form.errors.items} />

                    {vaccineProducts.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No hay productos de tipo Vacunas. Crea productos con
                            ese tipo en Store antes de armar el protocolo.
                        </p>
                    ) : null}

                    <div className="space-y-4">
                        {itemRows.map((row, index) => (
                            <ProtocolItemFields
                                key={row.key}
                                index={index}
                                row={row}
                                productOptions={productOptions}
                                scheduleOptions={scheduleOptions}
                                canRemove={itemRows.length > 1}
                                errors={form.errors}
                                onChange={(patch) => updateItem(row.key, patch)}
                                onRemove={() =>
                                    setItemRows((rows) =>
                                        rows.filter(
                                            (item) => item.key !== row.key,
                                        ),
                                    )
                                }
                            />
                        ))}
                    </div>
                </div>

                <FormDialogFooter
                    onCancel={onClose}
                    processing={form.processing}
                    isEdit={isEdit}
                />
            </form>
        </>
    );
}

function ProtocolItemFields({
    index,
    row,
    productOptions,
    scheduleOptions,
    canRemove,
    errors,
    onChange,
    onRemove,
}: {
    index: number;
    row: ProtocolItemFormRow;
    productOptions: Array<{ id: string; label: string }>;
    scheduleOptions: Array<{ id: string; label: string }>;
    canRemove: boolean;
    errors: Record<string, string>;
    onChange: (patch: Partial<ProtocolItemFormRow>) => void;
    onRemove: () => void;
}) {
    return (
        <div className="bg-muted/30 space-y-3 rounded-xl border p-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Dosis {index + 1}</p>
                {canRemove ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        aria-label={`Eliminar dosis ${index + 1}`}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <FormSelect
                    label="Producto (Vacunas)"
                    placeholder="Selecciona un producto"
                    required
                    options={productOptions}
                    error={errors[`items.${index}.product_id`]}
                    selectProps={{
                        id: `vaccination-protocol-item-${index}-product_id`,
                        value: row.product_id,
                        onChange: (event) =>
                            onChange({ product_id: event.target.value }),
                    }}
                />

                <FormSelect
                    label="Tipo de programación"
                    required
                    options={scheduleOptions}
                    error={errors[`items.${index}.schedule_type`]}
                    selectProps={{
                        id: `vaccination-protocol-item-${index}-schedule_type`,
                        value: row.schedule_type,
                        onChange: (event) =>
                            onChange({
                                schedule_type: event.target
                                    .value as VaccinationScheduleType,
                                series_key:
                                    event.target.value === 'unique'
                                        ? ''
                                        : row.series_key,
                            }),
                    }}
                />

                {row.schedule_type === 'from_birth_weeks' ? (
                    <FormTextInput
                        label="Semana desde nacimiento"
                        required
                        error={errors[`items.${index}.week_number`]}
                        inputProps={{
                            id: `vaccination-protocol-item-${index}-week_number`,
                            type: 'number',
                            min: 0,
                            value: row.week_number,
                            onChange: (event) =>
                                onChange({ week_number: event.target.value }),
                        }}
                    />
                ) : null}

                {row.schedule_type === 'unique' ? (
                    <FormTextInput
                        label="Edad mínima (semanas)"
                        required
                        error={errors[`items.${index}.min_age_weeks`]}
                        inputProps={{
                            id: `vaccination-protocol-item-${index}-min_age_weeks`,
                            type: 'number',
                            min: 0,
                            value: row.min_age_weeks,
                            onChange: (event) =>
                                onChange({ min_age_weeks: event.target.value }),
                        }}
                    />
                ) : null}

                {row.schedule_type === 'unique' ? (
                    <FormTextInput
                        label="Edad máxima (semanas)"
                        required
                        error={errors[`items.${index}.max_age_weeks`]}
                        inputProps={{
                            id: `vaccination-protocol-item-${index}-max_age_weeks`,
                            type: 'number',
                            min: 0,
                            value: row.max_age_weeks,
                            onChange: (event) =>
                                onChange({ max_age_weeks: event.target.value }),
                        }}
                    />
                ) : null}

                {row.schedule_type === 'periodic' ? (
                    <FormTextInput
                        label="Intervalo (meses)"
                        required
                        error={errors[`items.${index}.interval_months`]}
                        inputProps={{
                            id: `vaccination-protocol-item-${index}-interval_months`,
                            type: 'number',
                            min: 1,
                            value: row.interval_months,
                            onChange: (event) =>
                                onChange({
                                    interval_months: event.target.value,
                                }),
                        }}
                    />
                ) : null}

                {row.schedule_type !== 'unique' ? (
                    <FormTextInput
                        label="Clave de serie (opcional)"
                        placeholder='Ej. "sextuple"'
                        error={errors[`items.${index}.series_key`]}
                        inputProps={{
                            id: `vaccination-protocol-item-${index}-series_key`,
                            value: row.series_key,
                            onChange: (event) =>
                                onChange({ series_key: event.target.value }),
                            maxLength: 64,
                        }}
                    />
                ) : null}
            </div>
        </div>
    );
}
