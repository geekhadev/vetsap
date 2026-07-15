import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
    ChartTooltip,
    ChartTooltipContent
    
} from '@/components/ui/chart';
import type {ChartConfig} from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { appointmentStatusColorToChartColor } from '@/lib/appointment-status-colors';
import { cn } from '@/lib/utils';
import {
    formatDayLabel,
    formatDayTooltip,
} from '@/pages/dashboard/chart-format';
import type {
    DashboardAppointmentsDailyChart,
    DashboardChartSeries,
} from '@/pages/dashboard/types';

const LEGEND_LABEL_MAX_LENGTH = 12;

function truncateLegendLabel(label: string): string {
    if (label.length <= LEGEND_LABEL_MAX_LENGTH) {
        return label;
    }

    return `${label.slice(0, LEGEND_LABEL_MAX_LENGTH - 1).trimEnd()}…`;
}

function AppointmentsChartLegend({
    className,
    labels,
    payload,
}: {
    className?: string;
    labels: Record<string, string>;
    payload?: ReadonlyArray<{
        color?: string;
        dataKey?: string | number;
        type?: string;
        value?: string | number;
    }>;
}) {
    if (!payload?.length) {
        return null;
    }

    return (
        <div
            className={cn(
                'flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 pt-3',
                className,
            )}
        >
            {payload
                .filter((item) => item.type !== 'none')
                .map((item) => {
                    const key = String(item.dataKey ?? item.value ?? '');
                    const label = labels[key] ?? key;
                    const displayLabel = truncateLegendLabel(label);

                    return (
                        <div
                            key={key}
                            className="flex items-center gap-1.5"
                            title={label !== displayLabel ? label : undefined}
                        >
                            <div
                                className="size-2 shrink-0 rounded-[2px]"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs whitespace-nowrap">
                                {displayLabel}
                            </span>
                        </div>
                    );
                })}
        </div>
    );
}

type AppointmentsDailyChartProps = {
    chart: DashboardAppointmentsDailyChart;
};

type ChartMode = 'status' | 'source';

const SOURCE_CHART_COLORS: Record<string, string> = {
    'chart-1': 'var(--chart-1)',
    'chart-2': 'var(--chart-2)',
    'chart-3': 'var(--chart-3)',
    'chart-4': 'var(--chart-4)',
    'chart-5': 'var(--chart-5)',
};

function resolveSeriesColor(series: DashboardChartSeries, mode: ChartMode): string {
    if (mode === 'status') {
        return appointmentStatusColorToChartColor(series.color);
    }

    return SOURCE_CHART_COLORS[series.color] ?? 'var(--chart-1)';
}

export function AppointmentsDailyChart({ chart }: AppointmentsDailyChartProps) {
    const [mode, setMode] = useState<ChartMode>('status');

    const active = mode === 'status' ? chart.by_status : chart.by_source;

    const chartConfig: ChartConfig = Object.fromEntries(
        active.series.map((series) => [
            series.key,
            {
                label: series.label,
                color: resolveSeriesColor(series, mode),
            },
        ]),
    );

    const legendLabels = Object.fromEntries(
        active.series.map((series) => [series.key, series.label]),
    );

    const hasData = active.data.some((point) =>
        active.series.some((series) => Number(point[series.key] ?? 0) > 0),
    );

    return (
        <Card className="gap-0 overflow-hidden py-0">
            <CardHeader className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <CardTitle>Citas diarias</CardTitle>
                    <CardDescription>
                        Últimos 14 días por estado o por origen
                    </CardDescription>
                </div>
                <Tabs
                    value={mode}
                    onValueChange={(value) => {
                        if (value === 'status' || value === 'source') {
                            setMode(value);
                        }
                    }}
                >
                    <TabsList>
                        <TabsTrigger value="status">Estados</TabsTrigger>
                        <TabsTrigger value="source">Origen</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="px-2 pt-4 pb-4 sm:px-4">
                {hasData ? (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[220px] w-full"
                    >
                        <BarChart
                            accessibilityLayer
                            data={active.data}
                            margin={{ left: 4, right: 8, top: 8 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={24}
                                tickFormatter={formatDayLabel}
                            />
                            <YAxis
                                allowDecimals={false}
                                tickLine={false}
                                axisLine={false}
                                width={28}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) =>
                                            typeof value === 'string'
                                                ? formatDayTooltip(value)
                                                : String(value)
                                        }
                                    />
                                }
                            />
                            <ChartLegend
                                content={
                                    <AppointmentsChartLegend
                                        labels={legendLabels}
                                    />
                                }
                            />
                            {active.series.map((series) => (
                                <Bar
                                    key={series.key}
                                    dataKey={series.key}
                                    stackId="appointments"
                                    fill={resolveSeriesColor(series, mode)}
                                    radius={2}
                                />
                            ))}
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="text-muted-foreground flex h-[220px] items-center justify-center text-sm">
                        No hay citas en los últimos 14 días
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
