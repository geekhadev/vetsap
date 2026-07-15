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
import type { DashboardServicesGrowthChart } from '@/pages/dashboard/types';

type ServicesGrowthChartProps = {
    chart: DashboardServicesGrowthChart;
};

const SERIES_COLORS: Record<string, string> = {
    'chart-1': 'var(--chart-1)',
    'chart-2': 'var(--chart-2)',
    'chart-3': 'var(--chart-3)',
    'chart-4': 'var(--chart-4)',
    'chart-5': 'var(--chart-5)',
};

export function ServicesGrowthChart({ chart }: ServicesGrowthChartProps) {
    const chartConfig: ChartConfig = Object.fromEntries(
        chart.series.map((series) => [
            series.key,
            {
                label: series.label,
                color: SERIES_COLORS[series.color] ?? 'var(--chart-1)',
            },
        ]),
    );

    const hasGrowth = chart.data.some((point) =>
        chart.series.some((series) => Number(point[series.key] ?? 0) > 0),
    );

    return (
        <Card className="gap-0 overflow-hidden py-0">
            <CardHeader className="border-b px-4 py-4">
                <CardTitle>Crecimiento por servicios</CardTitle>
                <CardDescription>
                    Servicios aplicados en atenciones · acumulado mensual ·
                    últimos 12 meses
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
                            {chart.series.map((series) => (
                                <Line
                                    key={series.key}
                                    type="monotone"
                                    dataKey={series.key}
                                    stroke={
                                        SERIES_COLORS[series.color] ??
                                        'var(--chart-1)'
                                    }
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            ))}
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <div className="text-muted-foreground flex h-[220px] items-center justify-center text-sm">
                        Aún no hay servicios aplicados en atenciones
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
