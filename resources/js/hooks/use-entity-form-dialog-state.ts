import { useCallback, useState } from 'react';

export function useEntityFormDialogState<T>() {
    const [formOpen, setFormOpen] = useState(false);
    const [editingEntity, setEditingEntity] = useState<T | null>(null);

    const openCreate = useCallback(() => {
        setEditingEntity(null);
        setFormOpen(true);
    }, []);

    const openEdit = useCallback((row: T) => {
        setEditingEntity(row);
        setFormOpen(true);
    }, []);

    const handleFormOpenChange = useCallback((open: boolean) => {
        setFormOpen(open);

        if (!open) {
            setEditingEntity(null);
        }
    }, []);

    return {
        formOpen,
        editingEntity,
        openCreate,
        openEdit,
        handleFormOpenChange,
    };
}
