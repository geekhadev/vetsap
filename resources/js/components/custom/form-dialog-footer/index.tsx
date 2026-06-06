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
    submitLabel?: string;
    submitLabelLoading?: string;
    submitDisabled?: boolean;
};

export function FormDialogFooter({
    onCancel,
    processing,
    isEdit = false,
    submitIcon = <Save />,
    submitLabel,
    submitLabelLoading,
    submitDisabled,
}: FormDialogFooterProps) {
    const resolvedSubmitLabel = submitLabel ?? (isEdit ? 'Guardar cambios' : 'Guardar');
    const resolvedSubmitLabelLoading = submitLabelLoading ?? 'Guardando…';

    return (
        <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
                <X />
                Cancelar
            </Button>
            <FormSubmitButton
                type="submit"
                loading={processing}
                disabled={submitDisabled}
                icon={submitIcon}
                label={resolvedSubmitLabel}
                labelLoading={resolvedSubmitLabelLoading}
                containerClassName="w-auto"
            />
        </DialogFooter>
    );
}
