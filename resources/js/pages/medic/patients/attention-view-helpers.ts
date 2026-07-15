import { formatDateDisplay } from '@/components/custom/date-display';
import { CLINICAL_FIELD_CATALOG } from '@/pages/medic/clinical-templates/types';
import type { ClinicalFieldKey } from '@/pages/medic/clinical-templates/types';
import type { AttentionSummary, PatientTemplateOption } from '@/pages/medic/patients/types';

export function formatAttentionDateTime(value: string | null | undefined): string {
    if (value == null || value === '') {
        return '—';
    }

    const formatted = formatDateDisplay(value, 'datetime', '');

    if (formatted === '') {
        return '—';
    }

    return formatted.replace(/^(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}):\d{2}$/, '$1');
}

export function formatAttentionDuration(
    startedAt: string | null | undefined,
    closedAt: string | null | undefined,
): string {
    if (startedAt == null || closedAt == null) {
        return '—';
    }

    const startedMs = Date.parse(startedAt);
    const closedMs = Date.parse(closedAt);

    if (Number.isNaN(startedMs) || Number.isNaN(closedMs) || closedMs < startedMs) {
        return '—';
    }

    const totalMinutes = Math.round((closedMs - startedMs) / 60_000);

    if (totalMinutes < 1) {
        return '< 1 min';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `${minutes} min`;
    }

    if (minutes === 0) {
        return `${hours} h`;
    }

    return `${hours} h ${minutes} min`;
}

export function formatClinicalFieldDisplayValue(
    fieldKey: string,
    raw: unknown,
): string {
    if (raw == null || raw === '') {
        return '—';
    }

    const str = String(raw);
    const catalogEntry = CLINICAL_FIELD_CATALOG.find((f) => f.key === fieldKey);

    if (catalogEntry && 'options' in catalogEntry) {
        const option = catalogEntry.options.find((o) => o.id === str);

        return option?.label ?? str;
    }

    return str;
}

export type AttentionViewField = {
    field_key: ClinicalFieldKey | string;
    label: string;
    group: string;
    value: string;
};

export function resolveAttentionViewFields(
    attention: AttentionSummary,
    templates: PatientTemplateOption[],
): AttentionViewField[] {
    const template = templates.find((t) => t.id === attention.template_id);
    const valueKeys = Object.keys(attention.values ?? {});

    const orderedKeys =
        template?.fields && template.fields.length > 0
            ? [...template.fields]
                  .sort((a, b) => a.field_order - b.field_order)
                  .map((f) => f.field_key)
            : valueKeys;

    const keys =
        orderedKeys.length > 0
            ? orderedKeys
            : CLINICAL_FIELD_CATALOG.map((f) => f.key).filter((key) =>
                  valueKeys.includes(key),
              );

    const uniqueKeys = [...new Set([...keys, ...valueKeys])];

    return uniqueKeys.map((fieldKey) => {
        const catalogEntry = CLINICAL_FIELD_CATALOG.find((f) => f.key === fieldKey);
        const templateField = template?.fields?.find((f) => f.field_key === fieldKey);

        return {
            field_key: fieldKey,
            label: templateField?.label ?? catalogEntry?.label ?? fieldKey,
            group: catalogEntry?.group ?? 'Datos clínicos',
            value: formatClinicalFieldDisplayValue(
                fieldKey,
                attention.values?.[fieldKey],
            ),
        };
    });
}
