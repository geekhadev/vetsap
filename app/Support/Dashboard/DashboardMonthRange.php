<?php

namespace App\Support\Dashboard;

use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

final class DashboardMonthRange
{
    public const MONTHS = 12;

    /**
     * @return array{0: CarbonInterface, 1: CarbonInterface}
     */
    public static function currentWindow(): array
    {
        $end = now()->endOfMonth()->endOfDay();
        $start = now()->subMonths(self::MONTHS - 1)->startOfMonth()->startOfDay();

        return [$start, $end];
    }

    /**
     * @return list<string>
     */
    public static function monthKeys(CarbonInterface $start, CarbonInterface $end): array
    {
        $months = [];

        for ($month = $start->copy()->startOfMonth(); $month->lte($end); $month = $month->addMonth()) {
            $months[] = $month->format('Y-m');
        }

        return $months;
    }

    public static function monthKey(CarbonInterface|string $date): string
    {
        return Carbon::parse($date)->format('Y-m');
    }
}
