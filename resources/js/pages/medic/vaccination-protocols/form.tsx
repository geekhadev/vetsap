import { ChevronDown, ChevronUp, CirclePlus, Trash2 } from 'lucide-react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

    function moveItem(key: string, direction: -1 | 1) {
        setItemRows((rows) => {
            const index = rows.findIndex((row) => row.key === key);

            if (index < 0) {
                return rows;
            }

            const target = index + direction;

            if (target < 0 || target >= rows.length) {
                return rows;
            }

            const next = [...rows];
            const [moved] = next.splice(index, 1);
            next.splice(target, 0, moved);

            return next;
        });
    }

    function addItem() {
        setItemRows((rows) => [...rows, emptyProtocolItemRow()]);
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
                <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_14rem_auto]">
                    <FormTextInput
                        label="Nombre"
                        placeholder='Ej. "Plan Canino 1"'
                        required
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

                    <div className="flex items-center gap-3 pb-2 sm:justify-end">
                        <Label htmlFor="vaccination-protocol-is_active">
                            Activo
                        </Label>
                        <Switch
                            id="vaccination-protocol-is_active"
                            checked={form.data.is_active}
                            onCheckedChange={(value) =>
                                form.setData('is_active', value)
                            }
                        />
                    </div>
                </div>
                <InputError message={form.errors.is_active} />

                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <Label>Dosis del protocolo</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addItem}
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

                    <div className="overflow-x-auto rounded-md border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-20">Orden</TableHead>
                                    <TableHead className="min-w-[12rem]">
                                        Producto (*)
                                    </TableHead>
                                    <TableHead className="min-w-[11rem]">
                                        Tipo (*)
                                    </TableHead>
                                    <TableHead className="min-w-[14rem]">
                                        Edad (semanas/meses) (*)
                                    </TableHead>
                                    <TableHead className="min-w-[9rem]">
                                        Serie (opcional)
                                    </TableHead>
                                    <TableHead className="w-16 text-right">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemRows.map((row, index) => (
                                    <ProtocolItemRow
                                        key={row.key}
                                        index={index}
                                        row={row}
                                        productOptions={productOptions}
                                        scheduleOptions={scheduleOptions}
                                        canRemove={itemRows.length > 1}
                                        canMoveUp={index > 0}
                                        canMoveDown={index < itemRows.length - 1}
                                        errors={form.errors}
                                        onChange={(patch) =>
                                            updateItem(row.key, patch)
                                        }
                                        onMoveUp={() => moveItem(row.key, -1)}
                                        onMoveDown={() => moveItem(row.key, 1)}
                                        onRemove={() =>
                                            setItemRows((rows) =>
                                                rows.filter(
                                                    (item) =>
                                                        item.key !== row.key,
                                                ),
                                            )
                                        }
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addItem}
                        >
                            <CirclePlus className="size-4" />
                            Agregar dosis
                        </Button>
                    </div>
                </div>

                <FormDialogFooter
                    onCancel={onClose}
                    processing={form.processing}
                    isEdit={isEdit}
                    submitLabel={isEdit ? 'Guardar nueva versión' : undefined}
                />
            </form>
        </>
    );
}

function ProtocolItemRow({
    index,
    row,
    productOptions,
    scheduleOptions,
    canRemove,
    canMoveUp,
    canMoveDown,
    errors,
    onChange,
    onMoveUp,
    onMoveDown,
    onRemove,
}: {
    index: number;
    row: ProtocolItemFormRow;
    productOptions: Array<{ id: string; label: string }>;
    scheduleOptions: Array<{ id: string; label: string }>;
    canRemove: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
    errors: Record<string, string>;
    onChange: (patch: Partial<ProtocolItemFormRow>) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
}) {
    const seriesEnabled = row.schedule_type !== 'unique';

    return (
        <TableRow className="align-top hover:bg-transparent">
            <TableCell className="whitespace-normal">
                <div className="flex items-center gap-1">
                    <span className="text-muted-foreground w-5 text-center tabular-nums">
                        {index + 1}
                    </span>
                    <div className="flex flex-col">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            disabled={!canMoveUp}
                            onClick={onMoveUp}
                            aria-label={`Subir dosis ${index + 1}`}
                        >
                            <ChevronUp className="size-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            disabled={!canMoveDown}
                            onClick={onMoveDown}
                            aria-label={`Bajar dosis ${index + 1}`}
                        >
                            <ChevronDown className="size-3.5" />
                        </Button>
                    </div>
                </div>
            </TableCell>

            <TableCell className="whitespace-normal">
                <FormSelect
                    placeholder="Selecciona un producto"
                    required
                    options={productOptions}
                    error={errors[`items.${index}.product_id`]}
                    containerClassName="gap-1"
                    selectProps={{
                        id: `vaccination-protocol-item-${index}-product_id`,
                        value: row.product_id,
                        onChange: (event) =>
                            onChange({ product_id: event.target.value }),
                        'aria-label': `Producto dosis ${index + 1}`,
                    }}
                />
            </TableCell>

            <TableCell className="whitespace-normal">
                <FormSelect
                    required
                    options={scheduleOptions}
                    error={errors[`items.${index}.schedule_type`]}
                    containerClassName="gap-1"
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
                        'aria-label': `Tipo de programación dosis ${index + 1}`,
                    }}
                />
            </TableCell>

            <TableCell className="whitespace-normal">
                {row.schedule_type === 'from_birth_weeks' ? (
                    <FormTextInput
                        required
                        placeholder="Semanas"
                        error={errors[`items.${index}.week_number`]}
                        containerClassName="gap-1"
                        inputProps={{
                            id: `vaccination-protocol-item-${index}-week_number`,
                            type: 'number',
                            min: 0,
                            value: row.week_number,
                            onChange: (event) =>
                                onChange({ week_number: event.target.value }),
                            'aria-label': `Semanas desde nacimiento dosis ${index + 1}`,
                        }}
                    />
                ) : null}

                {row.schedule_type === 'unique' ? (
                    <div className="grid grid-cols-2 gap-2">
                        <FormTextInput
                            required
                            placeholder="Mín."
                            error={errors[`items.${index}.min_age_weeks`]}
                            containerClassName="gap-1"
                            inputProps={{
                                id: `vaccination-protocol-item-${index}-min_age_weeks`,
                                type: 'number',
                                min: 0,
                                value: row.min_age_weeks,
                                onChange: (event) =>
                                    onChange({
                                        min_age_weeks: event.target.value,
                                    }),
                                'aria-label': `Edad mínima dosis ${index + 1}`,
                            }}
                        />
                        <FormTextInput
                            required
                            placeholder="Máx."
                            error={errors[`items.${index}.max_age_weeks`]}
                            containerClassName="gap-1"
                            inputProps={{
                                id: `vaccination-protocol-item-${index}-max_age_weeks`,
                                type: 'number',
                                min: 0,
                                value: row.max_age_weeks,
                                onChange: (event) =>
                                    onChange({
                                        max_age_weeks: event.target.value,
                                    }),
                                'aria-label': `Edad máxima dosis ${index + 1}`,
                            }}
                        />
                    </div>
                ) : null}

                {row.schedule_type === 'periodic' ? (
                    <FormTextInput
                        required
                        placeholder="Meses"
                        error={errors[`items.${index}.interval_months`]}
                        containerClassName="gap-1"
                        inputProps={{
                            id: `vaccination-protocol-item-${index}-interval_months`,
                            type: 'number',
                            min: 1,
                            value: row.interval_months,
                            onChange: (event) =>
                                onChange({
                                    interval_months: event.target.value,
                                }),
                            'aria-label': `Intervalo en meses dosis ${index + 1}`,
                        }}
                    />
                ) : null}
            </TableCell>

            <TableCell className="whitespace-normal">
                <FormTextInput
                    placeholder={seriesEnabled ? 'Ej. sextuple' : '—'}
                    error={
                        seriesEnabled
                            ? errors[`items.${index}.series_key`]
                            : undefined
                    }
                    containerClassName="gap-1"
                    inputProps={{
                        id: `vaccination-protocol-item-${index}-series_key`,
                        value: seriesEnabled ? row.series_key : '',
                        disabled: !seriesEnabled,
                        onChange: (event) =>
                            onChange({ series_key: event.target.value }),
                        maxLength: 64,
                        'aria-label': `Clave de serie dosis ${index + 1}`,
                    }}
                />
            </TableCell>

            <TableCell className="text-right whitespace-normal">
                {canRemove ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={onRemove}
                        aria-label={`Eliminar dosis ${index + 1}`}
                    >
                        <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                ) : null}
            </TableCell>
        </TableRow>
    );
}
