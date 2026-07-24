import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import { index as inventorySettingsIndex } from '@/routes/configuration/inventory-settings';
import type { BreadcrumbItem } from '@/types/navigation';

export const INVENTORY_SETTINGS_PAGE = {
    title: 'Inventario',
    description:
        'Define si el sistema valida stock suficiente al vender productos o aplicar vacunas. Si la validación está desactivada, se permitirá operar y el stock puede quedar negativo.',
    breadcrumbs: (): BreadcrumbItem[] =>
        buildModuleBreadcrumbs('Inventario', inventorySettingsIndex()),
} as const;
