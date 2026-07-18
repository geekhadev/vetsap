<?php

namespace Database\Factories\Purchase;

use App\Enums\Purchase\PurchaseOrderStatusColor;
use App\Models\Purchase\PurchaseOrderStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseOrderStatus>
 */
class PurchaseOrderStatusFactory extends Factory
{
    protected $model = PurchaseOrderStatus::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => null,
            'name' => fake()->unique()->words(2, true),
            'color' => fake()->randomElement(PurchaseOrderStatusColor::values()),
            'is_global' => true,
        ];
    }

    public function forCompany(string $companyId): static
    {
        return $this->state(fn (): array => [
            'company_id' => $companyId,
            'is_global' => false,
        ]);
    }
}
