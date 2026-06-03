<?php

namespace App\Actions\Shared\SiiTaxDocumentTypes;

use App\Models\Shared\SiiTaxDocumentType;

class DeleteSiiTaxDocumentTypeAction
{
    public function execute(SiiTaxDocumentType $siiTaxDocumentType): void
    {
        $siiTaxDocumentType->delete();
    }
}
