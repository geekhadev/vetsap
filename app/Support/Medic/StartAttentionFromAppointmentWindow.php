<?php

namespace App\Support\Medic;

use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

final class StartAttentionFromAppointmentWindow
{
    public static function minutesBefore(): int
    {
        return max(0, (int) config('vetsap.clinical_attention.start_from_appointment_minutes_before', 60));
    }

    public static function minutesAfter(): int
    {
        return max(0, (int) config('vetsap.clinical_attention.start_from_appointment_minutes_after', 240));
    }

    /**
     * @return array{earliest: Carbon, latest: Carbon}
     */
    public static function bounds(CarbonInterface $startsAt): array
    {
        $start = Carbon::parse($startsAt);

        return [
            'earliest' => $start->copy()->subMinutes(self::minutesBefore()),
            'latest' => $start->copy()->addMinutes(self::minutesAfter()),
        ];
    }

    public static function contains(CarbonInterface $startsAt, ?CarbonInterface $now = null): bool
    {
        $moment = $now !== null ? Carbon::parse($now) : now();
        $bounds = self::bounds($startsAt);

        return $moment->betweenIncluded($bounds['earliest'], $bounds['latest']);
    }
}
