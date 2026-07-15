import {
    Boxes,
    Building2,
    Calendar,
    CalendarCog,
    CalendarDays,
    CalendarOff,
    ChartLine,
    ClipboardList,
    ClipboardPlus,
    Cog,
    FileType,
    Globe,
    GraduationCap,
    Heart,
    History,
    KeyRound,
    LayoutTemplate,
    ListChecks,
    MapPin,
    Package,
    PawPrint,
    Plug2,
    Receipt,
    Scissors,
    Server,
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
import { index as clinicalAttentionsIndex } from '@/routes/medic/clinical-attentions';
import { index as clinicalTemplatesIndex } from '@/routes/medic/clinical-templates';
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
import { index as inventoryMovementsIndex } from '@/routes/store/inventory-movements';
import { index as movementCategoriesIndex } from '@/routes/store/movement-categories';
import { index as productCategoriesIndex } from '@/routes/store/product-categories';
import { index as productMovementsIndex } from '@/routes/store/product-movements';
import { index as productTypesIndex } from '@/routes/store/product-types';
import { index as productsIndex } from '@/routes/store/products';
import type { NavItem } from '@/types';

export const mainNavItems: NavItem[] = [
    {
        title: 'KPIs',
        href: dashboard(),
        icon: ChartLine,
    },
    {
        title: 'Agenda',
        icon: CalendarDays,
        items: [
            {
                title: 'Calendario',
                href: calendarIndex(),
                icon: Calendar,
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
        title: 'Medicina',
        icon: Stethoscope,
        items: [
            {
                title: 'Pacientes',
                href: patientsIndex(),
                icon: Heart,
                permission: 'medic.patients.list',
            },
            {
                title: 'Doctores',
                href: doctorsIndex(),
                icon: UserRound,
                permission: 'medic.doctors.list',
            },
            {
                title: 'Atenciones',
                href: clinicalAttentionsIndex(),
                icon: ClipboardPlus,
                permission: 'medic.clinical-attentions.list',
            },
            {
                title: 'Servicios',
                href: servicesIndex(),
                icon: Scissors,
                permission: 'medic.services.list',
            },
            {
                title: 'Fichas médicas',
                href: clinicalTemplatesIndex(),
                icon: LayoutTemplate,
                permission: 'medic.clinical-templates.list',
            },
            {
                title: 'Especialidades',
                href: specialtiesIndex(),
                icon: GraduationCap,
                permission: 'medic.specialties.list',
            },
            {
                title: 'Especies',
                href: speciesIndex(),
                icon: PawPrint,
                permission: 'medic.species.list',
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
                title: 'SII CAFs',
                href: siiCafsIndex(),
                icon: FileType,
                permission: 'sale.sii-cafs.view',
            },
            {
                title: 'SII Cert. Boletas',
                href: certificationSiiTicketsIndex(),
                icon: Receipt,
                permission: 'sale.sii-certification-tickets.list',
            },
        ],
    },
    {
        title: 'Almacén',
        icon: Warehouse,
        items: [
            {
                title: 'Productos',
                href: productsIndex(),
                icon: Package,
                permission: 'store.products.list',
            },
            {
                title: 'Mov. de inventario',
                href: inventoryMovementsIndex(),
                icon: Boxes,
                permission: 'store.inventory-movements.list',
            },
            {
                title: 'Mov. de productos',
                href: productMovementsIndex(),
                icon: History,
                permission: 'store.inventory-movements.list',
            },
            {
                title: 'Cat. de movimiento',
                href: movementCategoriesIndex(),
                icon: ClipboardList,
                permission: 'store.movement-categories.list',
            },
            {
                title: 'Cat. de productos',
                href: productCategoriesIndex(),
                icon: Tags,
                permission: 'store.product-categories.list',
            },
            {
                title: 'Tipos de productos',
                href: productTypesIndex(),
                icon: Tag,
                permission: 'store.product-types.list',
            },
        ],
    },
    {
        title: 'Configuración',
        icon: Cog,
        items: [
            {
                title: 'Empresa',
                href: companiesIndex(),
                icon: Building2,
                permission: 'configuration.companies.list',
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
                title: 'SII tipos de documento',
                href: siiTaxDocumentTypesIndex(),
                icon: FileType,
            },
        ],
    },
    {
        title: 'Administración',
        icon: Boxes,
        items: [
            {
                title: 'Sistemas',
                href: systemsIndex(),
                icon: Server,
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
];
