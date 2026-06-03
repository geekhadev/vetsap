<?php

namespace Database\Factories\Shared;

use App\Models\Shared\PaymentType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentType>
 */
class PaymentTypeFactory extends Factory
{
    /**
     * @var class-string<PaymentType>
     */
    protected $model = PaymentType::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'code' => fake()->unique()->regexify('[A-Z]{2,4}'),
        ];
    }
}
