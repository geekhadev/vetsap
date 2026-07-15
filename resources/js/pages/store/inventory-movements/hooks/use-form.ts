import { useMemo } from 'react';
import InventoryMovementsController from '@/actions/App/Http/Controllers/Store/InventoryMovementsController';
import type { InventoryMovementTypeValue } from '../types';

export function useInventoryMovementForm(type: InventoryMovementTypeValue | null) {
    const isEntry = type === 'entry';
    const headTitle = type === null
        ? 'Movimiento'
        : isEntry
          ? 'Nueva entrada de inventario'
          : 'Nueva salida de inventario';
    const description = type === null
        ? ''
        : isEntry
          ? 'Registra un ingreso de stock. El número se asigna automáticamente.'
          : 'Registra una salida de stock. El número se asigna automáticamente.';

    const formProps = useMemo(() => InventoryMovementsController.store.form(), []);

    return {
        isEntry,
        headTitle,
        description,
        formProps,
    };
}
