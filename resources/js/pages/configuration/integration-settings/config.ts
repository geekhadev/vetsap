import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import { index as integrationSettingsIndex } from '@/routes/configuration/integration-settings';
import type { BreadcrumbItem } from '@/types/navigation';

export const INTEGRATION_SETTINGS_PAGE = {
    title: 'Integraciones',
    description:
        'Conecta servicios externos asociados a la empresa seleccionada, como el SII y Google.',
    breadcrumbs: (): BreadcrumbItem[] => buildModuleBreadcrumbs('Integraciones', integrationSettingsIndex()),
} as const;
