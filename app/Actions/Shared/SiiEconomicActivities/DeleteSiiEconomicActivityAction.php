<?php

namespace App\Actions\Shared\SiiEconomicActivities;

use App\Models\Shared\SiiEconomicActivity;

class DeleteSiiEconomicActivityAction
{
    public function execute(SiiEconomicActivity $siiEconomicActivity): void
    {
        $siiEconomicActivity->delete();
    }
}
