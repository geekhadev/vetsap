export type DashboardChartSeries = {
    key: string;
    label: string;
    color: string;
};

export type DashboardChartPoint = {
    date?: string;
    month?: string;
    [key: string]: string | number | undefined;
};

export type DashboardAppointmentsDailyChart = {
    by_status: {
        series: DashboardChartSeries[];
        data: DashboardChartPoint[];
    };
    by_source: {
        series: DashboardChartSeries[];
        data: DashboardChartPoint[];
    };
};

export type DashboardCustomersPatientsGrowthChart = {
    data: Array<{
        month: string;
        customers: number;
        patients: number;
    }>;
};

export type DashboardAttentionsGrowthChart = {
    data: Array<{
        month: string;
        attentions: number;
    }>;
};

export type DashboardServicesGrowthChart = {
    series: DashboardChartSeries[];
    data: DashboardChartPoint[];
};

export type DashboardPageProps = {
    appointmentsDailyChart: DashboardAppointmentsDailyChart;
    customersPatientsGrowthChart: DashboardCustomersPatientsGrowthChart;
    attentionsGrowthChart: DashboardAttentionsGrowthChart;
    servicesGrowthChart: DashboardServicesGrowthChart;
};
