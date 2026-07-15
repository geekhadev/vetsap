import { router, useForm } from '@inertiajs/react';
import { Mail, MapPin, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    emptyOfficeForm,
    OfficeFormDialog,
} from '@/pages/configuration/company-offices/office-form-dialog';
import type { CompanyOfficeListItem } from '@/pages/configuration/company-offices/types';
import companyOfficeRoutes from '@/routes/configuration/companies/offices';

type OfficesSettingsPanelProps = {
    companyId: string;
    offices: CompanyOfficeListItem[];
    canCreate: boolean;
};

export function OfficesSettingsPanel({
    companyId,
    offices,
    canCreate,
}: OfficesSettingsPanelProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);
    const [pendingDeleteOffice, setPendingDeleteOffice] =
        useState<CompanyOfficeListItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const form = useForm(emptyOfficeForm);

    const closeDialog = useCallback(() => {
        setDialogOpen(false);
        setEditingOfficeId(null);
        form.reset();
        form.clearErrors();
    }, [form]);

    const openCreate = useCallback(() => {
        setDialogMode('create');
        setEditingOfficeId(null);
        form.setData(emptyOfficeForm);
        form.clearErrors();
        setDialogOpen(true);
    }, [form]);

    const openEdit = useCallback(
        (office: CompanyOfficeListItem) => {
            setDialogMode('edit');
            setEditingOfficeId(office.id);
            form.setData({
                name: office.name,
                email: office.email ?? '',
                phone: office.phone ?? '',
                address: office.address ?? '',
            });
            form.clearErrors();
            setDialogOpen(true);
        },
        [form],
    );

    const submitOffice = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingOfficeId === null) {
            form.post(companyOfficeRoutes.store.url({ company: companyId }), {
                preserveScroll: true,
                onSuccess: () => closeDialog(),
            });

            return;
        }

        form.put(
            companyOfficeRoutes.update.url({
                company: companyId,
                office: editingOfficeId,
            }),
            {
                preserveScroll: true,
                onSuccess: () => closeDialog(),
            },
        );
    };

    const requestDelete = (office: CompanyOfficeListItem) => {
        setPendingDeleteOffice(office);
    };

    const handleConfirmDelete = () => {
        if (pendingDeleteOffice === null) {
            return;
        }

        setDeleting(true);

        router.delete(
            companyOfficeRoutes.destroy.url({
                company: companyId,
                office: pendingDeleteOffice.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPendingDeleteOffice(null);
                },
                onFinish: () => {
                    setDeleting(false);
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-base font-medium">
                        Sucursales adicionales
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        La casa matriz se edita en la información general de la
                        empresa.
                    </p>
                </div>
                {canCreate ? (
                    <Button
                        type="button"
                        size="sm"
                        className="shrink-0 gap-1"
                        onClick={openCreate}
                    >
                        <Plus className="size-4" aria-hidden />
                        Nueva sucursal
                    </Button>
                ) : null}
            </div>

            {offices.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    No hay sucursales adicionales. Crea una con el botón de
                    arriba.
                </p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {offices.map((office) => (
                        <Card
                            key={office.id}
                            className="h-full shadow-xs transition-colors"
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">
                                    {office.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {office.email ? (
                                    <div className="flex items-start gap-2">
                                        <Mail className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                        <span className="break-all">
                                            {office.email}
                                        </span>
                                    </div>
                                ) : null}
                                {office.phone ? (
                                    <div className="flex items-center gap-2">
                                        <Phone className="text-muted-foreground size-4 shrink-0" />
                                        <span>{office.phone}</span>
                                    </div>
                                ) : null}
                                {office.address ? (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                        <span>{office.address}</span>
                                    </div>
                                ) : null}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {office.can.update ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-1"
                                            onClick={() => openEdit(office)}
                                        >
                                            <Pencil
                                                className="size-4"
                                                aria-hidden
                                            />
                                            Editar
                                        </Button>
                                    ) : null}
                                    {office.can.delete ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                                            onClick={() => requestDelete(office)}
                                        >
                                            <Trash2
                                                className="size-4"
                                                aria-hidden
                                            />
                                            Eliminar
                                        </Button>
                                    ) : null}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <OfficeFormDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog();
                    }
                }}
                mode={dialogMode}
                form={form}
                onSubmit={submitOffice}
                onCancel={closeDialog}
            />

            <ConfirmDialog
                open={pendingDeleteOffice !== null}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setPendingDeleteOffice(null);
                    }
                }}
                title="¿Eliminar la sucursal?"
                description={
                    pendingDeleteOffice
                        ? `Se eliminará la sucursal «${pendingDeleteOffice.name}». Esta acción no se puede deshacer.`
                        : ''
                }
                confirmLabel={deleting ? 'Eliminando…' : 'Eliminar'}
                confirmVariant="destructive"
                confirming={deleting}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
