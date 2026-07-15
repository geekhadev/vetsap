import { router } from '@inertiajs/react';
import { Info, TrashIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { FormActionButton } from '@/components/custom/form-action-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CompanyFormRecord } from '@/pages/configuration/companies/types';
import { destroy } from '@/routes/configuration/companies';

type CompanyDeleteTabPanelProps = {
    company: CompanyFormRecord;
    canDelete: boolean;
};

export function CompanyDeleteTabPanel({
    company,
    canDelete,
}: CompanyDeleteTabPanelProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const requestDelete = useCallback(() => {
        if (!canDelete) {
            return;
        }

        setConfirmOpen(true);
    }, [canDelete]);

    const handleConfirm = useCallback(() => {
        setDeleting(true);

        router.delete(destroy.url(company.id), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmOpen(false);
            },
            onFinish: () => {
                setDeleting(false);
            },
        });
    }, [company.id]);

    return (
        <div className="space-y-4">
            <Alert variant="destructive" className="text-destructive-foreground bg-destructive/10 border-destructive/20 p-6">
                <Info className="size-4 shrink-0" />
                <AlertDescription>
                    <p>
                        La empresa no se elimina de inmediato: al solicitar la
                        baja se genera una petición para que el administrador de
                        sistemas la procese. Contarás con un plazo máximo de{' '}
                        <span className="font-medium">
                            15 días
                        </span>{' '}
                        para recuperar la empresa y su información si lo
                        necesitas; transcurrido ese plazo sin recuperación, los
                        datos se eliminarán de forma permanente.
                    </p>
                </AlertDescription>
            </Alert>
            <div className="flex flex-wrap gap-3">
                <FormActionButton
                    type="button"
                    variant="destructive"
                    disabled={!canDelete}
                    title={
                        canDelete
                            ? undefined
                            : 'No puedes eliminar esta empresa en este momento (por ejemplo: es la única disponible, es la empresa activa en el encabezado o no tienes permiso).'
                    }
                    icon={<TrashIcon className="size-4" />}
                    label="Eliminar empresa"
                    containerClassName="w-auto"
                    onClick={requestDelete}
                />
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={(open) => {
                    if (!deleting) {
                        setConfirmOpen(open);
                    }
                }}
                title="¿Eliminar la empresa?"
                description={`Se solicitará la baja de la empresa «${company.name}». Esta acción no se puede deshacer.`}
                confirmLabel={deleting ? 'Eliminando…' : 'Eliminar empresa'}
                confirmVariant="destructive"
                confirming={deleting}
                onConfirm={handleConfirm}
            />
        </div>
    );
}
