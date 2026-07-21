<?php

namespace Database\Factories\Sale;

use App\Enums\Sale\SaleDocumentDetailType;
use App\Enums\Sale\TaxTreatment;
use App\Models\Sale\SaleDocument;
use App\Models\Sale\SaleDocumentDetail;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SaleDocumentDetail>
 */
class SaleDocumentDetailFactory extends Factory
{
    protected $model = SaleDocumentDetail::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $unitPrice = fake()->numberBetween(1000, 50_000);

        return [
            'sale_document_id' => SaleDocument::factory(),
            'detail_type' => SaleDocumentDetailType::Custom,
            'description' => fake()->words(3, true),
            'quantity' => 1,
            'unit_price' => $unitPrice,
            'discount_percent' => 0,
            'discount_amount' => 0,
            'tax_treatment' => TaxTreatment::Exempt,
            'tax_percent' => 0,
            'gross_amount' => $unitPrice,
            'net_amount' => 0,
            'exempt_amount' => $unitPrice,
            'tax_amount' => 0,
            'detail_total' => $unitPrice,
            'sort_order' => 0,
        ];
    }
}
