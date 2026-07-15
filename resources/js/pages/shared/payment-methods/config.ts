import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    PaymentMethod,
    PaymentMethodListFilters,
} from '@/pages/shared/payment-methods/types';
import { index as paymentMethodsIndex } from '@/routes/shared/payment-methods';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';
import { PAYMENT_METHODS_INDEX_MODULE_FILTER_KEYS } from './types';

export type PaymentMethodsIndexPageProps = {
    data: Paginated<PaymentMethod>;
    filters: PaymentMethodListFilters;
};

const PAGE = {
    storageKey: 'payment-methods-index',
    title: 'Métodos de pago',
    description: 'Formas de cobro o pago reutilizables en los distintos módulos.',
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
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, paymentMethodsIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        PaymentMethod,
        PaymentMethodListFilters,
        typeof PAYMENT_METHODS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: PAYMENT_METHODS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            paymentMethodsIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
