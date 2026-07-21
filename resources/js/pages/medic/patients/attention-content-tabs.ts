import { ClipboardList, Files, FlaskConical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ATTENTION_CONTENT_TAB = {
    consulta: 'consulta',
    examenes: 'examenes',
    formatos: 'formatos',
} as const;

export type AttentionContentTabId =
    (typeof ATTENTION_CONTENT_TAB)[keyof typeof ATTENTION_CONTENT_TAB];

export const ATTENTION_CONTENT_TAB_LABELS: Record<AttentionContentTabId, string> = {
    consulta: 'Consulta',
    examenes: 'Exámenes',
    formatos: 'Plantillas y formatos',
};

export const ATTENTION_CONTENT_TAB_ICONS: Record<AttentionContentTabId, LucideIcon> = {
    consulta: ClipboardList,
    examenes: FlaskConical,
    formatos: Files,
};

/** Ancho y alto estables para el modal de crear/ver atención. */
export const attentionModalContentClassName = cn(
    'flex h-[min(90vh,52rem)] max-h-[min(90vh,52rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-7xl',
);

export const attentionContentTabsListClassName = cn(
    'h-auto w-full rounded-none border-b bg-transparent p-0',
);

export const attentionContentTabsTriggerClassName = cn(
    'flex-1 rounded-none border-0 border-b-2 border-transparent',
    'bg-transparent px-3 py-3 text-sm shadow-none',
    'data-[state=active]:border-primary data-[state=active]:bg-transparent',
    'data-[state=active]:text-primary data-[state=active]:shadow-none',
    'dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent',
);

export const attentionContentTabsPanelClassName = cn(
    'mt-0 min-h-[28rem] flex-1 overflow-y-auto pt-4 outline-none',
);
