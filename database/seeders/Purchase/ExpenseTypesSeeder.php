<?php

namespace Database\Seeders\Purchase;

use App\Models\Purchase\ExpenseType;
use Illuminate\Database\Seeder;

class ExpenseTypesSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            [
                'name' => 'Boleta de honorarios',
                'abbreviation' => 'BH',
            ],
            [
                'name' => 'Boleta de terceros',
                'abbreviation' => 'BT',
            ],
            [
                'name' => 'Gastos varios',
                'abbreviation' => 'GV',
            ],
        ];

        foreach ($defaults as $row) {
            ExpenseType::query()->firstOrCreate(
                [
                    'company_id' => null,
                    'name' => $row['name'],
                ],
                [
                    'abbreviation' => $row['abbreviation'],
                    'is_global' => true,
                ],
            );
        }
    }
}
