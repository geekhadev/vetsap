<?php

namespace App\Enums\Sale;

enum SaleDocumentStatus: string
{
    case Draft = 'draft';
    case Issued = 'issued';
    case Voided = 'voided';
    case Merged = 'merged';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Borrador',
            self::Issued => 'Emitido',
            self::Voided => 'Anulado',
            self::Merged => 'Fusionado',
        };
    }
}
