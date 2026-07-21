<?php

namespace Database\Factories\Shared;

use App\Models\Shared\SiiTaxDocumentType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SiiTaxDocumentType>
 */
class SiiTaxDocumentTypeFactory extends Factory
{
    /**
     * @var class-string<SiiTaxDocumentType>
     */
    protected $model = SiiTaxDocumentType::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => (string) fake()->unique()->numerify('####'),
            'name' => fake()->words(3, true),
            'abbreviation' => strtoupper(fake()->lexify('???')),
            'use_sale' => fake()->boolean(),
            'use_purchase' => fake()->boolean(),
            'is_global' => true,
        ];
    }

    /**
     * @return $this
     */
    public function internal(): static
    {
        return $this->state(fn (): array => [
            'is_global' => false,
        ]);
    }

    /**
     * @return $this
     */
    public function saleOnly(): static
    {
        return $this->state(fn (): array => [
            'use_sale' => true,
            'use_purchase' => false,
        ]);
    }

    /**
     * @return $this
     */
    public function purchaseOnly(): static
    {
        return $this->state(fn (): array => [
            'use_sale' => false,
            'use_purchase' => true,
        ]);
    }
}
