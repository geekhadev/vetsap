import {
    Boxes,
    Building2,
    ClipboardList,
    FileType,
    Globe,
    KeyRound,
    LayoutGrid,
    MapPin,
    Package,
    Receipt,
    Share2,
    ShoppingCart,
    Tags,
    UserRound,
    Users,
    WalletCards,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { index as modulesIndex } from '@/routes/administration/modules';
import { index as permissionsIndex } from '@/routes/administration/permissions';
import { index as systemsIndex } from '@/routes/administration/systems';
import { index as companiesIndex } from '@/routes/configuration/companies';
import { index as rolesIndex } from '@/routes/configuration/roles';
import { index as usersIndex } from '@/routes/configuration/users';
import { index as siiCafsIndex } from '@/routes/sale/sii-cafs';
import { index as certificationSiiTicketsIndex } from '@/routes/sale/sii-certification-tickets';
import { index as countriesIndex } from '@/routes/shared/countries';
import { index as paymentMethodsIndex } from '@/routes/shared/payment-methods';
import { index as paymentTypesIndex } from '@/routes/shared/payment-types';
import { index as statesIndex } from '@/routes/shared/states';
import { index as siiEconomicActivitiesIndex } from '@/routes/shared/sii-economic-activities';
import { index as siiTaxDocumentTypesIndex } from '@/routes/shared/sii-tax-document-types';
import type { NavItem } from '@/types';

export const mainNavItems: NavItem[] = [
    {
        title: 'Panel',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Administración',
        icon: Boxes,
        items: [
            {
                title: 'Sistemas',
                href: systemsIndex(),
                icon: Boxes,
            },
            {
                title: 'Módulos',
                href: modulesIndex(),
                icon: Package,
            },
            {
                title: 'Permisos',
                href: permissionsIndex(),
                icon: KeyRound,
            },
        ],
    },
    {
        title: 'Compartido',
        icon: Share2,
        items: [
            {
                title: 'Países',
                href: countriesIndex(),
                icon: Globe,
            },
            {
                title: 'Estados',
                href: statesIndex(),
                icon: MapPin,
                permission: 'shared.states.list',
            },
            {
                title: 'Tipos de pago',
                href: paymentTypesIndex(),
                icon: Tags,
            },
            {
                title: 'Métodos de pago',
                href: paymentMethodsIndex(),
                icon: WalletCards,
            },
            {
                title: 'SII actividades económicas',
                href: siiEconomicActivitiesIndex(),
                icon: ClipboardList,
            },
            {
                title: 'SII tipos de documento tributario',
                href: siiTaxDocumentTypesIndex(),
                icon: FileType,
            },
        ],
    },
    {
        title: 'Ventas',
        icon: ShoppingCart,
        items: [
            {
                title: 'SII Cert. Boletas',
                href: certificationSiiTicketsIndex(),
                icon: Receipt,
                permission: 'sale.sii-certification-tickets.list',
            },
            {
                title: 'SII CAFs',
                href: siiCafsIndex(),
                icon: FileType,
                permission: 'sale.sii-cafs.view',
            },
        ],
    },
    {
        title: 'Configuración',
        icon: Boxes,
        items: [
            {
                title: 'Empresas',
                href: companiesIndex(),
                icon: Building2,
                permission: 'configuration.companies.list',
            },
            {
                title: 'Roles',
                href: rolesIndex(),
                icon: UserRound,
                permission: 'configuration.roles.list',
            },
            {
                title: 'Usuarios',
                href: usersIndex(),
                icon: Users,
            },
        ],
    },
];
