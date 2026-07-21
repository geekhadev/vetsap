import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    PaymentMethodOption,
    ReceivedPayment,
    ReceivedPaymentListFilters,
    ReceivedPaymentsIndexFiltersDraftFull,
} from '@/pages/sale/received-payments/types';
import { RECEIVED_PAYMENTS_INDEX_MODULE_FILTER_KEYS } from '@/pages/sale/received-payments/types';
import { index as receivedPaymentsIndex } from '@/routes/sale/received-payments';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type ReceivedPaymentsIndexPageProps = {
    data: Paginated<ReceivedPayment>;
    filters: ReceivedPaymentsIndexFiltersDraftFull;
    paymentMethods: PaymentMethodOption[];
};

const PAGE = {
    storageKey: 'received-payments-index',
    title: 'Pagos recibidos',
    description: 'Consulta de pagos registrados en documentos de venta de la empresa activa.',
    searchPlaceholder: 'Cliente, RUT, documento o método…',
} as const;

const ORDER = { sort: 'paid_at', direction: 'desc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, receivedPaymentsIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        ReceivedPayment,
        ReceivedPaymentListFilters,
        typeof RECEIVED_PAYMENTS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: RECEIVED_PAYMENTS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            receivedPaymentsIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
