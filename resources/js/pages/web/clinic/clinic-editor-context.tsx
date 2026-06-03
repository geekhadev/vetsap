import { router } from '@inertiajs/react';
import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type ClinicEditorContextValue = {
    isEditing: boolean;
    saving: string | null;
    toggleEditing: () => void;
    saveField: (key: string, value: string) => Promise<void>;
    saveImage: (key: string, file: File) => Promise<void>;
};

const ClinicEditorContext = createContext<ClinicEditorContextValue | null>(null);

function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export function ClinicEditorProvider({ slug, children }: { slug: string; children: ReactNode }) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState<string | null>(null);

    const toggleEditing = useCallback(() => setIsEditing((v) => !v), []);

    const saveField = useCallback(
        async (key: string, value: string) => {
            setSaving(key);
            try {
                await fetch(`/clinica/${slug}/settings/${key}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    body: JSON.stringify({ value }),
                });
                router.reload({ only: ['settings'], preserveScroll: true });
            } finally {
                setSaving(null);
            }
        },
        [slug],
    );

    const saveImage = useCallback(
        async (key: string, file: File) => {
            setSaving(key);
            try {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('_method', 'PUT');
                await fetch(`/clinica/${slug}/settings/${key}`, {
                    method: 'POST',
                    headers: { 'X-CSRF-TOKEN': getCsrfToken() },
                    body: formData,
                });
                router.reload({ only: ['settings'], preserveScroll: true });
            } finally {
                setSaving(null);
            }
        },
        [slug],
    );

    return (
        <ClinicEditorContext.Provider value={{ isEditing, saving, toggleEditing, saveField, saveImage }}>
            {children}
        </ClinicEditorContext.Provider>
    );
}

const NO_OP_CONTEXT: ClinicEditorContextValue = {
    isEditing: false,
    saving: null,
    toggleEditing: () => {},
    saveField: async () => {},
    saveImage: async () => {},
};

export function useClinicEditor(): ClinicEditorContextValue {
    return useContext(ClinicEditorContext) ?? NO_OP_CONTEXT;
}
