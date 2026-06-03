<?php

namespace Database\Seeders\Shared;

use App\Models\Shared\PaymentType;
use Illuminate\Database\Seeder;

class PaymentTypesSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['code' => 'CR', 'name' => 'Crédito'],
            ['code' => 'CO', 'name' => 'Contado'],
            ['code' => 'CR30', 'name' => 'Crédito 30 días'],
        ];

        foreach ($types as $type) {
            PaymentType::query()->firstOrCreate(
                ['code' => $type['code']],
                ['name' => $type['name']],
            );
        }
    }
}
