import { Eye, FileDown, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { download as downloadDocumentTemplate } from '@/routes/medic/clinical-attentions/document-templates';

type AttentionDocumentTemplateCardProps = {
    attentionId: string | null;
    template: { id: string; title: string };
    disabled?: boolean;
};

export function AttentionDocumentTemplateCard({
    attentionId,
    template,
    disabled = false,
}: AttentionDocumentTemplateCardProps) {
    const [previewOpen, setPreviewOpen] = useState(false);

    const pdfUrl =
        attentionId != null
            ? downloadDocumentTemplate.url({
                  clinical_attention: attentionId,
                  document_template: template.id,
              })
            : null;

    const canOpen = pdfUrl != null && !disabled;

    return (
        <>
            <li className="flex flex-col rounded-xl border p-3 shadow-xs">
                <div className="flex min-w-0 items-start gap-2">
                    <FileText
                        className="text-muted-foreground mt-0.5 size-4 shrink-0"
                        aria-hidden
                    />
                    <p className="min-w-0 flex-1 text-sm leading-snug font-medium text-balance">
                        {template.title}
                    </p>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={!canOpen}
                        onClick={() => setPreviewOpen(true)}
                    >
                        <Eye className="size-4" aria-hidden />
                        Vista previa
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={!canOpen}
                        asChild={canOpen}
                    >
                        {canOpen ? (
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                <FileDown className="size-4" aria-hidden />
                                Abrir PDF
                            </a>
                        ) : (
                            <span>
                                <FileDown className="size-4" aria-hidden />
                                Abrir PDF
                            </span>
                        )}
                    </Button>
                </div>
                {disabled ? (
                    <p className="text-muted-foreground mt-2 text-xs">
                        Guardando selección para generar el documento…
                    </p>
                ) : null}
            </li>

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="flex h-[min(90vh,52rem)] max-h-[min(90vh,52rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
                    <DialogHeader className="shrink-0 gap-1 border-b px-6 py-4 pr-14 text-left">
                        <DialogTitle className="truncate">{template.title}</DialogTitle>
                        <DialogDescription>
                            Vista previa del PDF generado con los datos de la atención.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted/40 min-h-0 flex-1 p-3">
                        {pdfUrl ? (
                            <iframe
                                title={`Vista previa: ${template.title}`}
                                src={pdfUrl}
                                className="bg-background size-full rounded-md border"
                            />
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
