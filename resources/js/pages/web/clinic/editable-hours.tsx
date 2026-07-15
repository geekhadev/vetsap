import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useClinicEditor } from './clinic-editor-context';

type EditableHoursProps = {
    settingKey: string;
    value: string;
};

function hoursLines(value: string): string[] {
    return value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '');
}

export function EditableHours({ settingKey, value }: EditableHoursProps) {
    const { isEditing, saving, saveField } = useClinicEditor();
    const [draft, setDraft] = useState(value);
    const isSaving = saving === settingKey;

    useEffect(() => {
        setDraft(value);
    }, [value]);

    if (!isEditing) {
        return (
            <>
                {hoursLines(value).map((line) => (
                    <p key={line} className="flex items-center gap-2 font-light text-gray-800">
                        <Clock size={20} className="shrink-0 text-gray-600" aria-hidden />
                        {line}
                    </p>
                ))}
            </>
        );
    }

    return (
        <textarea
            value={draft}
            rows={Math.max(3, hoursLines(draft).length + 1)}
            disabled={isSaving}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
                const next = draft
                    .split('\n')
                    .map((line) => line.trimEnd())
                    .join('\n')
                    .trim();

                if (next !== value.trim()) {
                    void saveField(settingKey, next);
                }
            }}
            className={cn(
                'w-full resize-y rounded-md border border-cyan-300 bg-white px-3 py-2 text-sm font-light text-gray-800 shadow-sm outline-none ring-2 ring-cyan-300 ring-offset-2 focus-visible:ring-cyan-500',
                isSaving && 'ring-cyan-200 opacity-70',
            )}
            placeholder={'Una línea por franja horaria, por ejemplo:\nLunes a Viernes: 09:00 — 19:00\nSábados: 09:00 — 14:00'}
        />
    );
}
