import { useMemo } from 'react';
import type { DocumentTemplateVariableGroup } from '@/components/custom/document-template-editor/types';
import { cn } from '@/lib/utils';
import {
    buildVariableSampleMap,
    renderDocumentPreviewHtml,
} from '@/pages/medic/document-templates/preview';

/** Hoja carta (US Letter): 8.5 × 11 in */
const LETTER_PAGE_CLASS =
    'mx-auto box-border w-[min(100%,8.5in)] min-h-[11in] bg-white px-[0.75in] py-[0.75in] text-neutral-900 shadow-md';

type DocumentTemplatePreviewProps = {
    content: string;
    variables: DocumentTemplateVariableGroup[];
    className?: string;
};

export function DocumentTemplatePreview({
    content,
    variables,
    className,
}: DocumentTemplatePreviewProps) {
    const previewHtml = useMemo(() => {
        const samples = buildVariableSampleMap(variables);

        return renderDocumentPreviewHtml(content, samples);
    }, [content, variables]);

    const hasContent =
        content.trim() !== '' &&
        content.replace(/<[^>]*>/g, '').trim() !== '';

    return (
        <div
            className={cn(
                'flex h-full min-h-0 flex-col overflow-hidden rounded-md border',
                className,
            )}
        >
            <div className="shrink-0 border-b bg-background px-4 py-2.5">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Vista previa
                </p>
                <p className="text-sm text-muted-foreground">
                    Hoja carta · datos de ejemplo
                </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto bg-neutral-300 p-6 dark:bg-neutral-700">
                <article className={LETTER_PAGE_CLASS}>
                    {hasContent ? (
                        <div
                            className={cn(
                                'prose prose-sm prose-neutral max-w-none',
                                '[&_p]:my-0 [&_p]:min-h-[1.25em] [&_p+p]:mt-3',
                            )}
                            dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                    ) : (
                        <p className="text-sm text-neutral-400 italic">
                            El contenido del documento aparecerá aquí…
                        </p>
                    )}
                </article>
            </div>
        </div>
    );
}
