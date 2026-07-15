import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
    
} from '@/components/ui/chart';
import type {ChartConfig} from '@/components/ui/chart';
import {
    formatMonthLabel,
    formatMonthTooltip,
} from '@/pages/dashboard/chart-format';
import type { DashboardCustomersPatientsGrowthChart } from '@/pages/dashboard/types';

type CustomersPatientsGrowthChartProps = {
    chart: DashboardCustomersPatientsGrowthChart;
};

const chartConfig = {
    customers: {
        label: 'Clientes',
        color: 'var(--chart-1)',
    },
    patients: {
        label: 'Pacientes',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

export function CustomersPatientsGrowthChart({
    chart,
}: CustomersPatientsGrowthChartProps) {
    const hasGrowth = chart.data.some(
        (point) => point.customers > 0 || point.patients > 0,
    );

    return (
        <Card className="gap-0 overflow-hidden py-0">
            <CardHeader className="border-b px-4 py-4">
                <CardTitle>Crecimiento de clientes / pacientes</CardTitle>
                <CardDescription>
                    Totales acumulados por mes · últimos 12 meses
                </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-4 pb-4 sm:px-4">
                {hasGrowth ? (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[220px] w-full"
                    >
                        <LineChart
                            accessibilityLayer
                            data={chart.data}
                            margin={{ left: 4, right: 8, top: 8 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={28}
                                tickFormatter={formatMonthLabel}
                            />
                            <YAxis
                                allowDecimals={false}
                                tickLine={false}
                                axisLine={false}
                                width={36}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) =>
                                            typeof value === 'string'
                                                ? formatMonthTooltip(value)
                                                : String(value)
                                        }
                                    />
                                }
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line
                                type="monotone"
                                dataKey="customers"
                                stroke="var(--color-customers)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="patients"
                                stroke="var(--color-patients)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <div className="text-muted-foreground flex h-[220px] items-center justify-center text-sm">
                        Aún no hay clientes ni pacientes registrados
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
