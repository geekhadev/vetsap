<?php

namespace App\Actions\Shared\SiiTaxDocumentTypes;

use App\Models\Shared\SiiTaxDocumentType;

class CreateSiiTaxDocumentTypeAction
{
    /**
     * @param  array{code: string, name: string, abbreviation: string, use_sale: bool, use_purchase: bool}  $data
     */
    public function execute(array $data): SiiTaxDocumentType
    {
        return SiiTaxDocumentType::query()->create([
            'code' => $data['code'],
            'name' => $data['name'],
            'abbreviation' => $data['abbreviation'],
            'use_sale' => $data['use_sale'],
            'use_purchase' => $data['use_purchase'],
        ]);
    }
}
