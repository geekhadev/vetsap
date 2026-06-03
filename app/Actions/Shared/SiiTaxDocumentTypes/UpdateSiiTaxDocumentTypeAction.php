<?php

namespace App\Actions\Shared\SiiTaxDocumentTypes;

use App\Models\Shared\SiiTaxDocumentType;

class UpdateSiiTaxDocumentTypeAction
{
    /**
     * @param  array{code: string, name: string, abbreviation: string, use_sale: bool, use_purchase: bool}  $data
     */
    public function execute(SiiTaxDocumentType $siiTaxDocumentType, array $data): SiiTaxDocumentType
    {
        $siiTaxDocumentType->fill([
            'code' => $data['code'],
            'name' => $data['name'],
            'abbreviation' => $data['abbreviation'],
            'use_sale' => $data['use_sale'],
            'use_purchase' => $data['use_purchase'],
        ]);
        $siiTaxDocumentType->save();

        return $siiTaxDocumentType;
    }
}
