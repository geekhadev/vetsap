<?php

namespace Database\Factories\Sale;

use App\Models\Sale\CashRegister;
use App\Models\Sale\CashRegisterLine;
use App\Models\Shared\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CashRegisterLine>
 */
class CashRegisterLineFactory extends Factory
{
    /**
     * @var class-string<CashRegisterLine>
     */
    protected $model = CashRegisterLine::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $system = fake()->numberBetween(0, 50_000);
        $declared = $system;

        return [
            'cash_register_id' => CashRegister::factory(),
            'payment_method_id' => PaymentMethod::factory(),
            'system_amount' => $system,
            'declared_amount' => $declared,
            'difference' => $declared - $system,
        ];
    }
}
