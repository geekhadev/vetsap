import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import { index as companiesIndex } from '@/routes/configuration/companies';
import type { BreadcrumbItem } from '@/types/navigation';

export const COMPANY_SETTINGS_PAGE = {
    title: 'Empresa',
    description:
        'Administra la información general de la empresa activa en el encabezado.',
    breadcrumbs: (): BreadcrumbItem[] => buildModuleBreadcrumbs('Empresa', companiesIndex()),
} as const;
