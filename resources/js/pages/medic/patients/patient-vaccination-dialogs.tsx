import { router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    administer,
    clearAdministration,
    omit,
    storeDose,
    storePlan,
    updateDose,
} from '@/actions/App/Http/Controllers/Medic/PatientVaccinationsController';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { FormDatePickerField } from '@/components/custom/form-date-picker-field';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
    PatientVaccinationDoseSummary,
    PatientVaccinationPlanSummary,
    VaccinationAdministeredOrigin,
    VaccinationBillingStatus,
    VaccinationProtocolOption,
    VaccineProductOption,
} from '@/pages/medic/patients/types';

export const PATIENT_VACCINATION_INERTIA_ONLY = [
    'vaccinationPlan',
    'vaccinationDoses',
] as const;

const BILLING_STATUS_LABEL: Record<VaccinationBillingStatus, string | null> = {
    none: null,
    external: 'Sin cobro (externa)',
    pending: 'En cobro',
    charged: 'Cobrada',
};

type AssignPlanDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    protocols: VaccinationProtocolOption[];
};

export function AssignVaccinationPlanDialog({
    open,
    onOpenChange,
    patientId,
    protocols,
}: AssignPlanDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {open ? (
                    <AssignVaccinationPlanDialogInner
                        key={patientId}
                        patientId={patientId}
                        protocols={protocols}
                        onClose={() => onOpenChange(false)}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

function AssignVaccinationPlanDialogInner({
    patientId,
    protocols,
    onClose,
}: {
    patientId: string;
    protocols: VaccinationProtocolOption[];
    onClose: () => void;
}) {
    const form = useForm({ protocol_id: protocols[0]?.id ?? '' });

    const options = useMemo(
        () => protocols.map((item) => ({ id: item.id, label: item.name })),
        [protocols],
    );

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        form.post(storePlan.url(patientId), {
            preserveScroll: true,
            only: [...PATIENT_VACCINATION_INERTIA_ONLY],
            onSuccess: () => onClose(),
        });
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Asignar plan de vacunación</DialogTitle>
                <DialogDescription>
                    Elige un protocolo de la especie del paciente. No se podrá
                    cambiar después de asignarlo.
                </DialogDescription>
            </DialogHeader>
            <form className="grid gap-4" onSubmit={handleSubmit}>
                {options.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        No hay protocolos activos para esta especie. Crea uno en
                        Medicina → Planes de vacunación.
                    </p>
                ) : (
                    <FormSelect
                        label="Protocolo"
                        required
                        placeholder="Selecciona…"
                        options={options}
                        error={form.errors.protocol_id}
                        selectProps={{
                            id: 'assign-protocol_id',
                            value: form.data.protocol_id,
                            onChange: (event) =>
                                form.setData('protocol_id', event.target.value),
                        }}
                    />
                )}
                <FormDialogFooter
                    onCancel={onClose}
                    processing={form.processing}
                    submitLabel="Asignar"
                    submitLabelLoading="Asignando…"
                    submitDisabled={options.length === 0 || form.data.protocol_id === ''}
                />
            </form>
        </>
    );
}

type AddDoseDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    products: VaccineProductOption[];
};

export function AddManualVaccinationDoseDialog({
    open,
    onOpenChange,
    patientId,
    products,
}: AddDoseDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {open ? (
                    <AddManualVaccinationDoseDialogInner
                        key={patientId}
                        patientId={patientId}
                        products={products}
                        onClose={() => onOpenChange(false)}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

function AddManualVaccinationDoseDialogInner({
    patientId,
    products,
    onClose,
}: {
    patientId: string;
    products: VaccineProductOption[];
    onClose: () => void;
}) {
    const form = useForm({
        product_id: products[0]?.id ?? '',
        scheduled_on: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
    });

    const options = useMemo(
        () => products.map((item) => ({ id: item.id, label: item.name })),
        [products],
    );

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        form.post(storeDose.url(patientId), {
            preserveScroll: true,
            only: [...PATIENT_VACCINATION_INERTIA_ONLY],
            onSuccess: () => onClose(),
        });
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Agregar vacuna</DialogTitle>
                <DialogDescription>
                    Incorpora una dosis adicional al plan del paciente.
                </DialogDescription>
            </DialogHeader>
            <form className="grid gap-4" onSubmit={handleSubmit}>
                {options.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        No hay productos tipo Vacunas activos. Créalos en Store.
                    </p>
                ) : (
                    <FormSelect
                        label="Vacuna"
                        required
                        placeholder="Selecciona…"
                        options={options}
                        error={form.errors.product_id}
                        selectProps={{
                            id: 'add-dose-product_id',
                            value: form.data.product_id,
                            onChange: (event) =>
                                form.setData('product_id', event.target.value),
                        }}
                    />
                )}
                <FormDatePickerField
                    label="Fecha programada"
                    required
                    value={form.data.scheduled_on}
                    onChange={(value) => form.setData('scheduled_on', value)}
                    error={form.errors.scheduled_on}
                    portalled={false}
                />
                <FormTextInput
                    label="Notas"
                    error={form.errors.notes}
                    inputProps={{
                        id: 'add-dose-notes',
                        value: form.data.notes,
                        onChange: (event) => form.setData('notes', event.target.value),
                    }}
                />
                <FormDialogFooter
                    onCancel={onClose}
                    processing={form.processing}
                    submitLabel="Agregar"
                    submitLabelLoading="Agregando…"
                    submitDisabled={options.length === 0 || form.data.product_id === ''}
                />
            </form>
        </>
    );
}

type DoseDetailDialogProps = {
    dose: PatientVaccinationDoseSummary | null;
    plan: PatientVaccinationPlanSummary | null;
    patientId: string;
    canScheduleAppointment?: boolean;
    onOpenChange: (open: boolean) => void;
    onScheduleAppointment?: (dose: PatientVaccinationDoseSummary) => void;
    onViewAppointment?: (appointmentId: string) => void;
};

type DoseActionMode = 'view' | 'administer' | 'omit' | 'edit';

const ORIGIN_OPTIONS = [
    { id: 'clinic', label: 'Esta clínica' },
    { id: 'external', label: 'Externo (otra clínica / cartilla)' },
] as const;

export function PatientVaccinationDoseDialog({
    dose,
    plan,
    patientId,
    canScheduleAppointment = false,
    onOpenChange,
    onScheduleAppointment,
    onViewAppointment,
}: DoseDetailDialogProps) {
    return (
        <Dialog open={dose !== null} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                {dose ? (
                    <PatientVaccinationDoseDialogInner
                        key={dose.id}
                        dose={dose}
                        plan={plan}
                        patientId={patientId}
                        canScheduleAppointment={canScheduleAppointment}
                        onClose={() => onOpenChange(false)}
                        onScheduleAppointment={onScheduleAppointment}
                        onViewAppointment={onViewAppointment}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

function PatientVaccinationDoseDialogInner({
    dose,
    plan,
    patientId,
    canScheduleAppointment,
    onClose,
    onScheduleAppointment,
    onViewAppointment,
}: {
    dose: PatientVaccinationDoseSummary;
    plan: PatientVaccinationPlanSummary | null;
    patientId: string;
    canScheduleAppointment: boolean;
    onClose: () => void;
    onScheduleAppointment?: (dose: PatientVaccinationDoseSummary) => void;
    onViewAppointment?: (appointmentId: string) => void;
}) {
    const isOpenDose =
        dose.status === 'scheduled' || dose.status === 'due' || dose.status === 'overdue';
    const isAdministered = dose.status === 'administered';
    const canEdit = isOpenDose || isAdministered;
    const billingLabel = BILLING_STATUS_LABEL[dose.billing_status];
    const hasAppointment =
        dose.appointment_id !== null && dose.appointment_id !== '';

    const [mode, setMode] = useState<DoseActionMode>('view');
    const [origin, setOrigin] = useState<VaccinationAdministeredOrigin>('clinic');
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [clearing, setClearing] = useState(false);

    const administerForm = useForm({
        administered_on: format(new Date(), 'yyyy-MM-dd'),
        administered_origin: 'clinic' as VaccinationAdministeredOrigin,
        notes: dose.notes ?? '',
    });

    const omitForm = useForm({
        notes: dose.notes ?? '',
    });

    const editForm = useForm({
        scheduled_on: dose.scheduled_on,
        administered_on: dose.administered_on?.slice(0, 10) ?? '',
        administered_origin: (dose.administered_origin ??
            'clinic') as VaccinationAdministeredOrigin,
        notes: dose.notes ?? '',
    });

    function startAdminister(nextOrigin: VaccinationAdministeredOrigin) {
        setOrigin(nextOrigin);
        administerForm.setData({
            administered_on:
                nextOrigin === 'external' ? '' : format(new Date(), 'yyyy-MM-dd'),
            administered_origin: nextOrigin,
            notes: dose.notes ?? '',
        });
        setMode('administer');
    }

    function startEdit() {
        editForm.setData({
            scheduled_on: dose.scheduled_on,
            administered_on: dose.administered_on?.slice(0, 10) ?? '',
            administered_origin: (dose.administered_origin ??
                'clinic') as VaccinationAdministeredOrigin,
            notes: dose.notes ?? '',
        });
        editForm.clearErrors();
        setMode('edit');
    }

    function handleAdminister(event: React.FormEvent) {
        event.preventDefault();
        administerForm.post(administer.url({ patient: patientId, dose: dose.id }), {
            preserveScroll: true,
            only: [...PATIENT_VACCINATION_INERTIA_ONLY],
            onSuccess: () => onClose(),
        });
    }

    function handleOmit(event: React.FormEvent) {
        event.preventDefault();
        omitForm.post(omit.url({ patient: patientId, dose: dose.id }), {
            preserveScroll: true,
            only: [...PATIENT_VACCINATION_INERTIA_ONLY],
            onSuccess: () => onClose(),
        });
    }

    function handleEdit(event: React.FormEvent) {
        event.preventDefault();
        editForm.put(updateDose.url({ patient: patientId, dose: dose.id }), {
            preserveScroll: true,
            only: [...PATIENT_VACCINATION_INERTIA_ONLY],
            onSuccess: () => onClose(),
        });
    }

    function handleClearAdministration() {
        setClearing(true);
        router.post(
            clearAdministration.url({ patient: patientId, dose: dose.id }),
            {},
            {
                preserveScroll: true,
                only: [...PATIENT_VACCINATION_INERTIA_ONLY],
                onFinish: () => setClearing(false),
                onSuccess: () => {
                    setClearConfirmOpen(false);
                    onClose();
                },
            },
        );
    }

    const statusLabel =
        dose.status === 'administered'
            ? 'Aplicada'
            : dose.status === 'scheduled'
              ? 'Programada'
              : dose.status === 'due'
                ? 'Por aplicar'
                : dose.status === 'overdue'
                  ? 'Vencida'
                  : 'Omitida';

    return (
        <>
            <DialogHeader>
                <DialogTitle>{dose.product_name}</DialogTitle>
                <DialogDescription>
                    {plan?.name ?? dose.plan_name}
                    {dose.series_label ? ` · ${dose.series_label}` : ''}
                </DialogDescription>
            </DialogHeader>

            {mode === 'view' ? (
                <div className="grid gap-4">
                    <dl className="grid gap-2 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Estado</dt>
                            <dd className="font-medium">{statusLabel}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Programada</dt>
                            <dd className="font-medium">{dose.scheduled_on}</dd>
                        </div>
                        {dose.administered_on ? (
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">Aplicada el</dt>
                                <dd className="font-medium">
                                    {dose.administered_on.slice(0, 10)}
                                </dd>
                            </div>
                        ) : null}
                        {isAdministered ? (
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">Origen</dt>
                                <dd className="font-medium">
                                    {dose.administered_origin === 'external'
                                        ? 'Externo (otra clínica / cartilla)'
                                        : 'Esta clínica'}
                                </dd>
                            </div>
                        ) : null}
                        {billingLabel !== null ? (
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">Cobro</dt>
                                <dd>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full px-2 py-0.5 text-[11px] font-normal"
                                    >
                                        {billingLabel}
                                    </Badge>
                                </dd>
                            </div>
                        ) : null}
                        {hasAppointment ? (
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">Cita</dt>
                                <dd className="font-medium">
                                    {dose.appointment_starts_at?.slice(0, 10) ?? 'Vinculada'}
                                </dd>
                            </div>
                        ) : null}
                        {dose.notes ? (
                            <div className="grid gap-1">
                                <dt className="text-muted-foreground">Notas</dt>
                                <dd className="font-medium whitespace-pre-wrap">
                                    {dose.notes}
                                </dd>
                            </div>
                        ) : null}
                    </dl>

                    {dose.appointment_misaligned ? (
                        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                            La cita vinculada (
                            {dose.appointment_starts_at?.slice(0, 10) ?? '—'}) no coincide
                            con la fecha programada de la dosis ({dose.scheduled_on}). La
                            cita no se mueve automáticamente.
                        </p>
                    ) : null}

                    <div className="grid gap-2 border-t pt-4">
                        {isOpenDose ? (
                            <>
                                <Button
                                    type="button"
                                    className="w-full"
                                    onClick={() => startAdminister('clinic')}
                                >
                                    Registrar aplicación en clínica
                                </Button>
                                <Button
                                    type="button"
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => startAdminister('external')}
                                >
                                    Cargar desde cartilla u otra clínica
                                </Button>
                                {canScheduleAppointment && !hasAppointment ? (
                                    <Button
                                        type="button"
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => onScheduleAppointment?.(dose)}
                                    >
                                        Programar cita para esta dosis
                                    </Button>
                                ) : null}
                                {hasAppointment ? (
                                    <Button
                                        type="button"
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => {
                                            if (dose.appointment_id) {
                                                onViewAppointment?.(dose.appointment_id);
                                            }
                                        }}
                                    >
                                        Ver cita vinculada
                                    </Button>
                                ) : null}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-muted-foreground w-full justify-between"
                                        >
                                            Más opciones
                                            <ChevronDown className="size-4" aria-hidden />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56"
                                    >
                                        <DropdownMenuItem onSelect={startEdit}>
                                            Editar fecha programada
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setMode('omit')}>
                                            Omitir esta dosis del plan
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : null}

                        {isAdministered ? (
                            <>
                                {hasAppointment ? (
                                    <Button
                                        type="button"
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => {
                                            if (dose.appointment_id) {
                                                onViewAppointment?.(dose.appointment_id);
                                            }
                                        }}
                                    >
                                        Ver cita vinculada
                                    </Button>
                                ) : null}
                                <Button
                                    type="button"
                                    className="w-full"
                                    variant="outline"
                                    onClick={startEdit}
                                >
                                    Editar fechas
                                </Button>
                                <Button
                                    type="button"
                                    className="w-full"
                                    variant="destructive"
                                    onClick={() => setClearConfirmOpen(true)}
                                >
                                    Eliminar registro de aplicación
                                </Button>
                                <Button
                                    type="button"
                                    className="w-full"
                                    variant="ghost"
                                    onClick={onClose}
                                >
                                    Cerrar
                                </Button>
                            </>
                        ) : null}

                        {dose.status === 'omitted' ? (
                            <>
                                {canEdit ? (
                                    <Button
                                        type="button"
                                        className="w-full"
                                        variant="outline"
                                        onClick={startEdit}
                                    >
                                        Editar fecha programada
                                    </Button>
                                ) : null}
                                <Button
                                    type="button"
                                    className="w-full"
                                    variant="ghost"
                                    onClick={onClose}
                                >
                                    Cerrar
                                </Button>
                            </>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {mode === 'edit' ? (
                <form className="grid gap-4" onSubmit={handleEdit}>
                    <p className="text-muted-foreground text-sm">
                        {isAdministered
                            ? 'Actualiza la fecha programada, la de aplicación y el origen.'
                            : 'Actualiza la fecha programada de esta dosis.'}
                    </p>
                    <FormDatePickerField
                        label="Fecha programada"
                        required
                        value={editForm.data.scheduled_on}
                        onChange={(value) => editForm.setData('scheduled_on', value)}
                        error={editForm.errors.scheduled_on}
                        portalled={false}
                    />
                    {isAdministered ? (
                        <>
                            <FormDatePickerField
                                label="Fecha de aplicación"
                                required
                                disableFutureDates
                                value={editForm.data.administered_on}
                                onChange={(value) =>
                                    editForm.setData('administered_on', value)
                                }
                                error={editForm.errors.administered_on}
                                portalled={false}
                            />
                            <FormSelect
                                label="Origen"
                                required
                                placeholder="Selecciona…"
                                options={[...ORIGIN_OPTIONS]}
                                error={editForm.errors.administered_origin}
                                selectProps={{
                                    id: `edit-origin-${dose.id}`,
                                    value: editForm.data.administered_origin,
                                    onChange: (event) =>
                                        editForm.setData(
                                            'administered_origin',
                                            event.target.value as VaccinationAdministeredOrigin,
                                        ),
                                }}
                            />
                        </>
                    ) : null}
                    <div className="grid gap-2">
                        <Label htmlFor={`edit-notes-${dose.id}`}>Notas</Label>
                        <Textarea
                            id={`edit-notes-${dose.id}`}
                            value={editForm.data.notes}
                            onChange={(event) =>
                                editForm.setData('notes', event.target.value)
                            }
                            rows={3}
                        />
                        {editForm.errors.notes ? (
                            <p className="text-destructive text-sm">{editForm.errors.notes}</p>
                        ) : null}
                    </div>
                    <FormDialogFooter
                        onCancel={() => setMode('view')}
                        processing={editForm.processing}
                        isEdit
                        submitLabel="Guardar cambios"
                        submitLabelLoading="Guardando…"
                    />
                </form>
            ) : null}

            {mode === 'administer' ? (
                <form className="grid gap-4" onSubmit={handleAdminister}>
                    <p className="text-muted-foreground text-sm">
                        {origin === 'external'
                            ? 'Registra una dosis aplicada fuera de la clínica (cartilla u otra clínica).'
                            : 'Registra la aplicación en clínica. Si hay cita vinculada, se cobran el producto y el servicio de la cita (sin abrir atención).'}
                    </p>
                    <FormDatePickerField
                        label="Fecha de aplicación"
                        required
                        disableFutureDates
                        value={administerForm.data.administered_on}
                        onChange={(value) =>
                            administerForm.setData('administered_on', value)
                        }
                        error={administerForm.errors.administered_on}
                        portalled={false}
                    />
                    <div className="grid gap-2">
                        <Label htmlFor={`dose-notes-${dose.id}`}>Notas</Label>
                        <Textarea
                            id={`dose-notes-${dose.id}`}
                            value={administerForm.data.notes}
                            onChange={(event) =>
                                administerForm.setData('notes', event.target.value)
                            }
                            rows={3}
                        />
                        {administerForm.errors.notes ? (
                            <p className="text-destructive text-sm">
                                {administerForm.errors.notes}
                            </p>
                        ) : null}
                    </div>
                    <FormDialogFooter
                        onCancel={() => setMode('view')}
                        processing={administerForm.processing}
                        submitLabel="Guardar"
                        submitLabelLoading="Guardando…"
                    />
                </form>
            ) : null}

            {mode === 'omit' ? (
                <form className="grid gap-4" onSubmit={handleOmit}>
                    <p className="text-muted-foreground text-sm">
                        Marca esta dosis como omitida en el plan (por ejemplo, no
                        corresponde o el tutor la rechaza). Dejará de mostrarse en el
                        filtro «Todo».
                    </p>
                    <div className="grid gap-2">
                        <Label htmlFor={`omit-notes-${dose.id}`}>Motivo (opcional)</Label>
                        <Textarea
                            id={`omit-notes-${dose.id}`}
                            value={omitForm.data.notes}
                            onChange={(event) =>
                                omitForm.setData('notes', event.target.value)
                            }
                            rows={3}
                        />
                        {omitForm.errors.notes ? (
                            <p className="text-destructive text-sm">
                                {omitForm.errors.notes}
                            </p>
                        ) : null}
                    </div>
                    <FormDialogFooter
                        onCancel={() => setMode('view')}
                        processing={omitForm.processing}
                        submitLabel="Omitir esta dosis del plan"
                        submitLabelLoading="Omitiendo…"
                    />
                </form>
            ) : null}

            <ConfirmDialog
                open={clearConfirmOpen}
                onOpenChange={setClearConfirmOpen}
                title="¿Eliminar la aplicación?"
                description="La dosis volverá a quedar pendiente según su fecha programada. Podrás registrarla de nuevo después."
                confirmLabel={clearing ? 'Eliminando…' : 'Eliminar aplicación'}
                confirmVariant="destructive"
                confirming={clearing}
                onConfirm={handleClearAdministration}
            />
        </>
    );
}
