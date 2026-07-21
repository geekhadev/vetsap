import { Head, usePage } from '@inertiajs/react';
import {
    CircleCheck,
    CircleDot,
    CircleMinus,
    CirclePlus,
} from 'lucide-react';
import { useMemo } from 'react';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import { DateDisplay } from '@/components/custom/date-display';
import { StatusPillBadge } from '@/components/custom/status-pill-badge';
import type { StatusPillTone } from '@/components/custom/status-pill-badge';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { CONFIG_TABLEDATA } from '@/pages/sale/cash-registers/config';
import type { CashRegistersIndexPageProps } from '@/pages/sale/cash-registers/config';
import { CashRegistersIndexFilters } from '@/pages/sale/cash-registers/filters';
import type {
    CashRegister,
    CashRegisterBalanceStatus,
    CashRegisterListFilters,
    CashRegistersIndexFiltersDraftFull,
} from '@/pages/sale/cash-registers/types';

const BALANCE_BADGE: Record<
    CashRegisterBalanceStatus,
    { label: string; tone: StatusPillTone; icon: typeof CircleCheck }
> = {
    exact: {
        label: 'Exacta',
        tone: 'positive',
        icon: CircleCheck,
    },
    surplus: {
        label: 'Con excedente',
        tone: 'neutral',
        icon: CirclePlus,
    },
    shortage: {
        label: 'Con deuda',
        tone: 'negative',
        icon: CircleMinus,
    },
};

function CashRegistersIndex() {
    usePage<CashRegistersIndexPageProps>();

    const columns = useMemo<TabledataColumn<CashRegister>[]>(
        () => [
            {
                key: 'opened_at',
                label: 'Apertura',
                sortable: true,
                hideable: false,
                render: (row) => (
                    <DateDisplay value={row.opened_at} mode="datetime" />
                ),
            },
            {
                key: 'closed_at',
                label: 'Cierre',
                sortable: true,
                render: (row) =>
                    row.closed_at ? (
                        <DateDisplay value={row.closed_at} mode="datetime" />
                    ) : (
                        '—'
                    ),
            },
            {
                key: 'opening_amount',
                label: 'Monto inicial',
                sortable: true,
                render: (row) => (
                    <CurrencyDisplay value={row.opening_amount} />
                ),
            },
            {
                key: 'total_amount',
                label: 'Monto total',
                sortable: false,
                render: (row) => (
                    <CurrencyDisplay value={row.total_amount} />
                ),
            },
            {
                key: 'closing_total_amount',
                label: 'Monto cierre',
                sortable: false,
                render: (row) =>
                    row.closing_total_amount !== null ? (
                        <CurrencyDisplay value={row.closing_total_amount} />
                    ) : (
                        '—'
                    ),
            },
            {
                key: 'balance_status',
                label: 'Cuadre',
                sortable: false,
                render: (row) => {
                    if (!row.balance_status) {
                        return '—';
                    }

                    const badge = BALANCE_BADGE[row.balance_status];

                    return (
                        <StatusPillBadge icon={badge.icon} tone={badge.tone}>
                            {badge.label}
                        </StatusPillBadge>
                    );
                },
            },
            {
                key: 'status',
                label: 'Estado',
                sortable: true,
                render: (row) =>
                    row.status === 'open' ? (
                        <StatusPillBadge icon={CircleDot} tone="positive">
                            Abierta
                        </StatusPillBadge>
                    ) : (
                        <StatusPillBadge icon={CircleCheck} tone="neutral">
                            Cerrada
                        </StatusPillBadge>
                    ),
            },
            {
                key: 'opened_by',
                label: 'Usuario',
                sortable: false,
                render: (row) => row.opened_by?.name ?? '—',
            },
        ],
        [],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <TabledataProvider<
                CashRegister,
                CashRegisterListFilters,
                CashRegistersIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <CashRegistersIndexFilters
                        filters={list.filters}
                        setFilter={list.setFilter}
                        applyFilters={list.applyFilters}
                        resetFilters={list.resetFilters}
                    />
                )}
                emptyMessage="Ningún registro de caja coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

CashRegistersIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default CashRegistersIndex;
