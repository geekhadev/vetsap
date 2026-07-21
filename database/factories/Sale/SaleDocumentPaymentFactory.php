<?php

namespace Database\Factories\Sale;

use App\Models\Sale\CashRegister;
use App\Models\Sale\SaleDocument;
use App\Models\Sale\SaleDocumentPayment;
use App\Models\Shared\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SaleDocumentPayment>
 */
class SaleDocumentPaymentFactory extends Factory
{
    protected $model = SaleDocumentPayment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sale_document_id' => SaleDocument::factory()->paid(),
            'cash_register_id' => CashRegister::factory(),
            'payment_method_id' => PaymentMethod::query()->first()?->id ?? PaymentMethod::factory(),
            'amount' => fake()->numberBetween(1000, 50_000),
            'paid_at' => now(),
        ];
    }
}
