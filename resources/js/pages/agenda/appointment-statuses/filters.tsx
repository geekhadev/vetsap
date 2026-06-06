import { IsActiveIndexFilters } from '@/components/custom/is-active-index-filters';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    AppointmentStatus,
    AppointmentStatusesIndexFiltersDraftFull,
} from './types';

type AppointmentStatusesIndexFiltersProps = Pick<
    TabledataListPageViewModel<
        AppointmentStatus,
        AppointmentStatusesIndexFiltersDraftFull
    >,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
>;

export function AppointmentStatusesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: AppointmentStatusesIndexFiltersProps) {
    return (
        <IsActiveIndexFilters
            isActive={filters.is_active}
            onIsActiveChange={(value) => setFilter('is_active', value)}
            onIsActiveClear={() => setFilter('is_active', '')}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
            gender="m"
        />
    );
}
