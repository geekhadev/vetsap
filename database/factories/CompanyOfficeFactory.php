<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\CompanyOffice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CompanyOffice>
 */
class CompanyOfficeFactory extends Factory
{
    /**
     * @var class-string<CompanyOffice>
     */
    protected $model = CompanyOffice::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'name' => fake()->unique()->words(3, true),
            'email' => fake()->optional()->companyEmail(),
            'phone' => fake()->optional()->phoneNumber(),
            'address' => fake()->streetAddress(),
            'is_main' => false,
        ];
    }
}
