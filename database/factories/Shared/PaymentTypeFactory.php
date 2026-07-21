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
            'is_credit' => false,
        ];
    }

    /**
     * @return $this
     */
    public function credit(): static
    {
        return $this->state(fn (): array => [
            'is_credit' => true,
        ]);
    }
}
