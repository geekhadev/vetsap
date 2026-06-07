import type { InertiaFormProps } from '@inertiajs/react';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { FormTextInput } from '@/components/custom/form-text-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type OfficeFormState = {
    name: string;
    email: string;
    phone: string;
    address: string;
};

export const emptyOfficeForm: OfficeFormState = {
    name: '',
    email: '',
    phone: '',
    address: '',
};

type OfficeFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    form: InertiaFormProps<OfficeFormState>;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
};

export function OfficeFormDialog({
    open,
    onOpenChange,
    mode,
    form,
    onSubmit,
    onCancel,
}: OfficeFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Nueva sucursal' : 'Editar sucursal'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <FormTextInput
                        label="Nombre"
                        required
                        error={form.errors.name}
                        inputProps={{
                            id: 'office_name',
                            name: 'name',
                            maxLength: 255,
                            value: form.data.name,
                            onChange: (e) =>
                                form.setData('name', e.target.value),
                        }}
                    />
                    <FormTextInput
                        label="Correo"
                        type="email"
                        error={form.errors.email}
                        inputProps={{
                            id: 'office_email',
                            name: 'email',
                            maxLength: 255,
                            value: form.data.email,
                            onChange: (e) =>
                                form.setData('email', e.target.value),
                        }}
                    />
                    <FormTextInput
                        label="Teléfono"
                        error={form.errors.phone}
                        inputProps={{
                            id: 'office_phone',
                            name: 'phone',
                            maxLength: 255,
                            value: form.data.phone,
                            onChange: (e) =>
                                form.setData('phone', e.target.value),
                        }}
                    />
                    <FormTextInput
                        label="Dirección"
                        required
                        error={form.errors.address}
                        inputProps={{
                            id: 'office_address',
                            name: 'address',
                            maxLength: 255,
                            value: form.data.address,
                            onChange: (e) =>
                                form.setData('address', e.target.value),
                        }}
                    />
                    <DialogFooter className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                        <FormSubmitButton
                            type="submit"
                            label={mode === 'create' ? 'Crear' : 'Guardar'}
                            labelLoading="Guardando…"
                            loading={form.processing}
                            className={cn(
                                mode === 'create' ? 'bg-primary' : undefined,
                            )}
                        />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
