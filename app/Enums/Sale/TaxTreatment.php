<?php

namespace App\Enums\Sale;

enum TaxTreatment: string
{
    case Taxable = 'taxable';
    case Exempt = 'exempt';

    public function label(): string
    {
        return match ($this) {
            self::Taxable => 'Afecto',
            self::Exempt => 'Exento',
        };
    }

    public function isExempt(): bool
    {
        return $this === self::Exempt;
    }
}
