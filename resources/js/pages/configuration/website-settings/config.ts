import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import { index as websiteSettingsIndex } from '@/routes/configuration/website-settings';
import type { BreadcrumbItem } from '@/types/navigation';

export const WEBSITE_SETTINGS_PAGE = {
    title: 'Sitio web',
    description:
        'Personaliza la presencia en línea de tu clínica: logo, dirección web, redes sociales y mapa de contacto.',
    breadcrumbs: (): BreadcrumbItem[] => buildModuleBreadcrumbs('Sitio web', websiteSettingsIndex()),
} as const;
