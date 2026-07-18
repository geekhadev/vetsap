export type DocumentTemplateVariableItem = {
    id: string;
    label: string;
    /** Valor de ejemplo usado en el preview y en el catálogo. */
    sample: string;
};

export type DocumentTemplateVariableGroup = {
    group: string;
    group_label: string;
    items: DocumentTemplateVariableItem[];
};

export type DocumentTemplateVariableFlat = DocumentTemplateVariableItem & {
    group: string;
    group_label: string;
};

export type MentionListProps = {
    items: DocumentTemplateVariableFlat[];
    command: (item: { id: string; label: string }) => void;
};

export type MentionListHandle = {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};
