import {
    Boxes,
    Building2,
    CalendarCog,
    CalendarDays,
    CalendarOff,
    ClipboardList,
    FileType,
    Globe,
    KeyRound,
    LayoutGrid,
    ListChecks,
    MapPin,
    Package,
    PawPrint,
    Plug2,
    Receipt,
    Scissors,
    Share2,
    ShoppingCart,
    Stethoscope,
    Tag,
    Warehouse,
    Tags,
    UserRound,
    Users,
    WalletCards,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { index as modulesIndex } from '@/routes/administration/modules';
import { index as permissionsIndex } from '@/routes/administration/permissions';
import { index as systemsIndex } from '@/routes/administration/systems';
import { index as appointmentStatusesIndex } from '@/routes/agenda/appointment-statuses';
import { index as calendarIndex } from '@/routes/agenda/calendar';
import { index as holidaysIndex } from '@/routes/agenda/holidays';
import { index as calendarSettingsIndex } from '@/routes/configuration/calendar-settings';
import { index as companiesIndex } from '@/routes/configuration/companies';
import { index as companyOfficesIndex } from '@/routes/configuration/company-offices';
import { index as integrationSettingsIndex } from '@/routes/configuration/integration-settings';
import { index as rolesIndex } from '@/routes/configuration/roles';
import { index as usersIndex } from '@/routes/configuration/users';
import { index as websiteSettingsIndex } from '@/routes/configuration/website-settings';
import { index as doctorsIndex } from '@/routes/medic/doctors';
import { index as patientsIndex } from '@/routes/medic/patients';
import { index as servicesIndex } from '@/routes/medic/services';
import { index as specialtiesIndex } from '@/routes/medic/specialties';
import { index as speciesIndex } from '@/routes/medic/species';
import { index as customersIndex } from '@/routes/sale/customers';
import { index as siiCafsIndex } from '@/routes/sale/sii-cafs';
import { index as certificationSiiTicketsIndex } from '@/routes/sale/sii-certification-tickets';
import { index as countriesIndex } from '@/routes/shared/countries';
import { index as paymentMethodsIndex } from '@/routes/shared/payment-methods';
import { index as paymentTypesIndex } from '@/routes/shared/payment-types';
import { index as siiEconomicActivitiesIndex } from '@/routes/shared/sii-economic-activities';
import { index as siiTaxDocumentTypesIndex } from '@/routes/shared/sii-tax-document-types';
import { index as statesIndex } from '@/routes/shared/states';
import { index as productCategoriesIndex } from '@/routes/store/product-categories';
import { index as productTypesIndex } from '@/routes/store/product-types';
import { index as productsIndex } from '@/routes/store/products';
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
                title: 'Clientes',
                href: customersIndex(),
                icon: Users,
                permission: 'sale.customers.list',
            },
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
        title: 'Almacén',
        icon: Warehouse,
        items: [
            {
                title: 'Tipos de productos',
                href: productTypesIndex(),
                icon: Tag,
                permission: 'store.product-types.list',
            },
            {
                title: 'Categorías de productos',
                href: productCategoriesIndex(),
                icon: Tags,
                permission: 'store.product-categories.list',
            },
            {
                title: 'Productos',
                href: productsIndex(),
                icon: Package,
                permission: 'store.products.list',
            },
        ],
    },
    {
        title: 'Medicina',
        icon: Stethoscope,
        items: [
            {
                title: 'Especialidades',
                href: specialtiesIndex(),
                icon: Stethoscope,
                permission: 'medic.specialties.list',
            },
            {
                title: 'Servicios',
                href: servicesIndex(),
                icon: Scissors,
                permission: 'medic.services.list',
            },
            {
                title: 'Especies',
                href: speciesIndex(),
                icon: PawPrint,
                permission: 'medic.species.list',
            },
            {
                title: 'Doctores',
                href: doctorsIndex(),
                icon: UserRound,
                permission: 'medic.doctors.list',
            },
            {
                title: 'Pacientes',
                href: patientsIndex(),
                icon: PawPrint,
                permission: 'medic.patients.list',
            },
        ],
    },
    {
        title: 'Agenda',
        icon: CalendarDays,
        items: [
            {
                title: 'Calendario',
                href: calendarIndex(),
                icon: CalendarDays,
                permission: 'agenda.calendar.list',
            },
            {
                title: 'Días feriados',
                href: holidaysIndex(),
                icon: CalendarOff,
                permission: 'agenda.holidays.list',
            },
            {
                title: 'Estados de cita',
                href: appointmentStatusesIndex(),
                icon: ListChecks,
                permission: 'agenda.appointment-statuses.list',
            },
        ],
    },
    {
        title: 'Configuración',
        icon: Boxes,
        items: [
            {
                title: 'Empresa',
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
            {
                title: 'Sucursales',
                href: companyOfficesIndex(),
                icon: MapPin,
                permission: 'configuration.company-offices.list',
            },
            {
                title: 'Sitio web',
                href: websiteSettingsIndex(),
                icon: Globe,
            },
            {
                title: 'Calendario',
                href: calendarSettingsIndex(),
                icon: CalendarCog,
            },
            {
                title: 'Integraciones',
                href: integrationSettingsIndex(),
                icon: Plug2,
            },
        ],
    },
];
