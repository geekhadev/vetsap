<?php

namespace App\Models\Sale;

use App\Models\Shared\PaymentMethod;
use Database\Factories\Sale\CashRegisterLineFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'cash_register_id',
    'payment_method_id',
    'system_amount',
    'declared_amount',
    'difference',
])]
class CashRegisterLine extends Model
{
    /** @use HasFactory<CashRegisterLineFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'sale_cash_register_lines';

    /**
     * @return BelongsTo<CashRegister, $this>
     */
    public function cashRegister(): BelongsTo
    {
        return $this->belongsTo(CashRegister::class, 'cash_register_id');
    }

    /**
     * @return BelongsTo<PaymentMethod, $this>
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'system_amount' => 'integer',
            'declared_amount' => 'integer',
            'difference' => 'integer',
        ];
    }

    protected static function newFactory(): CashRegisterLineFactory
    {
        return CashRegisterLineFactory::new();
    }
}
