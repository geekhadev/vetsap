import { router, useForm } from '@inertiajs/react';
import { Mail, MapPin, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
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
} from '@/pages/configuration/companies/tabs/offices/office-form-dialog';
import { PlaceholderTabPanel } from '@/pages/configuration/companies/tabs/placeholder-tab-panel';
import type { CompanyOfficeListItem } from '@/pages/configuration/companies/types';
import companyOfficeRoutes from '@/routes/configuration/companies/offices';

type OfficesTabPanelProps = {
    companyId: string | null;
    offices: CompanyOfficeListItem[];
};

export function OfficesTabPanel({ companyId, offices }: OfficesTabPanelProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);

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

    if (companyId === null) {
        return (
            <PlaceholderTabPanel message="Guarda la empresa primero para gestionar sucursales." />
        );
    }

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
        if (
            !window.confirm(
                `¿Eliminar la sucursal «${office.name}»? Esta acción no se puede deshacer.`,
            )
        ) {
            return;
        }

        router.delete(
            companyOfficeRoutes.destroy.url({
                company: companyId,
                office: office.id,
            }),
            { preserveScroll: true },
        );
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-lg font-medium">Sucursales</h3>
                    <p className="text-muted-foreground text-sm">
                        La casa matriz se edita en la pestaña Información general.
                        Aquí gestionas sucursales adicionales.
                    </p>
                </div>
                <Button
                    type="button"
                    size="sm"
                    className="shrink-0 gap-1"
                    onClick={openCreate}
                >
                    <Plus className="size-4" aria-hidden />
                    Nueva sucursal
                </Button>
            </div>

            {offices.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    No hay sucursales adicionales. Crea una con el botón de arriba.
                </p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {offices.map((office) => (
                        <Card
                            key={office.id}
                            className="shadow-xs h-full transition-colors"
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
                                            <Pencil className="size-4" aria-hidden />
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
                                            <Trash2 className="size-4" aria-hidden />
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
        </div>
    );
}
