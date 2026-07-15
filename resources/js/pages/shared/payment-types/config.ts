import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    PaymentType,
    PaymentTypeListFilters,
} from '@/pages/shared/payment-types/types';
import { index as paymentTypesIndex } from '@/routes/shared/payment-types';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';
import { PAYMENT_TYPES_INDEX_MODULE_FILTER_KEYS } from './types';

export type PaymentTypesIndexPageProps = {
    data: Paginated<PaymentType>;
    filters: PaymentTypeListFilters;
};

const PAGE = {
    storageKey: 'payment-types-index',
    title: 'Tipos de pago',
    description: 'Catálogo compartido (crédito, contado, etc.).',
    searchPlaceholder: 'Nombre o código…',
} as const;

const ORDER = { sort: 'name', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, paymentTypesIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        PaymentType,
        PaymentTypeListFilters,
        typeof PAYMENT_TYPES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: PAYMENT_TYPES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            paymentTypesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
