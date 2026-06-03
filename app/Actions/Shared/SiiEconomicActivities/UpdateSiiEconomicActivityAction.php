<?php

namespace App\Actions\Shared\SiiEconomicActivities;

use App\Models\Shared\SiiEconomicActivity;

class UpdateSiiEconomicActivityAction
{
    /**
     * @param  array{code: string, description: string, use_iva: bool, tax_category: string, use_internet: bool}  $data
     */
    public function execute(SiiEconomicActivity $siiEconomicActivity, array $data): SiiEconomicActivity
    {
        $siiEconomicActivity->fill([
            'code' => $data['code'],
            'description' => $data['description'],
            'use_iva' => $data['use_iva'],
            'tax_category' => $data['tax_category'],
            'use_internet' => $data['use_internet'],
        ]);
        $siiEconomicActivity->save();

        return $siiEconomicActivity;
    }
}
