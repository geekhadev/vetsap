import { Head } from '@inertiajs/react';
import { buildAppRootBreadcrumbs } from '@/lib/module-breadcrumbs';
import { AppointmentsDailyChart } from '@/pages/dashboard/appointments-daily-chart';
import { AttentionsGrowthChart } from '@/pages/dashboard/attentions-growth-chart';
import { CustomersPatientsGrowthChart } from '@/pages/dashboard/customers-patients-growth-chart';
import { ServicesGrowthChart } from '@/pages/dashboard/services-growth-chart';
import type { DashboardPageProps } from '@/pages/dashboard/types';

export default function Dashboard({
    appointmentsDailyChart,
    customersPatientsGrowthChart,
    attentionsGrowthChart,
    servicesGrowthChart,
}: DashboardPageProps) {
    return (
        <>
            <Head title="Panel" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                    <AppointmentsDailyChart chart={appointmentsDailyChart} />
                    <CustomersPatientsGrowthChart
                        chart={customersPatientsGrowthChart}
                    />
                    <AttentionsGrowthChart chart={attentionsGrowthChart} />
                    <ServicesGrowthChart chart={servicesGrowthChart} />
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: buildAppRootBreadcrumbs(),
};
