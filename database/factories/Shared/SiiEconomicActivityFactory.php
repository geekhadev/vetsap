<?php

namespace Database\Factories\Shared;

use App\Models\Shared\SiiEconomicActivity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SiiEconomicActivity>
 */
class SiiEconomicActivityFactory extends Factory
{
    protected $model = SiiEconomicActivity::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->numerify('######'),
            'description' => fake()->sentence(3),
            'use_iva' => fake()->boolean(),
            'tax_category' => (string) fake()->numberBetween(1, 9),
            'use_internet' => fake()->boolean(),
        ];
    }
}
