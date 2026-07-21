<?php

namespace App\Enums\Sale;

enum SaleDocumentPaymentStatus: string
{
    case Pending = 'pending';
    case Partial = 'partial';
    case Paid = 'paid';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendiente',
            self::Partial => 'Parcial',
            self::Paid => 'Pagado',
        };
    }

    public static function fromAmounts(int $totalAmount, int $paidAmount): self
    {
        if ($paidAmount <= 0) {
            return self::Pending;
        }

        if ($paidAmount >= $totalAmount) {
            return self::Paid;
        }

        return self::Partial;
    }
}
