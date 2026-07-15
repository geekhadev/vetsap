<?php

namespace Database\Seeders\Store;

use App\Enums\Store\InventoryMovementType;
use App\Models\Store\MovementCategory;
use Illuminate\Database\Seeder;

class MovementCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $globals = [
            InventoryMovementType::Entry->value => [
                'Compra',
                'Ajuste de entrada',
            ],
            InventoryMovementType::Exit->value => [
                'Venta',
                'Uso interno',
                'Ajuste de salida',
            ],
        ];

        foreach ($globals as $type => $names) {
            foreach ($names as $name) {
                MovementCategory::query()->firstOrCreate(
                    [
                        'company_id' => null,
                        'type' => $type,
                        'name' => $name,
                    ],
                    [
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}
