import { Check } from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { CLINICAL_FIELD_CATALOG } from '@/pages/medic/clinical-templates/types';

type ClinicalFieldInputProps = {
    fieldKey: string;
    defaultValue?: unknown;
    value?: string;
    onValueChange?: (value: string) => void;
    error?: string;
};

function fieldLabel(text: string, isFilled: boolean): ReactNode {
    if (!isFilled) {
        return text;
    }

    return (
        <span className="inline-flex items-center gap-1.5">
            {text}
            <span
                className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500"
                aria-hidden
            >
                <Check className="size-2.5 stroke-[3]" />
            </span>
            <span className="sr-only">(completado)</span>
        </span>
    );
}

export function ClinicalFieldInput({
    fieldKey,
    defaultValue,
    value,
    onValueChange,
    error,
}: ClinicalFieldInputProps) {
    const catalogEntry = CLINICAL_FIELD_CATALOG.find((f) => f.key === fieldKey);

    if (!catalogEntry) {
        return null;
    }

    const inputName = `values[${fieldKey}]`;
    const inputId = `attention-value-${fieldKey}`;
    const isControlled = value !== undefined && onValueChange !== undefined;
    const strDefault = defaultValue != null ? String(defaultValue) : '';
    const resolvedValue = isControlled ? (value ?? '') : strDefault;
    const isFilled = resolvedValue.trim().length > 0;
    const label = fieldLabel(catalogEntry.label, isFilled);

    const commonChange = isControlled
        ? {
              value,
              onChange: (
                  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
              ) => onValueChange(e.target.value),
          }
        : { defaultValue: strDefault };

    if (catalogEntry.type === 'textarea') {
        return (
            <FormTextarea
                label={label}
                error={error}
                speechToText
                textareaProps={{
                    id: inputId,
                    name: inputName,
                    rows: 5,
                    ...commonChange,
                }}
            />
        );
    }

    if (catalogEntry.type === 'select' && 'options' in catalogEntry) {
        const options = (catalogEntry.options as { id: string; label: string }[]).map((o) => ({
            id: o.id,
            label: o.label,
        }));

        return (
            <FormSelect
                label={label}
                placeholder="Selecciona…"
                options={options}
                error={error}
                selectProps={{ id: inputId, name: inputName, ...commonChange }}
            />
        );
    }

    if (catalogEntry.type === 'scale_1_9') {
        const options = Array.from({ length: 9 }, (_, i) => ({
            id: String(i + 1),
            label: String(i + 1),
        }));

        return (
            <FormSelect
                label={label}
                placeholder="Selecciona…"
                options={options}
                error={error}
                selectProps={{ id: inputId, name: inputName, ...commonChange }}
            />
        );
    }

    if (catalogEntry.type === 'scale_1_5') {
        const options = Array.from({ length: 5 }, (_, i) => ({
            id: String(i + 1),
            label: String(i + 1),
        }));

        return (
            <FormSelect
                label={label}
                placeholder="Selecciona…"
                options={options}
                error={error}
                selectProps={{ id: inputId, name: inputName, ...commonChange }}
            />
        );
    }

    if (catalogEntry.type === 'number') {
        return (
            <FormTextInput
                label={label}
                error={error}
                inputProps={{
                    id: inputId,
                    name: inputName,
                    type: 'number',
                    step: '0.1',
                    min: '0',
                    ...commonChange,
                }}
            />
        );
    }

    return (
        <FormTextInput
            label={label}
            error={error}
            inputProps={{ id: inputId, name: inputName, ...commonChange }}
        />
    );
}
