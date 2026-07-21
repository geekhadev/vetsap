import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    SpeciesOption,
    VaccineProductOption,
    VaccinationProtocol,
    VaccinationProtocolListFilters,
    VaccinationProtocolsIndexCan,
    VaccinationProtocolsIndexFiltersDraftFull,
} from '@/pages/medic/vaccination-protocols/types';
import { VACCINATION_PROTOCOLS_INDEX_MODULE_FILTER_KEYS } from '@/pages/medic/vaccination-protocols/types';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';
import { index as vaccinationProtocolsIndex } from '@/routes/medic/vaccination-protocols';

export type VaccinationProtocolsIndexPageProps = {
    data: Paginated<VaccinationProtocol>;
    filters: VaccinationProtocolsIndexFiltersDraftFull;
    species: SpeciesOption[];
    vaccineProducts: VaccineProductOption[];
    can: VaccinationProtocolsIndexCan;
};

const PAGE = {
    storageKey: 'vaccination-protocols-index',
    title: 'Planes de vacunación',
    description: 'Protocolos de vacunación por especie de la empresa activa.',
    searchPlaceholder: 'Buscar por nombre…',
} as const;

const ORDER = { sort: 'name', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, vaccinationProtocolsIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        VaccinationProtocol,
        VaccinationProtocolListFilters,
        typeof VACCINATION_PROTOCOLS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: VACCINATION_PROTOCOLS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            vaccinationProtocolsIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
