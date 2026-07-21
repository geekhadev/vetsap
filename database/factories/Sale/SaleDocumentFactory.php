<?php

namespace Database\Factories\Sale;

use App\Enums\Sale\SaleDocumentPaymentStatus;
use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Company;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SaleDocument>
 */
class SaleDocumentFactory extends Factory
{
    protected $model = SaleDocument::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'customer_id' => Customer::factory(),
            'status' => SaleDocumentStatus::Draft,
            'payment_status' => SaleDocumentPaymentStatus::Pending,
            'customer_name' => fake()->name(),
            'customer_document_type' => 'rut',
            'customer_document_number' => '11.111.111-1',
            'tax_percent' => 19,
            'tax_amount' => 0,
            'details_discount_percent' => 0,
            'details_discount_amount' => 0,
            'details_discount_net_amount' => 0,
            'details_discount_exempt_amount' => 0,
            'global_discount_percent' => 0,
            'global_discount_amount' => 0,
            'global_discount_net_amount' => 0,
            'global_discount_exempt_amount' => 0,
            'gross_net_amount' => 0,
            'gross_exempt_amount' => 0,
            'net_amount' => 0,
            'exempt_amount' => 0,
            'total_amount' => 0,
            'paid_amount' => 0,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (): array => [
            'status' => SaleDocumentStatus::Issued,
            'payment_status' => SaleDocumentPaymentStatus::Paid,
            'issued_at' => now(),
        ]);
    }

    public function issued(): static
    {
        return $this->state(fn (): array => [
            'status' => SaleDocumentStatus::Issued,
            'payment_status' => SaleDocumentPaymentStatus::Pending,
            'issued_at' => now(),
        ]);
    }
}
