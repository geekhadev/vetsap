<?php

namespace Database\Seeders\Shared;

use App\Models\Shared\PaymentType;
use Illuminate\Database\Seeder;

class PaymentTypesSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['code' => 'CR', 'name' => 'Crédito', 'is_credit' => true],
            ['code' => 'CO', 'name' => 'Contado', 'is_credit' => false],
            ['code' => 'CR30', 'name' => 'Crédito 30 días', 'is_credit' => true],
        ];

        foreach ($types as $type) {
            PaymentType::query()->updateOrCreate(
                ['code' => $type['code']],
                [
                    'name' => $type['name'],
                    'is_credit' => $type['is_credit'],
                ],
            );
        }
    }
}
