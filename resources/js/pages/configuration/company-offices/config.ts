import { dashboard } from '@/routes';
import { index as companyOfficesIndex } from '@/routes/configuration/company-offices';
import type { BreadcrumbItem } from '@/types/navigation';

export const COMPANY_OFFICES_PAGE = {
    title: 'Sucursales',
    description:
        'Gestiona las sucursales adicionales de la empresa seleccionada. La casa matriz se edita en la información general de la empresa.',
    breadcrumbs: (): BreadcrumbItem[] => [
        { title: 'Panel', href: dashboard() },
        {
            title: 'Sucursales',
            href: companyOfficesIndex(),
        },
    ],
} as const;
