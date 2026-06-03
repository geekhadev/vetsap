import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/sale/sii-cafs';

type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function FormDialog({ open, onOpenChange }: FormDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (!open) {
            setSelectedFile(null);
        }
    }, [open]);

    return (
        <InertiaFormDialog<{ xml_file: File | null }>
            open={open}
            onOpenChange={onOpenChange}
            title="Subir CAF SII"
            description="Selecciona el archivo XML del CAF descargado desde el portal del SII."
            formKey="sii-caf-upload"
            inertiaForm={{ action: store.url(), method: 'post' }}
            formOptions={{
                forceFormData: true,
                preserveScroll: true,
            }}
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="sii-caf-xml-file">Archivo XML</Label>
                        <Input
                            id="sii-caf-xml-file"
                            type="file"
                            name="xml_file"
                            accept=".xml,text/xml,application/xml"
                            className="cursor-pointer"
                            onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setSelectedFile(f);
                            }}
                        />
                        {errors.xml_file ? (
                            <p className="text-destructive text-sm">{errors.xml_file}</p>
                        ) : null}
                    </div>

                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            <X />
                            Cancelar
                        </Button>
                        <FormSubmitButton
                            type="submit"
                            loading={processing}
                            disabled={!selectedFile}
                            icon={<Save />}
                            label="Subir CAF"
                            labelLoading="Subiendo…"
                            containerClassName="w-auto"
                        />
                    </DialogFooter>
                </>
            )}
        </InertiaFormDialog>
    );
}
