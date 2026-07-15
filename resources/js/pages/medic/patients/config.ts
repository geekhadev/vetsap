import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    CustomerOption,
    Patient,
    PatientListFilters,
    PatientsIndexCan,
    PatientsIndexFiltersDraftFull,
    SpeciesOption,
} from '@/pages/medic/patients/types';
import { PATIENTS_INDEX_MODULE_FILTER_KEYS } from '@/pages/medic/patients/types';
import { index as patientsIndex } from '@/routes/medic/patients';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type PatientsIndexPageProps = {
    data: Paginated<Patient>;
    filters: PatientsIndexFiltersDraftFull;
    species: SpeciesOption[];
    customers: CustomerOption[];
    can: PatientsIndexCan;
};

const PAGE = {
    storageKey: 'patients-index',
    title: 'Pacientes',
    description: 'Fichas clínicas de pacientes de la empresa activa.',
    searchPlaceholder: 'Nombre, ficha, chip o raza…',
} as const;

const ORDER = { sort: 'name', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, patientsIndex()),
        edit: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, patientsIndex(), {
                title: 'Gestionar paciente',
            }),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        Patient,
        PatientListFilters,
        typeof PATIENTS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: PATIENTS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => patientsIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
