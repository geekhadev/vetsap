import type { ElementType } from 'react';
import { useRef } from 'react';
import { useClinicEditor } from './clinic-editor-context';

type EditableTextProps = {
    settingKey: string;
    value: string;
    as?: ElementType;
    className?: string;
};

export function EditableText({ settingKey, value, as: Tag = 'span', className }: EditableTextProps) {
    const { isEditing, saving, saveField } = useClinicEditor();
    const ref = useRef<HTMLElement>(null);
    const isSaving = saving === settingKey;

    if (!isEditing) {
        return <Tag className={className}>{value}</Tag>;
    }

    const handleBlur = () => {
        const newValue = ref.current?.innerText.trim() ?? value;

        if (newValue !== value) {
            void saveField(settingKey, newValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            if (ref.current) {
ref.current.innerText = value;
}

            ref.current?.blur();
        }
    };

    return (
        // @ts-expect-error — dynamic ref on polymorphic element
        <Tag
            ref={ref}
            className={`${className ?? ''} cursor-text rounded-sm outline-none ring-2 ${isSaving ? 'ring-clinic-200' : 'ring-clinic-300 focus-visible:ring-clinic-500'} ring-offset-2`}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
        >
            {value}
        </Tag>
    );
}
