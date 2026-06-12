<?php

namespace App\Actions\Configuration\CalendarSettings;

use App\Actions\Configuration\CompanySettings\GetCompanySettingsAction;
use App\Models\Company;
use App\Support\Configuration\CalendarSettingKeys;

final class ResolveCalendarTimeBlockMinutesAction
{
    public function __construct(
        private GetCompanySettingsAction $getCompanySettings,
    ) {}

    public function execute(Company $company): int
    {
        $stored = $this->getCompanySettings->execute(
            $company,
            [CalendarSettingKeys::TIME_BLOCK_MINUTES],
        );

        $value = $stored[CalendarSettingKeys::TIME_BLOCK_MINUTES]
            ?? CalendarSettingKeys::defaults()[CalendarSettingKeys::TIME_BLOCK_MINUTES];

        $minutes = (int) $value;

        return in_array($minutes, [15, 30, 45, 60], true) ? $minutes : 30;
    }
}
