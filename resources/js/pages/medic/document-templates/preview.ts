import type { DocumentTemplateVariableGroup } from '@/components/custom/document-template-editor/types';

export function buildVariableSampleMap(
    groups: DocumentTemplateVariableGroup[],
): Map<string, string> {
    const samples = new Map<string, string>();

    for (const group of groups) {
        for (const item of group.items) {
            samples.set(item.id, item.sample);
        }
    }

    return samples;
}

/**
 * Sustituye menciones TipTap (`data-type="mention"`) por el valor de ejemplo
 * y conserva la altura de párrafos vacíos (saltos de línea).
 */
export function renderDocumentPreviewHtml(
    html: string,
    samples: Map<string, string>,
): string {
    if (typeof DOMParser === 'undefined') {
        return html;
    }

    const doc = new DOMParser().parseFromString(html || '<p></p>', 'text/html');

    doc.querySelectorAll('[data-type="mention"]').forEach((node) => {
        const id = node.getAttribute('data-id') ?? '';
        const sample = samples.get(id) ?? `@${id}`;
        node.replaceWith(doc.createTextNode(sample));
    });

    doc.querySelectorAll('p').forEach((paragraph) => {
        if (paragraph.childNodes.length === 0) {
            paragraph.appendChild(doc.createElement('br'));
        }
    });

    return doc.body.innerHTML;
}
