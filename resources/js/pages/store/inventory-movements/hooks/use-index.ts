import { useCallback, useState } from 'react';
import type { InventoryMovementTypeValue } from '../types';

export function useInventoryMovementDialogState() {
    const [formOpen, setFormOpen] = useState(false);
    const [formSessionKey, setFormSessionKey] = useState(0);
    const [movementType, setMovementType] =
        useState<InventoryMovementTypeValue | null>(null);

    const openCreate = useCallback((type: InventoryMovementTypeValue) => {
        setMovementType(type);
        setFormSessionKey((key) => key + 1);
        setFormOpen(true);
    }, []);

    const handleFormOpenChange = useCallback((open: boolean) => {
        setFormOpen(open);

        if (!open) {
            setMovementType(null);
        }
    }, []);

    return {
        formOpen,
        formSessionKey,
        movementType,
        openCreate,
        handleFormOpenChange,
    };
}
