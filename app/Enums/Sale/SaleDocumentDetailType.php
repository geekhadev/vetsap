<?php

namespace App\Enums\Sale;

enum SaleDocumentDetailType: string
{
    case Service = 'service';
    case Product = 'product';
    case Custom = 'custom';

    public function label(): string
    {
        return match ($this) {
            self::Service => 'Servicio',
            self::Product => 'Producto',
            self::Custom => 'Personalizado',
        };
    }
}
