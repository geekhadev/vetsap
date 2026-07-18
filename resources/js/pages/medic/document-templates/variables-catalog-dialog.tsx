import { useState } from 'react';
import type { DocumentTemplateVariableGroup } from '@/components/custom/document-template-editor/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type VariablesCatalogDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    variables: DocumentTemplateVariableGroup[];
};

export function VariablesCatalogDialog({
    open,
    onOpenChange,
    variables,
}: VariablesCatalogDialogProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = async (id: string): Promise<void> => {
        const token = `@${id}`;

        try {
            await navigator.clipboard.writeText(token);
            setCopiedId(id);
            window.setTimeout(() => {
                setCopiedId((current) => (current === id ? null : current));
            }, 1500);
        } catch {
            // Clipboard puede fallar sin permiso; el token sigue visible.
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] flex-col gap-4 overflow-hidden sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Variables disponibles</DialogTitle>
                    <DialogDescription>
                        Usa @ en el editor o copia el token. El valor de ejemplo
                        es el que verás en la vista previa.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                    {variables.map((group) => (
                        <section key={group.group} className="space-y-2">
                            <h3 className="text-sm font-semibold text-foreground">
                                {group.group_label}
                            </h3>
                            <div className="overflow-hidden rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                                        <tr>
                                            <th className="px-3 py-2 font-medium">
                                                Variable
                                            </th>
                                            <th className="px-3 py-2 font-medium">
                                                Token
                                            </th>
                                            <th className="px-3 py-2 font-medium">
                                                Valor que agrega
                                            </th>
                                            <th className="w-0 px-2 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-t"
                                            >
                                                <td className="px-3 py-2">
                                                    {item.label}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                                                        @{item.id}
                                                    </code>
                                                </td>
                                                <td className="px-3 py-2 text-muted-foreground">
                                                    {item.sample}
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs"
                                                        onClick={() =>
                                                            void handleCopy(
                                                                item.id,
                                                            )
                                                        }
                                                    >
                                                        {copiedId === item.id
                                                            ? 'Copiado'
                                                            : 'Copiar'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
