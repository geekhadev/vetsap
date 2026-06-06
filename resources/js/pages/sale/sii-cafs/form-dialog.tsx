import { useState } from 'react';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/sale/sii-cafs';

type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function FormDialog({ open, onOpenChange }: FormDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setSelectedFile(null);
        }

        onOpenChange(nextOpen);
    };

    return (
        <InertiaFormDialog<{ xml_file: File | null }>
            open={open}
            onOpenChange={handleOpenChange}
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

                    <FormDialogFooter
                        onCancel={() => handleOpenChange(false)}
                        processing={processing}
                        submitLabel="Subir CAF"
                        submitLabelLoading="Subiendo…"
                        submitDisabled={!selectedFile}
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
