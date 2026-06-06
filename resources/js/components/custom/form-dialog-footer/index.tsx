import { Save, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

export type FormDialogFooterProps = {
    onCancel: () => void;
    processing: boolean;
    isEdit?: boolean;
    submitIcon?: ReactNode;
};

export function FormDialogFooter({
    onCancel,
    processing,
    isEdit = false,
    submitIcon = <Save />,
}: FormDialogFooterProps) {
    return (
        <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
                <X />
                Cancelar
            </Button>
            <FormSubmitButton
                type="submit"
                loading={processing}
                icon={submitIcon}
                label={isEdit ? 'Guardar cambios' : 'Guardar'}
                labelLoading="Guardando…"
                containerClassName="w-auto"
            />
        </DialogFooter>
    );
}
