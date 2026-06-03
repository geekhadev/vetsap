<?php

namespace App\Actions\Shared\SiiEconomicActivities;

use App\Models\Shared\SiiEconomicActivity;

class CreateSiiEconomicActivityAction
{
    /**
     * @param  array{code: string, description: string, use_iva: bool, tax_category: string, use_internet: bool}  $data
     */
    public function execute(array $data): SiiEconomicActivity
    {
        return SiiEconomicActivity::query()->create([
            'code' => $data['code'],
            'description' => $data['description'],
            'use_iva' => $data['use_iva'],
            'tax_category' => $data['tax_category'],
            'use_internet' => $data['use_internet'],
        ]);
    }
}
