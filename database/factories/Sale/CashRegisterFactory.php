<?php

namespace Database\Factories\Sale;

use App\Enums\Sale\CashRegisterStatus;
use App\Models\Company;
use App\Models\CompanyOffice;
use App\Models\Sale\CashRegister;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CashRegister>
 */
class CashRegisterFactory extends Factory
{
    /**
     * @var class-string<CashRegister>
     */
    protected $model = CashRegister::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'office_id' => CompanyOffice::factory(),
            'opened_by_user_id' => User::factory(),
            'opened_at' => now(),
            'opening_amount' => fake()->numberBetween(0, 100_000),
            'status' => CashRegisterStatus::Open,
            'closed_by_user_id' => null,
            'closed_at' => null,
            'notes' => null,
        ];
    }

    public function closed(): static
    {
        return $this->state(fn (): array => [
            'status' => CashRegisterStatus::Closed,
            'closed_by_user_id' => User::factory(),
            'closed_at' => now(),
        ]);
    }
}
